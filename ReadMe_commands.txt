npm start


python text2db.py --input data/input/parmenides.txt --limit 10

git reset --hard HEAD
git clean -fd



python scripts/text2db.py -i data/input/natureA.txt --copy-to-db
Fill up db_A
Generate Anki for Noun and Verb


python scripts/text2db.py -i data/input/natureB.txt
node scripts/updateWordDatabase.js data/output_natureB/natureB_db.js
Fill up db_B
Generate Anki for Noun and Verb

python scripts/text2db.py -i data/input/natureC.txt
node scripts/updateWordDatabase.js data/output_natureB/natureC_db.js
Fill up db_C
Generate Anki for Noun and Verb