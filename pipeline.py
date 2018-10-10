from bisect import bisect_left
import matplotlib.pyplot as plt
import nltk
import os
import pandas as pd
from PyPDF2 import PdfFileReader
import re
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics import auc, roc_auc_score, roc_curve
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import sys


def label_text(df: pd.DataFrame):
    for i in range(0, len(df)):
        response = input("Good show at depth {}? (input 1 for yes, otherwise press enter)\n\t{}".format(df.iloc[i].depth, df.iloc[i].text_highlight))
        if not response == "1":
            response = 0
        df.at[i, "target"] = response
    return df


def pdf_text(file):
    pdf = PdfFileReader(open(file, "rb"))
    num_pages = pdf.numPages
    count = 0
    text = ""
    while count < num_pages:
        pageObj = pdf.getPage(count)
        count += 1
        text += pageObj.extractText()
    return text


def find_phrase(phrase: str(), text_series: pd.Series, regex=False):
    s = text_series
    if regex:
        phrase_tok = [phrase]
        match_candidates = s[s.str.contains(phrase_tok[0], flags=re.IGNORECASE, regex=True)].index.tolist()
    else:
        phrase_tok = nltk.word_tokenize(phrase)
        match_candidates = s[s.str.lower() == phrase_tok[0]].index.tolist()
    matches = pd.Series(match_candidates)
    # all matches for the first token in the 1-3 word phrase
    # for multiword phrases all tokens must match completely and sequentially
    if len(phrase_tok) == 2:
        for i in range(0, len(match_candidates)-1):
            if s.iloc[match_candidates[i] + 1] != phrase_tok[1]:
                matches.drop(matches[matches == match_candidates[i]].index, inplace=True)
    elif len(phrase_tok) == 3:
        for i in range(0, len(match_candidates) - 2):
            if s.iloc[match_candidates[i] + 1] != phrase_tok[1] or s.iloc[match_candidates[i] + 2] != phrase_tok[2]:
                matches.drop(matches[matches == match_candidates[i]].index, inplace=True)
    else:
        print("Error: Cannot search for \"{}\". Maximum phrase length is three words.".format(phrase))
        sys.exit(1)
    return matches.tolist()


def closest_depth(phrase: str(), phrase_index: int(), context: pd.Series, corpus: pd.Series, verbose=False):
    # given the phrase index and context, find the closest 4 digit number
    # return it, and the distance (in words) between the phrase and the 4 digit number, as well as the index number
    digits = find_phrase("^\d{4},\d$|^\d{4}\.\d$|^\d{4}$|\d{4}-\d{4}|\d{4},\d-\d{4},\d", context, regex=True)
    if len(digits) == 0:
        return None
    pos = bisect_left(digits, phrase_index)
    if pos == len(digits):
        closest_digit_index = digits[-1]
    else:
        closest_digit_index = digits[pos]
    closest_digit = corpus.iloc[closest_digit_index]
    closest_digit = closest_digit[:4]  # just take the first four numbers
    closest_digit_distance = closest_digit_index - phrase_index
    if verbose:
        print("Closest 4 digit number to phrase \"{}\" is {}, with a distance of {}. The context searched was: \n {}".format(phrase, closest_digit, closest_digit_distance, " ".join(context.tolist())))
    return closest_digit, closest_digit_distance, closest_digit_index


def add_feature(X, feature_to_add):
    # Returns sparse feature matrix with added feature.
    # feature_to_add can also be a list of features.
    from scipy.sparse import csr_matrix, hstack
    return hstack([X, csr_matrix(feature_to_add).T], 'csr')


def plot_auc(fpr, tpr, roc_auc, save=False):
    plt.figure()
    plt.xlim([-0.01, 1.00])
    plt.ylim([-0.01, 1.01])
    plt.plot(fpr, tpr, lw=3, label='ROC curve (area = {:0.2f})'.format(roc_auc))
    plt.xlabel('False Positive Rate', fontsize=16)
    plt.ylabel('True Positive Rate', fontsize=16)
    plt.title('ROC curve (1-of-10 digits classifier)', fontsize=16)
    plt.legend(loc='lower right', fontsize=13)
    plt.plot([0, 1], [0, 1], color='navy', lw=3, linestyle='--')
    plt.axes().set_aspect('equal')
    if save:
        plt.savefig('auc.png')
    else:
        plt.show()


