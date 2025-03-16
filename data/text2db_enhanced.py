import os
import csv
import json
import time
import re
import argparse
import openai
from pathlib import Path
from datetime import datetime

# Set your OpenAI API key via environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")

# Prompt for full text translation
TRANSLATION_PROMPT = """
Translate this Ancient Greek text into beautiful, flowing English:

{text}

Keep the same line structure as the original.
Output only the translated text.
"""

# Prompt for word analysis with translation guidance
WORD_ANALYSIS_PROMPT = """
You are a meticulous linguistic analyst specializing in Ancient Greek. Analyze the following word and create a JavaScript object entry that exactly matches the format used in wordDatabase.js.

Input Word:
Line Number: {lineNumber}
Word Order: {wordOrder}
Word: {word}
Suggested Translation: {suggested_translation}

Required Format:
'{word}': {{
    lineNumber: '{lineNumber}',
    wordOrder: '{wordOrder}',
    partOfSpeech: '<part of speech in Title Case>',
    morphology: '<detailed morphological analysis>',
    meanings: [<array of 2-5 possible translations>],
    bestTranslation: '{suggested_translation}',
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
4. Use the suggested translation for bestTranslation unless it's clearly incorrect
5. lemma should be the dictionary form in Greek
6. bestLemmaTranslation should be the basic meaning of the lemma

Output only a valid JSON object that matches this exact format.
"""

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

