
library(shiny)
library(dplyr)
library(jsonlite)

ingredient_edges <- readRDS('data/ingredient_edges.rds')
ingredient_nodes <- readRDS('data/ingredient_nodes.rds')

ingredient_edges <- rename(ingredient_edges, source = V1, target = V2, value = count)
ingredient_nodes <- rename(ingredient_nodes, id = ing_final, value = count)

nodes <- filter(ingredient_nodes, style == 'IPA') %>% ungroup()
links <- filter(ingredient_edges, style == 'IPA') %>% ungroup()

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

json_obj <- toJSON(list(nodes = nodes,
                links = links))

ui <- fluidPage(
  
  tags$script(src="https://d3js.org/d3.v4.min.js"),
  tags$link(rel="stylesheet", type="text/css", href="styles.css"),
  
  div(id = "div_graph",
      tags$script(src="graph.js"))
   
)

server <- function(input, output, session) {
  
  session$sendCustomMessage(type="init", json_obj)
   
}

shinyApp(ui = ui, server = server)

