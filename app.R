
library(shiny)
library(dplyr)
library(jsonlite)

ingredient_edges <- readRDS('data/ingredient_edges2.rds')
ingredient_nodes <- readRDS('data/ingredient_nodes2.rds')

ui <- fluidPage(
  
  tags$script(src="https://d3js.org/d3.v4.min.js"),
  tags$script(src ="d3-scale-chromatic.v1.min.js"),
  tags$script(src="d3_tip.js"),
  tags$link(rel="stylesheet", type="text/css", href="styles.css"),
  
      selectInput("style_input", "",
                  choices=unique(ingredient_nodes$style)),
  
  div(id = "div_graph",
      tags$script(src="graph.js"))
   
)

server <- function(input, output, session) {
  
  update_json <- eventReactive(input$style_input,{
    
    nodes <- filter(ingredient_nodes, style == input$style_input) %>% ungroup()
    links <- filter(ingredient_edges, style == input$style_input) %>% ungroup()
    
    link_filter <- bind_rows(mutate(links, index = row_number()) %>% 
                               select(node = source, value, index),
                             mutate(links, index = row_number()) %>% 
                               select(node = target, value, index)) %>% 
      group_by(node) %>% arrange(node, desc(value)) %>% slice(1:4)
    
    links <- filter(links, row_number() %in% unique(link_filter$index))
    
    link_filter <- bind_rows(mutate(links, index = row_number()) %>% 
                               select(node = source, value, index),
                             mutate(links, index = row_number()) %>% 
                               select(node = target, value, index)) %>% 
      group_by(node) %>% arrange(node, desc(value)) %>% filter(row_number() > 15)
    
    links <- filter(links, !(row_number() %in% unique(link_filter$index)))
    
    node_filter <- unique(c(unique(links$target), unique(links$source)))
    
    nodes <- filter(nodes, id %in% node_filter)
    
    update_json <- toJSON(list(nodes = nodes,
                            links = links))
    
  })
  
  observe(session$sendCustomMessage(type="init", update_json()))
   
}

shinyApp(ui = ui, server = server)

