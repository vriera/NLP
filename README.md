# TP NLP

Esta es la primera entrega del trabajo práctico de NLP, donde se obtiene el corpus.

# Guia de uso

# Instalar las dependencias de node y python

```
cd scrapers/boletines
mkdir data_fetched
npm i
cd ..
cd ..
pip install wordcloud
pip install nltk
pip install matplotlib
pip install pandas
pip install unicodedata
pip install sklearn
pip install scikit-learn
pip install spacy
```


## Obtener los boletines


```
cd scrapers/boletines
npm run start scrape data_fetched
```
## parsear los boletines
```
npm run start parse data_fetched data.csv
```

## Correr analisis
Desde la carpeta root
```
py ./app.py
```