def translate_full_text(text, retry_count=2, retry_delay=5):
    """Generate a literary translation of the entire text."""
    log_progress(f"Generating literary translation of text ({len(text.split())} words)...")
    
    prompt = TRANSLATION_PROMPT.format(text=text)
    
    for attempt in range(retry_count + 1):
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a master translator of Ancient Greek texts."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=len(text.split()) * 2
            )
            translation = response["choices"][0]["message"]["content"]
            log_progress(f"Translation complete: {len(translation.split())} words")
            return translation
                
        except Exception as e:
            if attempt < retry_count:
                log_progress(f"Error translating text: {e}. Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                log_progress(f"Failed to translate text after {retry_count} retries: {e}")
                return "Translation failed."

def get_word_translations(greek_text, english_translation, retry_count=2, retry_delay=5):
    """
    Get suggested translations for each word based on the full translation.
    Returns a dictionary mapping (line_number, word_order) to suggested translations.
    """
    log_progress("Extracting word translations from the full translation...")
    
    # Create a simple prompt to get word translations
    prompt = f"""
    For each word in this Greek text, provide the best English translation based on this full translation.
    
    Greek Text:
    {greek_text}
    
    English Translation:
    {english_translation}
    
    Format your response as a JSON object with this structure:
    {{
      "word_translations": [
        {{ "line": "1", "position": "1", "greek": "word1", "english": "translation1" }},
        {{ "line": "1", "position": "2", "greek": "word2", "english": "translation2" }}
      ]
    }}
    
    Include every Greek word, maintaining the original line numbers and word positions.
    """
    
    for attempt in range(retry_count + 1):
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert in Greek translation."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0,
                max_tokens=1500
            )
            reply_text = response["choices"][0]["message"]["content"]
            
            try:
                # Try to extract and parse JSON
                json_match = re.search(r'(\{[\s\S]*\})', reply_text)
                if json_match:
                    parsed = json.loads(json_match.group(1))
                    
                    # Convert to dictionary for easier lookup
                    translations = {}
                    for item in parsed.get("word_translations", []):
                        key = (item["line"], item["position"])
                        translations[key] = item["english"]
                    
                    log_progress(f"Successfully extracted {len(translations)} word translations")
                    return translations
                else:
                    raise ValueError("Could not find JSON in response")
            except (json.JSONDecodeError, ValueError) as e:
                if attempt < retry_count:
                    log_progress(f"Invalid format: {e}. Retrying...")
                    time.sleep(retry_delay)
                    continue
                raise
                
        except Exception as e:
            if attempt < retry_count:
                log_progress(f"Error extracting translations: {e}. Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                log_progress(f"Failed to extract translations after {retry_count} retries: {e}")
                return {}

def call_llm_for_word(word_data, suggested_translation="", retry_count=3, retry_delay=5):
    """
    Call the LLM API to analyze a word with retry logic.
    """
    prompt_data = {
        "lineNumber": word_data["Line Number"],
        "wordOrder": word_data["Word Order"],
        "word": word_data["Word"],
        "suggested_translation": suggested_translation
    }
    
    prompt = WORD_ANALYSIS_PROMPT.format(**prompt_data)
    
    for attempt in range(retry_count + 1):
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a linguistic expert specializing in Ancient Greek. Output only valid JSON objects in the exact format requested."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0,
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
                    log_progress(f"Invalid format for word '{word_data['Word']}': {e}. Retrying...")
                    time.sleep(retry_delay)
                    continue
                raise
                
        except Exception as e:
            if attempt < retry_count:
                log_progress(f"Error processing word '{word_data['Word']}': {e}. Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                log_progress(f"Failed to process word '{word_data['Word']}' after {retry_count} retries: {e}")
                return None

def process_text_file_enhanced(input_filepath, limit=None, output_dir=None, max_lines=None):
    """
    Process a text file to generate a JSON database of linguistic analysis with enhanced translations.
    
    Args:
        input_filepath: Path to the input text file
        limit: Optional limit on number of words to process
        output_dir: Optional custom output directory
        max_lines: Optional maximum number of lines to process
    
    Returns:
        Path to the output JSON file
    """
    start_time = datetime.now()
    log_progress(f"Starting enhanced processing of {input_filepath}")
    
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
        output_path = Path("data") / f"output_{input_filename}_enhanced"
    
    output_path.mkdir(parents=True, exist_ok=True)
    log_progress(f"Output directory created: {output_path}")
    
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
    
    try:
        # Generate literary translation
        translation = translate_full_text(text)
        
        # Save the translation
        translation_path = output_path / f"{input_filename}_translation.txt"
        with open(translation_path, 'w', encoding='utf-8') as file:
            file.write(translation)
        
        log_progress(f"Literary translation saved to: {translation_path}")
        
        # Get word translations
        word_translations = get_word_translations(text, translation)
        
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
            csv_writer = csv.writer(csvfile)
            csv_writer.writerow(["Line Number", "Word Order", "Word", "Suggested Translation"])
            
            for word_data in word_list:
                key = (word_data["Line Number"], word_data["Word Order"])
                translation = word_translations.get(key, "")
                csv_writer.writerow([
                    word_data["Line Number"],
                    word_data["Word Order"],
                    word_data["Word"],
                    translation
                ])
        
        log_progress(f"Word list CSV saved to: {csv_path}")
        
        # Process words with the LLM
        output_entries = []
        total_words = len(word_list)
        
        for i, word_data in enumerate(word_list):
            key = (word_data["Line Number"], word_data["Word Order"])
            suggested_translation = word_translations.get(key, "")
            
            log_progress(f"Processing word {i+1}/{total_words}: {word_data['Word']} (Line {word_data['Line Number']}, Order {word_data['Word Order']})")
            if suggested_translation:
                log_progress(f"  Suggested translation: {suggested_translation}")
            
            entry = call_llm_for_word(word_data, suggested_translation)
            
            if entry:
                output_entries.append(entry)
            else:
                # If analysis fails, include basic information
                fallback_entry = {
                    word_data["Word"]: {
                        "lineNumber": word_data["Line Number"],
                        "wordOrder": word_data["Word Order"],
                        "partOfSpeech": "Unknown",
                        "morphology": "",
                        "meanings": [suggested_translation] if suggested_translation else ["unknown"],
                        "bestTranslation": suggested_translation or "unknown",
                        "lemma": word_data["Word"],
                        "bestLemmaTranslation": suggested_translation or "unknown"
                    }
                }
                output_entries.append(fallback_entry)
            
            # Add delay to respect rate limits (only if not the last word)
            if i < total_words - 1:
                time.sleep(1.5)
        
        # Save as JavaScript file
        output_js_path = output_path / f"{input_filename}_wordDatabase.js"
        js_content = save_as_js_database(output_entries, output_js_path)
        
        end_time = datetime.now()
        duration = end_time - start_time
        log_progress(f"Processing complete! Duration: {duration}")
        log_progress(f"Final JavaScript database saved to: {output_js_path}")
        
        return output_js_path
        
    except Exception as e:
        log_progress(f"ERROR: An unexpected error occurred: {e}")
        # Create an error log
        error_log_path = output_path / "error_log.txt"
        with open(error_log_path, 'w', encoding='utf-8') as f:
            f.write(f"Error occurred at {datetime.now()}\n")
            f.write(f"Error message: {str(e)}\n")
            f.write(f"Input file: {input_filepath}\n")
            f.write(f"Max lines: {max_lines}\n")
            f.write(f"Word limit: {limit}\n")
        log_progress(f"Error details saved to: {error_log_path}")
        return None

def save_as_js_database(entries, output_path):
    """Convert the entries to a JavaScript module format."""
    js_content = "// Generated word database with enhanced translations\nconst wordDatabase = {\n"
    
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
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    return js_content

def main():
    parser = argparse.ArgumentParser(description="Process Ancient Greek text to create linguistic database with enhanced translations.")
    parser.add_argument("--input", "-i", type=str, required=True,
                        help="Path to the input text file")
    parser.add_argument("--limit", "-l", type=int, default=None,
                        help="Number of words to process (default: all)")
    parser.add_argument("--max-lines", "-m", type=int, default=None,
                        help="Maximum number of lines to process (default: all)")
    parser.add_argument("--output", "-o", type=str, default=None,
                        help="Custom output directory (default: data/output_filename_enhanced)")
    args = parser.parse_args()
    
    try:
        process_text_file_enhanced(args.input, args.limit, args.output, args.max_lines)
    except KeyboardInterrupt:
        log_progress("Process interrupted by user. Exiting gracefully.")
    except Exception as e:
        log_progress(f"Critical error: {e}")
        log_progress("Process terminated due to unrecoverable error.")

if __name__ == "__main__":
    main() 