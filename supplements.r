node_lookup <- ingredient_nodes %>% 
  group_by(ing_type, ing_final) %>% summarise()


write.csv(node_lookup, 'node_lookup.csv', row.names = F)

library(rvest)
library(stringr)

xpath <- '/html/body/div[3]/div[2]/div/div/div[5]/div[1]/div/div[2]/div[2]/table'
url <- 'https://www.homebrewsupply.com/learn/homebrew-malt-comparison-chart.html'

df <- url %>%
  read_html() %>%
  html_nodes(xpath=xpath) %>% 
  html_table(header=T) %>% as.data.frame()

df <- df %>% 
  mutate(clean_name = tolower(Name))

url2 <- 'https://www.brewersfriend.com/2008/09/14/hops-alpha-acid-table/'
xpath2 <- '//*[@id="post-169"]/table'

df2 <- url2 %>% 
  read_html() %>% 
  html_nodes(xpath = xpath2) %>% 
  html_table(header = T) %>% as.data.frame()

df2 <- df2 %>% 
  mutate(clean_name = tolower(Hops))

node_lookup <- node_lookup %>% 
  mutate(clean_name = tolower(ing_final)) %>% 
  left_join(df, by = 'clean_name') %>% 
  left_join(df2, by = 'clean_name')