def generate_phrases(phrase_length=int(), phrases=list()):
    output = []
    phrases = pd.Series(phrases).sort_values().unique()
    if phrase_length == 3:
        for i in range(len(phrases)):
            for j in range(len(phrases)):
                for k in range(len(phrases)):
                    if i != j and i != k and j != k:
                        output.append(phrases[i] + ' ' + phrases[j] + ' ' + phrases[k])
    elif phrase_length == 2:
        for i in range(len(phrases)):
            for j in range(len(phrases)):
                if i != j:
                    output.append(phrases[i] + ' ' + phrases[j])
    return pd.Series(output)


def extract_wb(filename: str()):
    wb = filename.lower().split("__")[0]
    if ".pdf" in wb:
        wb = wb.split("_completion")[0]
    if ".pdf" in wb:
        wb = wb.split("_well")[0]
    if ".pdf" in wb:
        wb = wb.split("_and")[0]
    if ".pdf" in wb:
        wb = wb.split("_pb")[0]
    if '_' not in wb and '-' in wb:
        wb = wb.replace('-', '_', 1)
    if not wb[0].isdigit():
        wb = re.match(r'[a-zA-Z ]+(\d.+)', wb, re.U).groups()[0]
    wb = wb.replace('_', '/', 1)
    wb = wb.replace('_', ' ', 1)
    wb = re.sub(r'/0(\d)', r'/\1', wb)
    wb = re.sub(r'-0(\d)', r'-\1', wb)
    wb = wb.replace('-s', ' s')
    if not wb[-1].isdigit() and wb[-2].isdigit():
        wb = wb[:-1] + ' ' + wb[-1]
    return wb.upper()


