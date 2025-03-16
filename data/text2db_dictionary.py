import os
import csv
import json
import time
import re
import argparse
import requests
from bs4 import BeautifulSoup
from pathlib import Path
from datetime import datetime

def log_progress(message):
    """Print a timestamped progress message."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")

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

def lookup_ancient_greek_word(word):
    """Look up an Ancient Greek word in the Perseus Digital Library."""
    log_progress(f"Looking up Ancient Greek word: {word}")
    
    try:
        # Perseus morphological analysis URL for Ancient Greek
        url = f"https://www.perseus.tufts.edu/hopper/morph?l={word}&la=greek"
        
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            log_progress(f"Error: Perseus returned status code {response.status_code}")
            return None
            
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract lemma (dictionary form)
        lemma_info = soup.select_one('div.lemma')
        if not lemma_info:
            log_progress(f"No lemma information found for {word}")
            return None
            
        lemma_text = lemma_info.get_text().strip()
        lemma_match = re.search(r'Lemma: ([\w\s]+)', lemma_text)
        lemma = lemma_match.group(1).strip() if lemma_match else word
        
        # Extract part of speech
        pos_info = soup.select_one('span.posLabel')
        part_of_speech = pos_info.get_text().strip() if pos_info else "Unknown"
        
        # Map to standardized part of speech
        pos_mapping = {
            'noun': 'Noun',
            'verb': 'Verb',
            'adj': 'Adjective',
            'adv': 'Adverb',
            'prep': 'Preposition',
            'conj': 'Conjunction',
            'pron': 'Pronoun',
            'part': 'Particle',
            'art': 'Article'
        }
        
        for key, value in pos_mapping.items():
            if key in part_of_speech.lower():
                part_of_speech = value
                break
        
        # Extract morphology
        morph_info = soup.select_one('span.morphology')
        morphology = morph_info.get_text().strip() if morph_info else ""
        
        # Extract definitions/meanings
        defs = soup.select('div.definition')
        meanings = []
        for d in defs[:5]:  # Get up to 5 definitions
            meaning = d.get_text().strip()
            if meaning and meaning not in meanings:
                meanings.append(meaning)
        
        if not meanings:
            meanings = ["unknown"]
        
        # Best translation is the first meaning
        best_translation = meanings[0] if meanings else "unknown"
        
        # Best lemma translation
        lemma_trans_info = soup.select_one('div.lemma_translation')
        best_lemma_translation = lemma_trans_info.get_text().strip() if lemma_trans_info else best_translation
        
        return {
            'lemma': lemma,
            'partOfSpeech': part_of_speech,
            'morphology': morphology,
            'meanings': meanings,
            'bestTranslation': best_translation,
            'bestLemmaTranslation': best_lemma_translation
        }
        
    except Exception as e:
        log_progress(f"Error looking up word: {e}")
        return None

def process_text_file(input_filepath, limit=None, output_dir=None, max_lines=None):
    """Process a text file to generate a database using Ancient Greek dictionary."""
    start_time = datetime.now()
    log_progress(f"Starting Ancient Greek dictionary processing of {input_filepath}")
    
    # Get the base name of the input file without extension
    input_path = Path(input_filepath)
    input_filename = input_path.stem
    
    # Create output directory
    if output_dir:
        output_path = Path(output_dir)
    else:
        output_path = Path("data") / f"output_{input_filename}_dictionary"
    
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Read input text
    with open(input_filepath, 'r', encoding='utf-8') as file:
        text = file.read()
        
    # Limit to max_lines if specified
    if max_lines:
        lines = text.strip().split('\n')[:max_lines]
        text = '\n'.join(lines)
        log_progress(f"Limited to first {max_lines} lines")
    
    # Copy original text to output directory
    output_text_path = output_path / f"{input_filename}.txt"
    with open(output_text_path, 'w', encoding='utf-8') as file:
        file.write(text)
    
    # Create word list
    word_list = create_word_list_from_text(text, max_lines)
    log_progress(f"Created word list with {len(word_list)} words")
    
    # Apply limit if specified
    if limit:
        word_list = word_list[:limit]
        log_progress(f"Limited to first {limit} words")
    
    # Save word list to CSV (for reference)
    csv_path = output_path / f"{input_filename}_word_list.csv"
    with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.DictWriter(csvfile, fieldnames=["Line Number", "Word Order", "Word"])
        csv_writer.writeheader()
        csv_writer.writerows(word_list)
    
    log_progress(f"Created word list CSV: {csv_path}")
    
    # Process words one by one
    output_entries = []
    total_words = len(word_list)
    
    for i, row in enumerate(word_list):
        word = row["Word"]
        
        log_progress(f"Processing word {i+1}/{total_words}: {word} (Line {row['Line Number']}, Order {row['Word Order']})")
        
        # Look up word in Ancient Greek dictionary
        word_info = lookup_ancient_greek_word(word)
        
        if word_info:
            # Create entry in the same format as the original script
            entry = {
                word: {
                    'lineNumber': row["Line Number"],
                    'wordOrder': row["Word Order"],
                    'partOfSpeech': word_info['partOfSpeech'],
                    'morphology': word_info['morphology'],
                    'meanings': word_info['meanings'],
                    'bestTranslation': word_info['bestTranslation'],
                    'lemma': word_info['lemma'],
                    'bestLemmaTranslation': word_info['bestLemmaTranslation']
                }
            }
            output_entries.append(entry)
        else:
            # If lookup fails, create a basic entry
            entry = {
                word: {
                    'lineNumber': row["Line Number"],
                    'wordOrder': row["Word Order"],
                    'partOfSpeech': 'Unknown',
                    'morphology': '',
                    'meanings': ['unknown'],
                    'bestTranslation': 'unknown',
                    'lemma': word,
                    'bestLemmaTranslation': 'unknown'
                }
            }
            output_entries.append(entry)
        
        # Add delay to avoid overwhelming the dictionary service
        if i < total_words - 1:
            time.sleep(1)
    
    # Save as JavaScript file
    js_content = "// Generated word database using Ancient Greek dictionary\nconst wordDatabase = {\n"
    
    # Sort entries by word order for consistency
    sorted_entries = sorted(output_entries, key=lambda x: int(next(iter(x.values()))['wordOrder']))
    
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
    output_js_path = output_path / f"{input_filename}_wordDatabase.js"
    with open(output_js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    end_time = datetime.now()
    duration = end_time - start_time
    log_progress(f"Processing complete! Duration: {duration}")
    log_progress(f"Final JavaScript database saved to: {output_js_path}")
    
    return output_js_path

def main():
    parser = argparse.ArgumentParser(description="Process Ancient Greek text using online dictionary.")
    parser.add_argument("--input", "-i", type=str, required=True,
                        help="Path to the input text file")
    parser.add_argument("--limit", "-l", type=int, default=None,
                        help="Number of words to process (default: all)")
    parser.add_argument("--max-lines", "-m", type=int, default=None,
                        help="Maximum number of lines to process (default: all)")
    parser.add_argument("--output", "-o", type=str, default=None,
                        help="Custom output directory (default: data/output_filename_dictionary)")
    args = parser.parse_args()
    
    try:
        process_text_file(args.input, args.limit, args.output, args.max_lines)
    except KeyboardInterrupt:
        log_progress("Process interrupted by user. Exiting gracefully.")
    except Exception as e:
        log_progress(f"Critical error: {e}")
        log_progress("Process terminated due to unrecoverable error.")

if __name__ == "__main__":
    main() 