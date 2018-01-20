node_lookup <- ingredient_nodes %>% 
  group_by(ing_type, ing_final) %>% summarise()


# write.csv(node_lookup, 'data/node_lookup.csv', row.names = F)

library(rvest)
library(stringr)
library(readxl)

xpath <- '/html/body/div[3]/div[2]/div/div/div[5]/div[1]/div/div[2]/div[2]/table'
url <- 'https://www.homebrewsupply.com/learn/homebrew-malt-comparison-chart.html'

df <- url %>%
  read_html() %>%
  html_nodes(xpath=xpath) %>% 
  html_table(header=T) %>% as.data.frame()

df <- df %>% 
  mutate(clean_name = tolower(Name))

# write.csv(df, 'data/grain_scrape.csv', row.names = F)

url2 <- 'https://www.brewersfriend.com/2008/09/14/hops-alpha-acid-table/'
xpath2 <- '//*[@id="post-169"]/table'

df2 <- url2 %>% 
  read_html() %>% 
  html_nodes(xpath = xpath2) %>% 
  html_table(header = T) %>% as.data.frame()

df2 <- df2 %>% 
  mutate(clean_name = tolower(Hops))

# write.csv(df2, 'data/hop_scrape.csv', row.names = F)

#---------------------------------------------------#
#add color scales to node rds file

ingredient_nodes <- readRDS('data/ingredient_nodes.rds')
#reset
ingredient_nodes <- select(ingredient_nodes, -c(srm, aa_group))

grain_colors <- read_excel('data/node_color_master.xlsx', sheet = 'grains')
hop_colors <- read_excel('data/node_color_master.xlsx', sheet = 'hops')

ingredient_nodes <- ingredient_nodes %>% 
  left_join(select(grain_colors, ing_final, srm), by = 'ing_final') %>% 
  left_join(select(hop_colors, aa_group, ing_final), by = 'ing_final')

#check completeness
ingredient_nodes %>% 
  group_by(ing_type) %>% summarise(aa = sum(aa_group), srm = sum(SRM))

saveRDS(ingredient_nodes, 'data/ingredient_nodes.rds')
############################################################
#old
ingredient_edges <- readRDS('data/ingredient_edges.rds')
ingredient_nodes <- readRDS('data/ingredient_nodes.rds')

ingredient_edges <- rename(ingredient_edges, source = V1, target = V2, value = count)
ingredient_nodes <- rename(ingredient_nodes, id = ing_final, value = count)
###

#new#
saveRDS(ingredient_nodes, 'data/ingredient_nodes2.rds')
saveRDS(ingredient_edges, 'data/ingredient_edges2.rds')

