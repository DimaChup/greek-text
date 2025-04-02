pip freeze > requirements.txt
pip install -r requirements.txt
python -m venv venv





npm start
node server.js 

python -m spacy download es_core_news_sm  # For Spanish
python scripts/enrich_database_nlp.py --input src/databases/temp_text_1742731281901_db.js --output src/databases/temp_text_1742731281901_nlp_enriched_db.js --language es


python text2db.py --input data/input/parmenides.txt --limit 10

git reset --hard HEAD
git clean -fd
git branch -D v12


python scripts/text2db.py -i data/input/natureA.txt --copy-to-db
python scripts/delete_output_dir.py -t natureA
Fill up db_A
node scripts/generate-anki-from-db.js --input src/databases/natureA_db.js --pos VERB,NOUN


python scripts/text2db.py -i data/input/natureB.txt
node scripts/updateWordDatabase.js data/output_natureB/natureB_db.js
python scripts/delete_output_dir.py --text natureB
Fill up db_B
node scripts/generate-anki-from-db.js --input src/databases/natureB_db_filtered.js --pos VERB,NOUN

python scripts/text2db.py -i data/input/natureC.txt
node scripts/updateWordDatabase.js data/output_natureB/natureC_db.js
delete temporrary files
Fill up db_C
node scripts/generate-anki-from-db.js --input src/databases/natureB_db_filtered_copy.js --pos VERB,NOUN