from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from wordcloud import WordCloud
import pandas as pd
from nltk.corpus import stopwords
import matplotlib.pyplot as plt
import re
import nltk
import unicodedata
import numpy as np
import spacy

nltk.download("stopwords")
stopwords = set(stopwords.words('spanish')) 
shortword = re.compile(r'\W*\b\w{1,3}\b')
nlp = spacy.load("es_core_news_md")


def to_lemma(text, csv_path):
    tokens = []
    title_lemmas= []
    for field in text:
        field_clean = " ".join(field.replace(',',' ').replace('.', ' ').split())
        doc = nlp(field_clean)
        title_lemma = []
        for token in doc:
            tokens.append(token.lemma_)
            title_lemma.append(token.lemma_)
        title_lemmas.append(" ".join(title_lemma))

    tokens = " ".join(tokens)
    #print(tokens)
    pd.DataFrame(title_lemmas).to_csv( csv_path, sep=';')
    return title_lemmas
    
def wordcloud_from_column(column):
    text = " ".join(column)
    wordcloud = WordCloud(stopwords=stopwords).generate(text)
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis("off")
    plt.show()
    return text

def remove_accents(input_str):
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    only_ascii = nfkd_form.encode('ASCII', 'ignore')
    return only_ascii

def clean_column(column):
    #lo paso a minuscula y uno las continuaciones de linea
    text = [ re.sub("- " , "" , str(x[0]).lower()) for x in column ]
    #le saco los acentos
    text = [ str(remove_accents(x)) for x in text ]
    #saco las palabras cortas
    text = [shortword.sub('', x) for x in text]
    #saco los espacios extra
    text = [ " ".join(x.split()) for x in text]
    #print(text)
    return text
    

def run_cv(data):
    cv = CountVectorizer(ngram_range=[1,1], max_df=0.8, min_df=2, max_features=None, stop_words=stopwords)
    data_cv = cv.fit_transform(data)
    print(f'El vocabulario es: {cv.get_feature_names_out()}')
    print(f'El tamaño del vocabulario es: {len(cv.get_feature_names_out())}')
    doc_freq = np.array(data_cv.astype(bool).sum(axis=0)).flatten()
    print("doc_freq:" , doc_freq)


def main():
    csv = pd.read_csv("./scrapers/boletines/out/fetched.csv",delimiter=";")
    #print(csv.iloc[: , 5:8])
    categorias = clean_column(csv.iloc[:,5:6].values.tolist())
    titulos = clean_column(csv.iloc[:,6:7].values.tolist())
    descripciones = clean_column(csv.iloc[:,7:8].values.tolist())
    print("Count Vectorize titulos:")
    run_cv(titulos)
    print("Count Vectorize descripciones:")
    run_cv(descripciones)
    print("WordCloud titulo:")
    wordcloud_from_column(titulos)
    print("WordCloud descripcion:")
    wordcloud_from_column(descripciones)
    print("WordCloud titulo lematizado:")
    wordcloud_from_column(to_lemma(titulos,"./lemma_titles.csv"))
    print("WordCloud descripcion:")
    wordcloud_from_column(to_lemma(descripciones,"./lemma_description.csv"))
    #wordmap_from_column(titulos)
    return 
main()