def main():
    phrases_csv = False
    if phrases_csv:
        indicators = ['good', 'show', 'fluorescence', 'mineral', 'material', 'color', 'minerals', 'dolomite',
                          'magnesian', 'limestones', 'yellow', 'yellowish', 'brown', 'dark', 'aragonite', 'calcareous',
                          'mudstones', 'white', 'pale', 'chalky', 'purple', 'foliated', 'shales', 'tan', 'grayish',
                          'anhydrite', 'blue', 'mid', 'gray', 'pyrite', 'mustard', 'greenish', 'diesel', 'fuel',
                          'bright', 'bluish', 'oil', 'cut', 'pipe', 'dope', 'mud', 'flour', 'fluor', 'fluorescent',
                          'flourescent', 'cream', 'orange', 'odor', 'faint', 'fair', 'strong', 'heavy', 'hydrocarbons',
                          'hydrocarbon', 'smell', 'dd', 'dead', 'aa', 'as', 'above', 'abdnt', 'abundant', 'dif',
                          'diffuse', 'dk', 'dark', 'dl', 'dull', 'dp', 'depth', 'choc', 'chocolate', 'drsy', 'drusy',
                          'clr', 'clear', 'f', 'fine', 'fld', 'feldspathic', 'col', 'flky', 'flaky', 'fltg', 'floating',
                          'fst', 'fast', 'bit', 'bituminous', 'fnt', 'bkgrd', 'background', 'bl', 'blk', 'black',
                          'blmg', 'blooming', 'bri', 'ct', 'cuttings', 'brn', 'fros', 'frosted', 'yel', 'resd',
                          'residual', 'red', 'rdsh', 'reddish', 'trmln', 'tourmaline', 'trnsl', 'translucent', 'trnsp',
                          'transparent', 'tt', 'tight', 'v', 'very', 'var', 'variably', 'shn', 'sheen', 'vge', 'vague',
                          'vis', 'visible', 'sl', 'slightly', 'slky', 'silky', 'wkly', 'weakly', 'wh', 'slty', 'silty',
                          'wk', 'weak', 'spt', 'spotty', 'spk', 'specks', 'wshg', 'washing', 'wxy', 'waxy', 'stk',
                          'streaks', 'stky', 'sticky', 'stn', 'staining', 'stnd', 'stained', 'stw', 'straw', 'very']

        df = generate_phrases(2, indicators)
        df.to_csv(r'data\csv\bigrams.csv')
        df = generate_phrases(3, indicators)
        df.to_csv(r'data\csv\trigrams.csv')

    extract_pdf = False
    if extract_pdf:
        for root, directories, filenames in os.walk(r'data\reports'):
            records = []
            for filename in filenames:
                if '.pdf' in filename.lower():
                    path = os.path.join(root, filename)
                    print(filename)
                    output = pdf_text(path)
                    this_dict = {"filename": filename, "text": output}
                    records.append(this_dict)
            df = pd.DataFrame.from_records(records)
            df.to_csv(r'data\csv\df_text_raw.csv')

    count_phrases = False
    if count_phrases:
        # count the top phrases to find candidates worth doing a depth search on
        df = pd.read_csv(r'data\csv\df_text_raw.csv', index_col=0)
        bigrams = pd.read_csv(r'data\csv\bigrams.csv', index_col=0, header=None)[1].tolist()
        #trigrams = pd.read_csv(r'data\csv\trigrams.csv', index_col=0, header=None)[1].tolist()
        ngrams = [bigrams] #, trigrams]
        for phrases in ngrams:
            records = []
            for i in range(len(phrases)):
                phrase = phrases[i]
                if i % 100 == 0:
                    print("{}/{} ({:0.2f}%) Counting <<{}>>".format(i + 1, len(phrases), ((i + 1) / len(phrases)) * 100, phrase))
                df[phrase] = df.text.str.count(phrase)
            df.drop('text', axis=1, inplace=True)
            df.to_csv(r'data\csv\top_phrases_{}.csv'.format(len(phrases[0].split(' '))))

    top_phrases = False
    if top_phrases:
        # read the top_phrases csv and get the top n phrases by count and by doc count
        df = pd.read_csv(r'data\csv\top_phrases_2.csv', index_col=0)
        top_n = 20
        print("Top {} phrases across all documents (most hits):".format(top_n))
        top_hits = df.sum(axis=0, numeric_only=True).T.sort_values(ascending=False).head(top_n)
        print(top_hits)
        top_docs = pd.Series([len(df[df[x] > 0].filename.unique()) for x in df.columns.tolist()[1:]],
                             index=df.columns.tolist()[1:]).sort_values(ascending=False).head(top_n)
        print("\nTop {} phrases across all documents (most docs):".format(top_n))
        print(top_docs)
        common_phrases = list({*top_hits.index.tolist(), *top_docs.index.tolist()})
        common_phrases.sort()
        print("Top phrases (hits and docs): \n\t{}".format('\n\t'.join(common_phrases)))

    extract_phrases = False
    if extract_phrases:
        df = pd.read_csv(r'data\csv\df_text_raw.csv', index_col=0)
        records = []
        for i in range(0, len(df)):
            # tokenize the raw text and put it in a Series
            try:
                text_series = pd.Series(nltk.word_tokenize(df.iloc[i].text), dtype='str')
            except:
                text_series = ''
                print("Error parsing text from {}. Has OCR been performed?".format(df.iloc[i].filename))
            if len(text_series) > 0:
                # enter desired phrases as a list. Phrases should be lower case and can be 1-3 words.
                if top_phrases:
                    phrases = common_phrases
                else:
                    phrases = ["good shows", "abundant hydrocarbons"]
                # specify how many words, forwards and backwards, to search for a nearby 4 digit number (likely to be depth)
                breadth = 50
                for phrase in phrases:
                    # get the initial index of the each phrase in the text Series
                    phrase_indexes = find_phrase(phrase, text_series)
                    for phrase_index in phrase_indexes:
                        # extract the surrounding words, according to the breadth variable
                        context = text_series.iloc[phrase_index - breadth:phrase_index + breadth]
                        # find the nearest 4 digit number
                        depth = closest_depth(phrase, phrase_index, context, text_series, verbose=False)
                        # if found, the return will be depth, distance and index
                        if depth:
                            depth_index = depth[2]
                            # highlight the phrase and the depth to prepare for human labelling
                            context_highlight = context.copy()
                            context_highlight.at[depth_index] = "<<" + context_highlight.ix[depth_index] + ">>"
                            phrase_len = len(phrase.split(" "))
                            if phrase_len > 1:
                                phrase_len -= 1
                                context_highlight.at[phrase_index] = "<<" + context_highlight.ix[phrase_index]
                                context_highlight.at[ phrase_index +phrase_len] = context_highlight.ix[phrase_index + phrase_len] + ">>"
                            elif phrase_len == 1:
                                context_highlight.at[phrase_index] = "<<" + context_highlight.ix[phrase_index] + ">>"
                            # write the results to a dict, append to the records list
                            record = {"filename": df.iloc[i].filename, "phrase": phrase, "depth": depth[0],
                                      "distance": depth[1], "text": " ".join(context.tolist()),
                                      "text_highlight": " ".join(context_highlight.tolist())}
                            records.append(record)
                            print("{}: found depth \"{}\" near \"{}\"".format(df.iloc[i].filename, depth[0], phrase))
        # write results to csv
        extracted_phrases_df = pd.DataFrame.from_records(records)
        extracted_phrases_df.to_csv(r'data\csv\extracted_phrases.csv')

    label = False
    if label:
        df = pd.read_csv(r'data\csv\extracted_phrases.csv', index_col=0)
        df['target'] = 0
        df = label_text(df)
        df.to_csv(r'data\csv\extracted_phrases_labelled.csv')

    wb_xy = False
    if wb_xy:
        # add the wellbores with lat lon to the output csv
        wb = pd.read_csv(r'data\csv\wb_latlon.csv', index_col=0)
        df = pd.read_csv(r'data\csv\extracted_phrases_labelled.csv', index_col=0)
        df['well'] = [extract_wb(x) for x in df.filename.tolist()]
        df['well_lat'] = [wb.lat[wb.well == x].values[0] for x in df.well.tolist()]
        df['well_lon'] = [wb.lon[wb.well == x].values[0] for x in df.well.tolist()]
        cols = df.columns.tolist()
        # reorder so that target is the final column
        cols = cols[:-4] + cols[-3:] + cols[-4:-3]
        df = df[cols]
        df.to_csv(r'data\csv\extracted_phrases_labelled_wb.csv')

    learn = False
    if learn:
        df_input = pd.read_csv(r'data\csv\extracted_phrases_labelled_wb.csv', index_col=0)
        df = df_input[['depth', 'distance', 'filename', 'phrase', 'text', 'text_highlight',
                       'well', 'well_lat', 'well_lon', 'target']]
        # Split, make Train, add depth and distance as features
        X_train, X_test, y_train, y_test = train_test_split(df.iloc[:, :-1], df.target, random_state=0)
        vect = CountVectorizer().fit(X_train.text)
        X_train_vectorized = vect.transform(X_train.text)
        X_train_vectorized = add_feature(X_train_vectorized, X_train.depth)
        X_train_vectorized = add_feature(X_train_vectorized, X_train.distance)

        # make Test, then add depth and distance as features to test
        vect_test = vect.transform(X_test.text)
        vect_test = add_feature(vect_test, X_test.depth)
        vect_test = add_feature(vect_test, X_test.distance)

        # classify, output confidence to csv
        clf = LogisticRegression(C=100).fit(X_train_vectorized, y_train)
        y_scores = clf.predict(vect_test)
        pred_proba = clf.predict_proba(vect_test)
        X_test['confidence'] = pred_proba[:, 1]
        X_test.to_csv(r'data\csv\predictions.csv')

        print("AUC Score on test data: {}".format(roc_auc_score(y_test, y_scores)))
        for i in range(0, len(X_test)):
            print("Confidence: {}, Text: {}".format(pred_proba[i, 1], X_test.iloc[i].text_highlight))
        # make an ROC curve and save it
        fpr, tpr, _ = roc_curve(y_test, y_scores)
        roc_auc = auc(fpr, tpr)
        plot_auc(fpr, tpr, roc_auc, save=True)


if __name__ == "__main__":
    main()
