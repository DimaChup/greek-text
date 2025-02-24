import os
import csv
import json
import time
import re
import argparse
import openai
from pathlib import Path

# Set your OpenAI API key via environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")

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

def create_word_list_from_text(text):
    """
    Creates a list of words with their line numbers and word order from input text.
    
    Args:
        text: Input text string
        
    Returns:
        List of dictionaries with keys: "Line Number", "Word Order", "Word"
    """
    lines = text.strip().split('\n')
    word_list = []
    word_order = 1
    
    for line_num, line in enumerate(lines, 1):
        # Remove line numbers like "1. " at the beginning of the line
        line = re.sub(r"^\s*\d+\.\s*", "", line)
        
        # Tokenize, keeping apostrophes but removing other punctuation
        words = re.findall(r"[\w''\-]+|[,;]", line)
        
        for word in words:
            # Remove punctuation marks that we don't need separately
            if word not in [",", "·", "..."]:
                word_list.append({
                    "Line Number": str(line_num),
                    "Word Order": str(word_order),
                    "Word": word
                })
                word_order += 1
                
    return word_list

def call_llm_for_word(word_data, retry_count=3, retry_delay=5):
    """
    Call the LLM API to analyze a word with retry logic.
    
    Args:
        word_data: Dictionary with lineNumber, wordOrder, word
        retry_count: Number of retries on failure
        retry_delay: Delay between retries in seconds
        
    Returns:
        JSON object with linguistic analysis or None on failure
    """
    prompt = PROMPT_TEMPLATE.format(**word_data)
    
    for attempt in range(retry_count + 1):
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
            
            # Try to parse the JSON response
            try:
                return json.loads(reply_text)
            except json.JSONDecodeError:
                # If not valid JSON, try to extract the JSON portion
                json_match = re.search(r'({[\s\S]*})', reply_text)
                if json_match:
                    return json.loads(json_match.group(1))
                raise Exception("Could not extract valid JSON from response")
                
        except Exception as e:
            if attempt < retry_count:
                print(f"Error processing word '{word_data['word']}': {e}. Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print(f"Failed to process word '{word_data['word']}' after {retry_count} retries: {e}")
                return None

def process_text_file(input_filepath, limit=None, output_dir=None):
    """
    Process a text file to generate a JSON database of linguistic analysis.
    
    Args:
        input_filepath: Path to the input text file
        limit: Optional limit on number of words to process
        output_dir: Optional custom output directory
    
    Returns:
        Path to the output JSON file
    """
    # Validate API key
    if not openai.api_key:
        raise ValueError("OpenAI API key not found. Set OPENAI_API_KEY environment variable.")
        
    # Get the base name of the input file without extension
    input_path = Path(input_filepath)
    input_filename = input_path.stem
    
    # Create output directory
    if output_dir:
        output_path = Path(output_dir)
    else:
        output_path = Path("data") / f"output_{input_filename}"
    
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Copy input file to output directory
    output_text_path = output_path / f"{input_filename}.txt"
    
    # Read input text
    with open(input_filepath, 'r', encoding='utf-8') as file:
        text = file.read()
        
    # Copy text to output directory
    with open(output_text_path, 'w', encoding='utf-8') as file:
        file.write(text)
    
    # Create word list CSV
    word_list = create_word_list_from_text(text)
    
    # Save word list to CSV (for reference)
    csv_path = output_path / f"{input_filename}_word_list.csv"
    with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.DictWriter(csvfile, fieldnames=["Line Number", "Word Order", "Word"])
        csv_writer.writeheader()
        csv_writer.writerows(word_list)
    
    print(f"Created word list CSV: {csv_path}")
    
    # Process words with the LLM
    output_entries = []
    
    # Apply limit if specified
    if limit:
        word_list = word_list[:limit]
    
    total_words = len(word_list)
    
    for i, row in enumerate(word_list):
        word_data = {
            "lineNumber": row["Line Number"],
            "wordOrder": row["Word Order"],
            "word": row["Word"]
        }
        
        print(f"Processing word {i+1}/{total_words}: {word_data['word']} (Line {word_data['lineNumber']}, Order {word_data['wordOrder']})")
        
        entry = call_llm_for_word(word_data)
        
        if entry:
            output_entries.append(entry)
        else:
            # If analysis fails, include basic information
            output_entries.append(word_data)
        
        # Add delay to respect rate limits (only if not the last word)
        if i < total_words - 1:
            time.sleep(1.5)  # Slightly longer delay to be safer with rate limits
    
    # Save final JSON database
    output_json_path = output_path / f"{input_filename}_wordDatabase.json"
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(output_entries, f, ensure_ascii=False, indent=2)
    
    print(f"Final JSON database saved to: {output_json_path}")
    return output_json_path

def main():
    parser = argparse.ArgumentParser(description="Process Ancient Greek text to create linguistic database.")
    parser.add_argument("--input", "-i", type=str, required=True,
                        help="Path to the input text file")
    parser.add_argument("--limit", "-l", type=int, default=None,
                        help="Number of words to process (default: all)")
    parser.add_argument("--output", "-o", type=str, default=None,
                        help="Custom output directory (default: data/output_filename)")
    args = parser.parse_args()
    
    process_text_file(args.input, args.limit, args.output)

if __name__ == "__main__":
    main()