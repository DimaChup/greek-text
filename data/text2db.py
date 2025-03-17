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
You are a meticulous linguistic analyst specializing in Ancient Greek. Analyze the following word and create a JavaScript object entry that exactly matches the format used in wordDatabase.js.

Input Word:
Line Number: {lineNumber}
Word Order: {wordOrder}
Word: {word}

Required Format:
'{word}': {{
    lineNumber: '{lineNumber}',
    wordOrder: '{wordOrder}',
    partOfSpeech: '<part of speech in Title Case>',
    morphology: '<detailed morphological analysis>',
    meanings: [<array of 2-5 possible translations>],
    bestTranslation: '<single best contextual translation>',
    lemma: '<dictionary form>',
    bestLemmaTranslation: '<primary meaning of lemma>'
}}

Rules for each field:
1. partOfSpeech must be one of: 'Noun', 'Verb', 'Adjective', 'Adverb', 'Preposition', 'Conjunction', 'Pronoun', 'Particle', 'Article', 'Demonstrative Pronoun'
2. morphology should include:
   - For Nouns/Adjectives/Pronouns: case, number, gender
   - For Verbs: tense, voice, mood, person, number
   - For others: leave as '' if not applicable
3. meanings should be an array of 2-5 possible translations, ordered by likelihood
4. bestTranslation should include contextual notes in brackets if needed
5. lemma should be the dictionary form in Greek
6. bestLemmaTranslation should be the basic meaning of the lemma

Output only a valid JSON object that matches this exact format. Do not include any explanatory text.
"""

def create_word_list_from_text(text, max_lines=None):
    """
    Creates a list of words with their line numbers and word order from input text.
    
    Args:
        text: Input text string
        max_lines: Optional maximum number of lines to process
        
    Returns:
        List of dictionaries with keys: "Line Number", "Word Order", "Word"
    """
    lines = text.strip().split('\n')
    
    # Limit to max_lines if specified
    if max_lines is not None:
        lines = lines[:max_lines]
        
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
    """
    prompt = PROMPT_TEMPLATE.format(**word_data)
    
    for attempt in range(retry_count + 1):
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",  # Consider using GPT-4 for better accuracy
                messages=[
                    {"role": "system", "content": "You are a linguistic expert specializing in Ancient Greek. Output only valid JSON objects in the exact format requested."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0,  # Keep temperature at 0 for consistency
                max_tokens=500
            )
            reply_text = response["choices"][0]["message"]["content"]
            
            # Clean and validate the response
            try:
                # Remove any markdown formatting if present
                reply_text = re.sub(r'```json\s*|\s*```', '', reply_text)
                # Parse the JSON
                parsed = json.loads(reply_text)
                # Validate the structure matches wordDatabase.js format
                if not all(key in next(iter(parsed.values())) for key in [
                    'lineNumber', 'wordOrder', 'partOfSpeech', 'morphology',
                    'meanings', 'bestTranslation', 'lemma', 'bestLemmaTranslation'
                ]):
                    raise ValueError("Response missing required fields")
                return parsed
            except (json.JSONDecodeError, ValueError) as e:
                if attempt < retry_count:
                    print(f"Invalid format for word '{word_data['word']}': {e}. Retrying...")
                    time.sleep(retry_delay)
                    continue
                raise
                
        except Exception as e:
            if attempt < retry_count:
                print(f"Error processing word '{word_data['word']}': {e}. Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print(f"Failed to process word '{word_data['word']}' after {retry_count} retries: {e}")
                return None

def process_text_file(input_filepath, limit=None, output_dir=None, max_lines=None):
    """
    Process a text file to generate a JSON database of linguistic analysis.
    
    Args:
        input_filepath: Path to the input text file
        limit: Optional limit on number of words to process
        output_dir: Optional custom output directory
        max_lines: Optional maximum number of lines to process
    
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
    
    # Create word list CSV with max_lines parameter
    word_list = create_word_list_from_text(text, max_lines)
    
    # Save word list to CSV (for reference)
    csv_path = output_path / f"{input_filename}_word_list.csv"
    with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.DictWriter(csvfile, fieldnames=["Line Number", "Word Order", "Word"])
        csv_writer.writeheader()
        csv_writer.writerows(word_list)
    
    print(f"Created word list CSV: {csv_path}")
    
    # Create frequency list of unique words
    word_freq = {}
    for row in word_list:
        word = row["Word"].lower()  # Convert to lowercase for case-insensitive counting
        word_freq[word] = word_freq.get(word, 0) + 1
    
    # Sort by frequency (descending)
    sorted_word_freq = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    
    # Save frequency list to CSV
    freq_csv_path = output_path / f"{input_filename}_word_frequency.csv"
    with open(freq_csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(["Word", "Frequency"])
        csv_writer.writerows(sorted_word_freq)
    
    print(f"Created word frequency CSV: {freq_csv_path}")
    
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
    output_js_path = save_as_js_database(output_entries, output_path / f"{input_filename}_wordDatabase")
    print(f"Final JavaScript database saved to: {output_js_path}")
    return output_js_path

def save_as_js_database(entries, output_path):
    """Convert the entries to a JavaScript module format."""
    js_content = "// Generated word database\nconst wordDatabase = {\n"
    
    # Sort entries by word order for consistency
    sorted_entries = sorted(entries, key=lambda x: int(next(iter(x.values()))['wordOrder']))
    
    for entry in sorted_entries:
        word, data = next(iter(entry.items()))
        js_content += f"    '{word}': {{\n"
        for key, value in data.items():
            if isinstance(value, list):
                value_str = f"[{', '.join(f"'{v}'" for v in value)}]"
            else:
                value_str = f"'{value}'"
            js_content += f"        {key}: {value_str},\n"
        js_content += "    },\n"
    
    js_content += "};\n\nexport default wordDatabase;\n"
    
    # Save as .js file
    output_js_path = output_path.with_suffix('.js')
    with open(output_js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    return output_js_path

def main():
    parser = argparse.ArgumentParser(description="Process Ancient Greek text to create linguistic database.")
    parser.add_argument("--input", "-i", type=str, required=True,
                        help="Path to the input text file")
    parser.add_argument("--limit", "-l", type=int, default=None,
                        help="Number of words to process (default: all)")
    parser.add_argument("--max-lines", "-m", type=int, default=None,
                        help="Maximum number of lines to process (default: all)")
    parser.add_argument("--output", "-o", type=str, default=None,
                        help="Custom output directory (default: data/output_filename)")
    args = parser.parse_args()
    
    process_text_file(args.input, args.limit, args.output, args.max_lines)

if __name__ == "__main__":
    main()