import os
import csv
import json
import re
import time
import argparse
import requests
from pathlib import Path
from datetime import datetime
from collections import Counter
import unicodedata

# Try to import CLTK
try:
    from cltk.lemmatize.greek import GreekBackoffLemmatizer
    from cltk.tag.pos import POSTag
    CLTK_AVAILABLE = True
except ImportError:
    CLTK_AVAILABLE = False
    print("CLTK not available. Install with: pip install cltk")
    print("Falling back to online resources and local dictionary.")

def log_progress(message):
    """Print a timestamped progress message."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")

def detect_language(text):
    """
    Detect if text is Ancient Greek.
    
    Args:
        text: Input text string
        
    Returns:
        String: 'greek' if Ancient Greek, 'unknown' otherwise
    """
    # Check for Greek Unicode character ranges
    greek_chars = 0
    total_chars = 0
    
    for char in text:
        if not char.isspace() and not char.isdigit() and not char.ispunctuation():
            total_chars += 1
            # Greek Unicode range
            if '\u0370' <= char <= '\u03FF' or '\u1F00' <= char <= '\u1FFF':
                greek_chars += 1
    
    # Check if text has diacritical marks specific to Ancient Greek
    ancient_greek_markers = ['᾽', 'ά', 'έ', 'ή', 'ί', 'ό', 'ύ', 'ώ', 'ϊ', 'ϋ']
    has_ancient_markers = any(marker in text for marker in ancient_greek_markers)
    
    # If more than 70% of characters are Greek and has ancient markers
    if greek_chars / max(total_chars, 1) > 0.7 and has_ancient_markers:
        return 'greek'
    
    return 'unknown'

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

def load_local_dictionary():
    """
    Load the local dictionary file or create it if it doesn't exist.
    
    Returns:
        Dictionary of Greek words and their analyses
    """
    dictionary_path = Path("data/greek_dictionary.json")
    
    if dictionary_path.exists():
        try:
            with open(dictionary_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            log_progress(f"Error loading dictionary: {e}")
    
    # Create a basic dictionary with common words
    basic_dict = {
        # Articles
        'ὁ': {'lemma': 'ὁ', 'partOfSpeech': 'Article', 'morphology': 'Nominative Singular Masculine', 
              'meanings': ['the'], 'bestTranslation': 'the', 'bestLemmaTranslation': 'the'},
        'ἡ': {'lemma': 'ὁ', 'partOfSpeech': 'Article', 'morphology': 'Nominative Singular Feminine', 
              'meanings': ['the'], 'bestTranslation': 'the', 'bestLemmaTranslation': 'the'},
        'τό': {'lemma': 'ὁ', 'partOfSpeech': 'Article', 'morphology': 'Nominative Singular Neuter', 
               'meanings': ['the'], 'bestTranslation': 'the', 'bestLemmaTranslation': 'the'},
        
        # Common particles
        'δέ': {'lemma': 'δέ', 'partOfSpeech': 'Particle', 'morphology': '', 
               'meanings': ['but', 'and'], 'bestTranslation': 'but', 'bestLemmaTranslation': 'but'},
        'γάρ': {'lemma': 'γάρ', 'partOfSpeech': 'Particle', 'morphology': '', 
                'meanings': ['for', 'because'], 'bestTranslation': 'for', 'bestLemmaTranslation': 'for'},
        
        # Common verbs
        'ἐστί': {'lemma': 'εἰμί', 'partOfSpeech': 'Verb', 'morphology': 'Present Indicative Active 3rd Person Singular', 
                 'meanings': ['is', 'exists'], 'bestTranslation': 'is', 'bestLemmaTranslation': 'to be'},
        
        # Common nouns
        'ἄνθρωπος': {'lemma': 'ἄνθρωπος', 'partOfSpeech': 'Noun', 'morphology': 'Nominative Singular Masculine', 
                     'meanings': ['human being', 'person'], 'bestTranslation': 'human being', 'bestLemmaTranslation': 'human being'}
    }
    
    # Save the dictionary
    os.makedirs(dictionary_path.parent, exist_ok=True)
    with open(dictionary_path, 'w', encoding='utf-8') as f:
        json.dump(basic_dict, f, ensure_ascii=False, indent=2)
    
    return basic_dict

def update_local_dictionary(word, analysis, local_dict):
    """
    Update the local dictionary with a new word analysis.
    
    Args:
        word: Greek word
        analysis: Analysis dictionary
        local_dict: Local dictionary to update
        
    Returns:
        Updated dictionary
    """
    local_dict[word] = analysis
    
    # Save the updated dictionary
    dictionary_path = Path("data/greek_dictionary.json")
    with open(dictionary_path, 'w', encoding='utf-8') as f:
        json.dump(local_dict, f, ensure_ascii=False, indent=2)
    
    return local_dict

def analyze_with_cltk(word):
    """
    Analyze a Greek word using CLTK.
    
    Args:
        word: Greek word to analyze
        
    Returns:
        Dictionary with word analysis or None if failed
    """
    if not CLTK_AVAILABLE:
        return None
    
    try:
        # Initialize CLTK tools
        lemmatizer = GreekBackoffLemmatizer()
        tagger = POSTag('greek')
        
        # Get lemma and part of speech
        lemma = lemmatizer.lemmatize([word])[0]
        pos_tag = tagger.tag_ngram_123_backoff([word])[0][1]
        
        # Map CLTK POS tags to our format
        pos_mapping = {
            'n': 'Noun',
            'v': 'Verb',
            'a': 'Adjective',
            'd': 'Adverb',
            'r': 'Preposition',
            'c': 'Conjunction',
            'p': 'Pronoun',
            'i': 'Interjection',
            'u': 'Particle',
            'l': 'Article'
        }
        
        part_of_speech = pos_mapping.get(pos_tag[0].lower(), 'Unknown')
        
        # Basic morphology based on part of speech
        morphology = ""
        if part_of_speech == 'Noun':
            morphology = "Unknown Case"
        elif part_of_speech == 'Verb':
            morphology = "Unknown Tense/Mood"
        
        # We don't have meanings from CLTK, so use placeholders
        return {
            'lemma': lemma,
            'partOfSpeech': part_of_speech,
            'morphology': morphology,
            'meanings': ['unknown'],
            'bestTranslation': 'unknown',
            'bestLemmaTranslation': 'unknown'
        }
    except Exception as e:
        log_progress(f"CLTK analysis failed: {e}")
        return None

def analyze_with_perseus(word):
    """
    Analyze a Greek word using Perseus Digital Library.
    
    Args:
        word: Greek word to analyze
        
    Returns:
        Dictionary with word analysis or None if failed
    """
    try:
        # Perseus morphological analysis URL
        url = f"https://www.perseus.tufts.edu/hopper/morph?l={word}&la=greek"
        
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            log_progress(f"Perseus returned status code {response.status_code}")
            return None
            
        # Parse the HTML response
        html = response.text
        
        # Extract lemma using regex
        lemma_match = re.search(r'<span class="lemma">([^<]+)</span>', html)
        lemma = lemma_match.group(1) if lemma_match else word
        
        # Extract part of speech
        pos_match = re.search(r'<span class="pos">([^<]+)</span>', html)
        pos = pos_match.group(1) if pos_match else "Unknown"
        
        # Map Perseus part of speech to our format
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
            if key in pos.lower():
                pos = value
                break
        
        # Extract morphology
        morph_match = re.search(r'<span class="morph">([^<]+)</span>', html)
        morphology = morph_match.group(1) if morph_match else ""
        
        # Extract definitions
        defs = re.findall(r'<span class="sense">([^<]+)</span>', html)
        meanings = defs[:5] if defs else ["unknown"]
        
        # Best translation is the first meaning
        best_translation = meanings[0] if meanings else "unknown"
        
        # Best lemma translation
        lemma_trans_match = re.search(r'<span class="lemma_trans">([^<]+)</span>', html)
        best_lemma_translation = lemma_trans_match.group(1) if lemma_trans_match else best_translation
        
        return {
            'lemma': lemma,
            'partOfSpeech': pos,
            'morphology': morphology,
            'meanings': meanings,
            'bestTranslation': best_translation,
            'bestLemmaTranslation': best_lemma_translation
        }
    except Exception as e:
        log_progress(f"Perseus analysis failed: {e}")
        return None

def analyze_with_morpheus(word):
    """
    Analyze a Greek word using Morpheus API.
    
    Args:
        word: Greek word to analyze
        
    Returns:
        Dictionary with word analysis or None if failed
    """
    try:
        # Morpheus API URL
        url = f"https://morph.perseids.org/analysis/word?lang=grc&word={word}"
        headers = {'Accept': 'application/json'}
        
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            log_progress(f"Morpheus returned status code {response.status_code}")
            return None
            
        data = response.json()
        
        # Check if we have any analyses
        if not data or 'RDF' not in data or 'Annotation' not in data['RDF']:
            return None
        
        # Get the first analysis
        analysis = data['RDF']['Annotation']
        if isinstance(analysis, list):
            analysis = analysis[0]
        
        # Extract lemma
        lemma = analysis.get('hasLemma', {}).get('lemma', word)
        
        # Extract part of speech
        pos = analysis.get('hasLemma', {}).get('pos', "Unknown")
        
        # Map Morpheus part of speech to our format
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
            if key in pos.lower():
                pos = value
                break
        
        # Extract morphology
        morphology = analysis.get('morphology', "")
        
        # We don't have meanings from Morpheus, so use placeholders
        return {
            'lemma': lemma,
            'partOfSpeech': pos,
            'morphology': morphology,
            'meanings': ['unknown'],
            'bestTranslation': 'unknown',
            'bestLemmaTranslation': 'unknown'
        }
    except Exception as e:
        log_progress(f"Morpheus analysis failed: {e}")
        return None

def guess_analysis_from_endings(word):
    """
    Make an educated guess about a Greek word based on its endings.
    
    Args:
        word: Greek word to analyze
        
    Returns:
        Dictionary with basic word analysis
    """
    # Common noun endings
    if word.endswith(('ος', 'ον', 'ης', 'ας', 'α', 'η')):
        return {
            'lemma': word,
            'partOfSpeech': 'Noun',
            'morphology': 'Unknown Case',
            'meanings': ['unknown'],
            'bestTranslation': 'unknown',
            'bestLemmaTranslation': 'unknown'
        }
    # Common verb endings
    elif word.endswith(('ω', 'ειν', 'αι', 'σθαι', 'μι')):
        return {
            'lemma': word,
            'partOfSpeech': 'Verb',
            'morphology': 'Unknown Tense/Mood',
            'meanings': ['unknown'],
            'bestTranslation': 'unknown',
            'bestLemmaTranslation': 'unknown'
        }
    # Common adjective endings
    elif word.endswith(('ος', 'η', 'ον', 'ης', 'ες')):
        return {
            'lemma': word,
            'partOfSpeech': 'Adjective',
            'morphology': 'Unknown Case',
            'meanings': ['unknown'],
            'bestTranslation': 'unknown',
            'bestLemmaTranslation': 'unknown'
        }
    # Common adverb endings
    elif word.endswith('ως'):
        return {
            'lemma': word,
            'partOfSpeech': 'Adverb',
            'morphology': '',
            'meanings': ['unknown'],
            'bestTranslation': 'unknown',
            'bestLemmaTranslation': 'unknown'
        }
    # Default fallback
    else:
        return {
            'lemma': word,
            'partOfSpeech': 'Unknown',
            'morphology': '',
            'meanings': ['unknown'],
            'bestTranslation': 'unknown',
            'bestLemmaTranslation': 'unknown'
        }

def analyze_greek_word(word, local_dict):
    """
    Analyze a Greek word using multiple resources with fallbacks.
    
    Args:
        word: Greek word to analyze
        local_dict: Local dictionary of Greek words
        
    Returns:
        Dictionary with word analysis
    """
    # Step 1: Check local dictionary first (fastest)
    if word in local_dict:
        log_progress(f"Found '{word}' in local dictionary")
        return local_dict[word]
    
    log_progress(f"Analyzing word: {word}")
    
    # Step 2: Try CLTK (if available)
    if CLTK_AVAILABLE:
        cltk_result = analyze_with_cltk(word)
        if cltk_result:
            log_progress(f"CLTK analysis successful for '{word}'")
            return cltk_result
    
    # Step 3: Try Perseus Digital Library
    perseus_result = analyze_with_perseus(word)
    if perseus_result:
        log_progress(f"Perseus analysis successful for '{word}'")
        return perseus_result
    
    # Step 4: Try Morpheus API
    morpheus_result = analyze_with_morpheus(word)
    if morpheus_result:
        log_progress(f"Morpheus analysis successful for '{word}'")
        return morpheus_result
    
    # Step 5: Make an educated guess based on word endings
    log_progress(f"All lookups failed for '{word}'. Making educated guess.")
    return guess_analysis_from_endings(word)

def process_text_file(input_filepath, limit=None, output_dir=None, max_lines=None):
    """
    Process a text file to generate a database with word counts.
    
    Args:
        input_filepath: Path to the input text file
        limit: Optional limit on number of words to process
        output_dir: Optional custom output directory
        max_lines: Optional maximum number of lines to process
    
    Returns:
        Path to the output JavaScript file
    """
    start_time = datetime.now()
    log_progress(f"Starting processing of {input_filepath}")
    
    # Load local dictionary
    local_dict = load_local_dictionary()
    log_progress(f"Loaded local dictionary with {len(local_dict)} entries")
    
    # Get the base name of the input file without extension
    input_path = Path(input_filepath)
    input_filename = input_path.stem
    
    # Create output directory
    if output_dir:
        output_path = Path(output_dir)
    else:
        output_path = Path("data") / f"output_{input_filename}"
    
    output_path.mkdir(parents=True, exist_ok=True)
    log_progress(f"Output directory created: {output_path}")
    
    # Read input text
    with open(input_filepath, 'r', encoding='utf-8') as file:
        text = file.read()
        
    # Detect language
    language = detect_language(text)
    log_progress(f"Detected language: {language}")
    
    if language != 'greek':
        log_progress("Warning: Text does not appear to be Ancient Greek. Results may be unreliable.")
    
    # Limit to max_lines if specified
    if max_lines:
        lines = text.strip().split('\n')[:max_lines]
        text = '\n'.join(lines)
        log_progress(f"Limited to first {max_lines} lines")
    
    # Copy original text to output directory
    output_text_path = output_path / f"{input_filename}.txt"
    with open(output_text_path, 'w', encoding='utf-8') as file:
        file.write(text)
    
    # STEP 1: Create a list of all words in the text
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
    
    # STEP 2: Count occurrences of each word
    word_counter = Counter()
    for row in word_list:
        word_counter[row["Word"]] += 1
    
    log_progress(f"Found {len(word_counter)} unique words")
    
    # STEP 3: Process each unique word
    unique_words = {}
    
    for word in word_counter.keys():
        if word not in unique_words:
            # Analyze the word
            analysis = analyze_greek_word(word, local_dict)
            
            # Add count property
            analysis['count'] = str(word_counter[word])
            
            # Store in unique words dictionary
            unique_words[word] = analysis
            
            # Update local dictionary for future use
            if word not in local_dict:
                local_dict = update_local_dictionary(word, analysis, local_dict)
            
            # Add delay to avoid overwhelming online services
            time.sleep(0.5)
    
    log_progress(f"Analyzed {len(unique_words)} unique words")
    
    # STEP 4: Create database entries for each word in the list
    output_entries = []
    
    for row in word_list:
        word = row["Word"]
        
        # Get analysis from unique words dictionary
        analysis = unique_words[word]
        
        # Create entry in the exact format of wordDatabase.js, plus count
        entry = {
            word: {
                'lineNumber': row["Line Number"],
                'wordOrder': row["Word Order"],
                'partOfSpeech': analysis['partOfSpeech'],
                'morphology': analysis['morphology'],
                'meanings': analysis['meanings'],
                'bestTranslation': analysis['bestTranslation'],
                'lemma': analysis['lemma'],
                'bestLemmaTranslation': analysis['bestLemmaTranslation'],
                'count': analysis['count']  # Add count property
            }
        }
        output_entries.append(entry)
    
    log_progress(f"Created database entries for {len(word_list)} words")
    
    # Save as JavaScript file
    js_content = "// Generated word database with counts\nconst wordDatabase = {\n"
    
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
    
    # Also save a CSV with word counts
    count_csv_path = output_path / f"{input_filename}_word_counts.csv"
    with open(count_csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(["Word", "Count", "Part of Speech", "Lemma"])
        
        for word, analysis in unique_words.items():
            csv_writer.writerow([
                word,
                analysis['count'],
                analysis['partOfSpeech'],
                analysis['lemma']
            ])
    
    end_time = datetime.now()
    duration = end_time - start_time
    log_progress(f"Processing complete! Duration: {duration}")
    log_progress(f"Final JavaScript database saved to: {output_js_path}")
    log_progress(f"Word count CSV saved to: {count_csv_path}")
    
    return output_js_path

def main():
    parser = argparse.ArgumentParser(description="Process Ancient Greek text to create word database with counts.")
    parser.add_argument("--input", "-i", type=str, required=True,
                        help="Path to the input text file")
    parser.add_argument("--limit", "-l", type=int, default=None,
                        help="Number of words to process (default: all)")
    parser.add_argument("--max-lines", "-m", type=int, default=None,
                        help="Maximum number of lines to process (default: all)")
    parser.add_argument("--output", "-o", type=str, default=None,
                        help="Custom output directory (default: data/output_filename)")
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