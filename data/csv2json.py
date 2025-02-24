import os
import csv
import json
import time
import openai
import argparse
from pathlib import Path

# Set your OpenAI API key via environment variable or directly here:
openai.api_key = os.getenv("OPENAI_API_KEY", "your_api_key_here")

# Detailed prompt with instructions
PROMPT_TEMPLATE = """
You are a meticulous linguistic analyst specializing in Ancient Greek. Your task is to create a comprehensive JSON database from the following raw CSV data representing a fragment of an Ancient Greek text (likely Parmenides). This JSON database will serve as a detailed lexicon for this fragment.

Input Data (CSV):
Line Number: {lineNumber}
Word Order: {wordOrder}
Word: {word}

Output Format (JSON):
The output should be a single, valid JSON object with the following keys:
{word}:
- lineNumber: (String) The line number in the original text where the word appears.
- wordOrder: (String) The word's position within its line.
- partOfSpeech: (String) The grammatical part of speech (e.g., "Noun", "Verb", "Adjective", "Adverb", "Preposition", "Conjunction", "Pronoun", "Particle", "Article"). Be precise.
- morphology: (String) A detailed morphological analysis. For Ancient Greek: Nouns, Adjectives, and Pronouns should include case, number, and gender; Verbs should include tense, mood, voice, person, and number; for particles, conjunctions, prepositions, and adverbs, use "" if not applicable.
- meanings: (Array of Strings) Up to five possible English translations for the word, ordered from most likely to least likely.
- bestTranslation: (String) The single best English translation of the word.
- lemma: (String) The dictionary form of the word (nominative singular for nouns/adjectives/pronouns; present active infinitive for verbs).
- bestLemmaTranslation: (String) The best English translation of the lemma.

Process Instructions:
- Process the input CSV data line by line.
- For each row, generate a JSON object with the above keys.
- Output only a valid JSON object.

Output:
Return only a valid JSON object.

"""

def process_csv_row(row):
    # Expect CSV columns: "Line Number", "Word Order", "Word"
    return {
        "lineNumber": row["Line Number"].strip(),
        "wordOrder": row["Word Order"].strip(),
        "word": row["Word"].strip()
    }

def call_llm_for_row(word_data):
    prompt = PROMPT_TEMPLATE.format(**word_data)
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a linguistic expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0,
            max_tokens=300
        )
        reply_text = response["choices"][0]["message"]["content"]
        return json.loads(reply_text)
    except Exception as e:
        print(f"Error processing word '{word_data['word']}': {e}")
        return None

def process_csv_file(csv_path, limit):
    csv_path = Path(csv_path)
    output_entries = []
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        count = 0
        for row in reader:
            if count >= limit:
                break
            word_data = process_csv_row(row)
            print(f"Processing word: {word_data['word']} (Line {word_data['lineNumber']}, Order {word_data['wordOrder']})")
            entry = call_llm_for_row(word_data)
            if entry:
                output_entries.append(entry)
            else:
                output_entries.append(word_data)
            count += 1
            time.sleep(1)  # Delay to respect rate limits
    output_json_path = csv_path.parent / (csv_path.stem + "_wordDatabase.json")
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(output_entries, f, ensure_ascii=False, indent=2)
    print(f"Final JSON database saved to: {output_json_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate JSON database from CSV word list.")
    parser.add_argument("--csv", type=str, default="data/output_on_nature_short/on_nature_short_word_list.csv",
                        help="Path to the input CSV file")
    parser.add_argument("--limit", type=int, default=20,
                        help="Number of words to process (default: 20)")
    args = parser.parse_args()

    process_csv_file(args.csv, args.limit)
