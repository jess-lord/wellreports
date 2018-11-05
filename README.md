Event: FORCE Machine Learning Hackathon, Stavanger 2018 https://events.agilescientific.com/event/force-hackathon

Project: Extract good shows from 400 well reports https://events.agilescientific.com/project/extract-oil-show-confidence-from-pdf-reports

Team: Jesse Lord, Anne Estoppey, Kaouther Hadji, Chris Olsen, Florian Basier

Methodology:
1. OCR PDFs (provided: https://drive.google.com/drive/folders/1ew1Re1LhLSOvculHYPrzqcKiYU3Oo3rU)
2. Extract text from PDFs
3. Find common phrases, beyond the obvious "good shows"
4. For each phrase, search for a 4 digit number that is nearby in the document
5. SMEs label each of the matches as a good show, or not
6. Train/Test split, vectorization, then linear regression
7. Visualise matches at depth on a map, and colour code confidence for each match. Run the UI using NPM, then choose the included csv once presented with the interface. 

The pipeline module contains the code blocks required to perform the above methodology. 
Each block typically outputs to a csv, that is picked up by the next:
1. phrases_csv will generate bigrams and trigrams from a list of indicators
2. extract_pdf will read pdfs (expected to be in data\reports) to a dataframe
3. count_phrases stores the count of phrases (from step 1) found in the pdf text dataframe 
4. top_phrases shows the top n phrases using the count_phrases csv: most hits and most docs 
5. extract_phrases searches for nearby 4 digit numbers in each document, for each phrase, and stores the word distance between phrase and depth
6. label starts an interactive labelling of the matches found in step 5
7. wb_xy uses regex to get the wellbore from each filename, then the coordinates found in data\csv\wb_latlon.csv to assign a location to each wellbore
8. learn performs a train/test split, applies a count vectorizer, adds depth and distance as features, then performs logistic regression, outputting auc and confidence

Results:
Using only the phrase 'good show', 44 matches with depth were found. After splitting there were only 11 records left to test on. While the results were perfect, this clearly isn't enough of a sample size to draw any meaningful conclusions. Our next step, if we had the time, was to select common phrases generated from the indicators vocabulary, and run this pipeline again. 

The count/top phrase searches for trigrams did not complete before the event was done, but we did have a look at the top bigrams:

Top 20 phrases across all documents (most hits):

	as f                   3369.0
	very f                 3250.0
	very fine              2842.0
	v f                    2249.0
	f wh                   2076.0
	v sl                   1804.0
	as above               1802.0
	red f                  1800.0
	cut f                  1783.0
	v bl                   1608.0
	v blk                  1580.0
	yel brn                1578.0
	slightly calcareous    1535.0
	wh f                   1420.0
	sl slty                1287.0
	dk brn                 1184.0
	bl wh                  1179.0
	wh cut                 1114.0
	yel wh                 1082.0
	yel f                  1010.0
	dtype: float64

Top 20 phrases across all documents (most docs):

	as f                   336
	very f                 314
	red f                  299
	very fine              286
	f wh                   268
	slightly calcareous    252
	f v                    252
	cut f                  237
	as cut                 235
	as v                   232
	slightly silty         225
	mud f                  211
	f mud                  202
	v f                    193
	f hydrocarbon          187
	very calcareous        183
	f pyrite               183
	v sl                   172
	pale yel               167
	red brown              165
	dtype: int64

Top phrases (hits and docs): 

	as above
	as cut
	as f
	as v
	bl wh
	cut f
	dk brn
	f hydrocarbon
	f mud
	f pyrite
	f v
	f wh
	mud f
	pale yel
	red brown
	red f
	sl slty
	slightly calcareous
	slightly silty
	v bl
	v blk
	v f
	v sl
	very calcareous
	very f
	very fine
	wh cut
	wh f
	yel brn
	yel f
	yel wh
	
Update: Trigrams finally finished.
Top 20 phrases across all documents (most hits): 

	bl wh f                   492.0
	yel wh f                  418.0
	wh cut f                  346.0
	dull yel f                236.0
	as cut f                  233.0
	wh cut fluor              225.0
	bl wh cut                 210.0
	dk yel brn                207.0
	white cut f               199.0
	blue white f              194.0
	blue white fluor          193.0
	dull yel fluor            192.0
	bl wh fluor               186.0
	yel wh cut                181.0
	white cut fluor           179.0
	brn oil stn               155.0
	dark yellow brown         150.0
	f very fine               145.0
	wk bl wh                  141.0
	white cut fluorescence    138.0
	dtype: float64
	
Top 20 phrases across all documents (most docs): 

	as cut f                    102
	f very fine                  79
	pale yellow brown            70
	dark yellow brown            62
	f hydrocarbon show           61
	wh cut f                     60
	dk yel brn                   59
	white cut f                  57
	white cut fluor              53
	yel wh f                     53
	dull yellow f                51
	dull yel f                   51
	dark yellowish brown         49
	dull yellow fluor            49
	white cut fluorescence       47
	yellow white f               45
	yel wh cut                   44
	yellow white fluor           43
	wh cut fluor                 41
	dull yellow fluorescence     38
	dtype: int64

Top phrases (hits and docs): 
	as cut f  
	bl wh cut  
	bl wh f  
	bl wh fluor  
	blue white f  
	blue white fluor  
	brn oil stn  
	dark yellow brown  
	dark yellowish brown  
	dk yel brn  
	dull yel f  
	dull yel fluor  
	dull yellow f  
	dull yellow fluor  
	dull yellow fluorescence  
	f hydrocarbon show  
	f very fine  
	pale yellow brown  
	wh cut f  
	wh cut fluor  
	white cut f  
	white cut fluor  
	white cut fluorescence  
	wk bl wh  
	yel wh cut  
	yel wh f  
	yellow white f  
	yellow white fluor  
  
	