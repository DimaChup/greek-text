npm start


python text2db.py --input data/input/parmenides.txt --limit 10

git reset --hard HEAD
git clean -fd
git branch -D v12


python scripts/text2db.py -i data/input/natureA.txt --copy-to-db
Delete Temporary files
Fill up db_A
node scripts/generate-anki-from-db.js --input src/databases/natureA_db.js --pos VERB,NOUN


python scripts/text2db.py -i data/input/natureB.txt
node scripts/updateWordDatabase.js data/output_natureB/natureB_db.js
Delete temprarry files
Fill up db_B
node scripts/generate-anki-from-db.js --input src/databases/natureB_db_filtered.js --pos VERB,NOUN

python scripts/text2db.py -i data/input/natureC.txt
node scripts/updateWordDatabase.js data/output_natureB/natureC_db.js
delete temporrary files
Fill up db_C
node scripts/generate-anki-from-db.js --input src/databases/natureB_db_filtered_copy.js --pos VERB,NOUN