#!/usr/bin/env python3
import os
import re
import json
import csv
import time
import argparse
import requests
from urllib.parse import quote

def log_progress(message):
    """Log progress with timestamp."""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

def is_greek_text(text, threshold=0.3):
    """Detect if text is Ancient Greek based on character frequency."""
    # Greek Unicode ranges
    greek_pattern = re.compile(r'[\u0370-\u03FF\u1F00-\u1FFF]')
    
    # Count Greek characters
    greek_chars = len(re.findall(greek_pattern, text))
    total_chars = len(text.strip())
    
    # Check if proportion of Greek characters exceeds threshold
    if total_chars > 0 and greek_chars / total_chars > threshold:
        return True
    return False

def create_word_list_from_text(text, max_lines=None):
    """Create a list of words from the input text."""
    log_progress(f"Creating word list from text (max_lines={max_lines})")
    
    # Split text into lines and limit if specified
    lines = text.strip().split('\n')
    if max_lines:
        lines = lines[:max_lines]
    
    word_list = []
    line_number = 0
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        line_number += 1
        
        # Remove punctuation and split into words
        clean_line = re.sub(r'[,.;:"\[\]\(\)!?—]', ' ', line)
        words_in_line = re.findall(r'\b[\u0370-\u03FF\u1F00-\u1FFF]+\b', clean_line)
        
        # Add words with metadata
        for word_order, word in enumerate(words_in_line, 1):
            word = word.lower()  # Normalize to lowercase
            if word:  # Skip empty strings
                word_list.append({
                    'word': word,
                    'lineNumber': str(line_number),
                    'wordOrder': str(word_order)
                })
    
    log_progress(f"Created word list with {len(word_list)} words from {line_number} lines")
    return word_list

def load_local_dictionary():
    """Load local dictionary or create if it doesn't exist."""
    dict_path = os.path.join('data', 'greek_dictionary.json')
    os.makedirs('data', exist_ok=True)
    
    if os.path.exists(dict_path):
        try:
            with open(dict_path, 'r', encoding='utf-8') as f:
                local_dict = json.load(f)
                log_progress(f"Loaded local dictionary with {len(local_dict)} entries")
                return local_dict
        except Exception as e:
            log_progress(f"Error loading dictionary: {e}")
    
    # Create basic dictionary with common words
    log_progress("Creating new local dictionary with common Greek words")
    local_dict = {
        # Articles
        'ὁ': {'partOfSpeech': 'Article', 'morphology': 'Nominative Singular Masculine', 'lemma': 'ὁ', 'meanings': ['the'], 'bestTranslation': 'the'},
        'ἡ': {'partOfSpeech': 'Article', 'morphology': 'Nominative Singular Feminine', 'lemma': 'ὁ', 'meanings': ['the'], 'bestTranslation': 'the'},
        'τό': {'partOfSpeech': 'Article', 'morphology': 'Nominative Singular Neuter', 'lemma': 'ὁ', 'meanings': ['the'], 'bestTranslation': 'the'},
        
        # Common particles
        'δέ': {'partOfSpeech': 'Particle', 'morphology': 'Indeclinable', 'lemma': 'δέ', 'meanings': ['but', 'and'], 'bestTranslation': 'but'},
        'γάρ': {'partOfSpeech': 'Particle', 'morphology': 'Indeclinable', 'lemma': 'γάρ', 'meanings': ['for', 'because'], 'bestTranslation': 'for'},
        'καί': {'partOfSpeech': 'Conjunction', 'morphology': 'Indeclinable', 'lemma': 'καί', 'meanings': ['and', 'also'], 'bestTranslation': 'and'},
        
        # Common verbs
        'ἐστί': {'partOfSpeech': 'Verb', 'morphology': 'Present Indicative Active 3rd Person Singular', 'lemma': 'εἰμί', 'meanings': ['is', 'exists'], 'bestTranslation': 'is'},
        'εἰσί': {'partOfSpeech': 'Verb', 'morphology': 'Present Indicative Active 3rd Person Plural', 'lemma': 'εἰμί', 'meanings': ['are', 'exist'], 'bestTranslation': 'are'},
    }
    
    # Save the new dictionary
    with open(dict_path, 'w', encoding='utf-8') as f:
        json.dump(local_dict, f, ensure_ascii=False, indent=2)
    
    return local_dict

def update_local_dictionary(word, analysis, local_dict):
    """Update local dictionary with new word analysis."""
    if word not in local_dict and analysis:
        local_dict[word] = analysis
        dict_path = os.path.join('data', 'greek_dictionary.json')
        with open(dict_path, 'w', encoding='utf-8') as f:
            json.dump(local_dict, f, ensure_ascii=False, indent=2)
        log_progress(f"Added '{word}' to local dictionary")
    return local_dict

def analyze_with_perseus(word):
    """Analyze a Greek word using Perseus Digital Library."""
    try:
        encoded_word = quote(word)
        url = f"https://www.perseus.tufts.edu/hopper/morph?l={encoded_word}&la=greek"
        
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return None
            
        # Simple HTML parsing without BeautifulSoup
        html = response.text
        
        # Extract lemma
        lemma_match = re.search(r'<h4 class="greek">.*?<a.*?>(.*?)</a>', html, re.DOTALL)
        lemma = lemma_match.group(1).strip() if lemma_match else word
        
        # Extract part of speech and morphology
        analysis_match = re.search(r'<div class="analysis">(.*?)</div>', html, re.DOTALL)
        if not analysis_match:
            return None
            
        analysis_text = analysis_match.group(1).strip()
        
        # Extract part of speech
        pos_match = re.search(r'(?:noun|verb|adj|adv|conj|prep|article|particle|pronoun)', analysis_text.lower())
        part_of_speech = pos_match.group(0).capitalize() if pos_match else "Unknown"
        
        # Map abbreviated parts of speech to full forms
        pos_mapping = {
            'noun': 'Noun',
            'verb': 'Verb',
            'adj': 'Adjective',
            'adv': 'Adverb',
            'conj': 'Conjunction',
            'prep': 'Preposition',
            'art': 'Article',
            'part': 'Particle',
            'pron': 'Pronoun'
        }
        part_of_speech = pos_mapping.get(part_of_speech.lower(), part_of_speech)
        
        # Extract morphology
        morphology_parts = []
        for morph in ['nominative', 'accusative', 'genitive', 'dative', 'vocative',
                      'singular', 'plural', 'dual',
                      'masculine', 'feminine', 'neuter',
                      'present', 'imperfect', 'future', 'aorist', 'perfect', 'pluperfect',
                      'indicative', 'subjunctive', 'optative', 'imperative', 'infinitive', 'participle',
                      'active', 'middle', 'passive',
                      '1st', '2nd', '3rd']:
            if re.search(r'\b' + morph + r'\b', analysis_text.lower()):
                morphology_parts.append(morph.capitalize())
        
        morphology = ' '.join(morphology_parts) if morphology_parts else "Unknown"
        
        # Extract meanings
        translation_match = re.search(r'<div class="translation">(.*?)</div>', html, re.DOTALL)
        meanings = []
        if translation_match:
            meanings_text = translation_match.group(1).strip()
            meanings = [m.strip() for m in re.split(r',|;', meanings_text) if m.strip()]
        
        if not meanings:
            meanings = ["unknown"]
        
        return {
            'partOfSpeech': part_of_speech,
            'morphology': morphology,
            'lemma': lemma,
            'meanings': meanings,
            'bestTranslation': meanings[0]
        }
    except Exception as e:
        log_progress(f"Error analyzing '{word}' with Perseus: {e}")
        return None

def guess_analysis_from_endings(word):
    """Make educated guesses about a Greek word's part of speech based on endings."""
    # Common noun endings
    noun_endings = {
        'ος': {'pos': 'Noun', 'morphology': 'Nominative Singular Masculine'},
        'ον': {'pos': 'Noun', 'morphology': 'Nominative Singular Neuter'},
        'η': {'pos': 'Noun', 'morphology': 'Nominative Singular Feminine'},
        'α': {'pos': 'Noun', 'morphology': 'Nominative Singular Feminine'},
        'ου': {'pos': 'Noun', 'morphology': 'Genitive Singular Masculine/Neuter'},
        'ης': {'pos': 'Noun', 'morphology': 'Genitive Singular Feminine'},
        'ας': {'pos': 'Noun', 'morphology': 'Genitive Singular Feminine'},
        'ῳ': {'pos': 'Noun', 'morphology': 'Dative Singular Masculine/Neuter'},
        'ῃ': {'pos': 'Noun', 'morphology': 'Dative Singular Feminine'},
        'ᾳ': {'pos': 'Noun', 'morphology': 'Dative Singular Feminine'},
        'οι': {'pos': 'Noun', 'morphology': 'Nominative Plural Masculine'},
        'αι': {'pos': 'Noun', 'morphology': 'Nominative Plural Feminine'},
        'α': {'pos': 'Noun', 'morphology': 'Nominative Plural Neuter'},
        'ων': {'pos': 'Noun', 'morphology': 'Genitive Plural'},
        'οις': {'pos': 'Noun', 'morphology': 'Dative Plural Masculine/Neuter'},
        'αις': {'pos': 'Noun', 'morphology': 'Dative Plural Feminine'},
        'ους': {'pos': 'Noun', 'morphology': 'Accusative Plural Masculine'},
        'ας': {'pos': 'Noun', 'morphology': 'Accusative Plural Feminine'},
    }
    
    # Common verb endings
    verb_endings = {
        'ω': {'pos': 'Verb', 'morphology': 'Present Indicative Active 1st Person Singular'},
        'εις': {'pos': 'Verb', 'morphology': 'Present Indicative Active 2nd Person Singular'},
        'ει': {'pos': 'Verb', 'morphology': 'Present Indicative Active 3rd Person Singular'},
        'ομεν': {'pos': 'Verb', 'morphology': 'Present Indicative Active 1st Person Plural'},
        'ετε': {'pos': 'Verb', 'morphology': 'Present Indicative Active 2nd Person Plural'},
        'ουσι': {'pos': 'Verb', 'morphology': 'Present Indicative Active 3rd Person Plural'},
        'ομαι': {'pos': 'Verb', 'morphology': 'Present Indicative Middle/Passive 1st Person Singular'},
        'εται': {'pos': 'Verb', 'morphology': 'Present Indicative Middle/Passive 3rd Person Singular'},
        'ονται': {'pos': 'Verb', 'morphology': 'Present Indicative Middle/Passive 3rd Person Plural'},
        'ειν': {'pos': 'Verb', 'morphology': 'Present Infinitive Active'},
        'εσθαι': {'pos': 'Verb', 'morphology': 'Present Infinitive Middle/Passive'},
    }
    
    # Common adjective endings
    adj_endings = {
        'ος': {'pos': 'Adjective', 'morphology': 'Nominative Singular Masculine'},
        'η': {'pos': 'Adjective', 'morphology': 'Nominative Singular Feminine'},
        'ον': {'pos': 'Adjective', 'morphology': 'Nominative Singular Neuter'},
        'ου': {'pos': 'Adjective', 'morphology': 'Genitive Singular Masculine/Neuter'},
        'ης': {'pos': 'Adjective', 'morphology': 'Genitive Singular Feminine'},
        'οι': {'pos': 'Adjective', 'morphology': 'Nominative Plural Masculine'},
        'αι': {'pos': 'Adjective', 'morphology': 'Nominative Plural Feminine'},
        'α': {'pos': 'Adjective', 'morphology': 'Nominative Plural Neuter'},
    }
    
    # Check for matches in each category
    for ending, info in verb_endings.items():
        if word.endswith(ending):
            return {
                'partOfSpeech': info['pos'],
                'morphology': info['morphology'],
                'lemma': word,  # We don't know the true lemma
                'meanings': ["unknown"],
                'bestTranslation': "unknown"
            }
    
    for ending, info in adj_endings.items():
        if word.endswith(ending):
            return {
                'partOfSpeech': info['pos'],
                'morphology': info['morphology'],
                'lemma': word,  # We don't know the true lemma
                'meanings': ["unknown"],
                'bestTranslation': "unknown"
            }
    
    for ending, info in noun_endings.items():
        if word.endswith(ending):
            return {
                'partOfSpeech': info['pos'],
                'morphology': info['morphology'],
                'lemma': word,  # We don't know the true lemma
                'meanings': ["unknown"],
                'bestTranslation': "unknown"
            }
    
    # Default if no patterns match
    return {
        'partOfSpeech': "Unknown",
        'morphology': "Unknown",
        'lemma': word,
        'meanings': ["unknown"],
        'bestTranslation': "unknown"
    }

def process_text_file(input_filepath, limit=None, output_dir=None, max_lines=None):
    """Process a text file to generate a database with word counts."""
    start_time = time.time()
    log_progress(f"Starting to process {input_filepath}")
    
    # Create output directory if specified
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
    else:
        output_dir = os.path.dirname(input_filepath) or '.'
    
    # Load local dictionary
    local_dict = load_local_dictionary()
    
    # Read input file
    try:
        with open(input_filepath, 'r', encoding='utf-8') as f:
            text = f.read()
    except UnicodeDecodeError:
        # Try with different encodings if utf-8 fails
        encodings = ['iso-8859-7', 'cp1253', 'mac_greek']
        for encoding in encodings:
            try:
                with open(input_filepath, 'r', encoding=encoding) as f:
                    text = f.read()
                log_progress(f"Successfully read file with {encoding} encoding")
                break
            except UnicodeDecodeError:
                continue
        else:
            log_progress("Failed to read file with any known Greek encoding")
            return
    
    # Check if text is Greek
    if not is_greek_text(text):
        log_progress("Warning: Text does not appear to be Ancient Greek")
        return
    
    # Create word list
    word_list = create_word_list_from_text(text, max_lines)
    
    # Count word occurrences
    word_counts = {}
    for word_info in word_list:
        word = word_info['word']
        if word in word_counts:
            word_counts[word]['count'] += 1
        else:
            word_counts[word] = {
                'count': 1,
                'lineNumber': word_info['lineNumber'],
                'wordOrder': word_info['wordOrder']
            }
    
    log_progress(f"Found {len(word_counts)} unique words")
    
    # Sort words by frequency (most common first)
    sorted_words = sorted(word_counts.items(), key=lambda x: x[1]['count'], reverse=True)
    
    # Limit number of words to process if specified
    if limit:
        sorted_words = sorted_words[:limit]
        log_progress(f"Limited to processing {limit} most common words")
    
    # Process each unique word
    database = {}
    processed_count = 0
    total_words = len(sorted_words)
    
    for word, info in sorted_words:
        processed_count += 1
        if processed_count % 10 == 0 or processed_count == total_words:
            log_progress(f"Processing word {processed_count}/{total_words}: '{word}'")
        
        # Check local dictionary first
        if word in local_dict:
            analysis = local_dict[word]
            log_progress(f"Found '{word}' in local dictionary")
        else:
            # Try Perseus
            analysis = analyze_with_perseus(word)
            
            # If Perseus fails, use morphological guessing
            if not analysis:
                analysis = guess_analysis_from_endings(word)
                log_progress(f"Using morphological guessing for '{word}'")
            else:
                log_progress(f"Successfully analyzed '{word}' with Perseus")
            
            # Update local dictionary
            local_dict = update_local_dictionary(word, analysis, local_dict)
        
        # Create database entry
        database[word] = {
            'lineNumber': info['lineNumber'],
            'wordOrder': info['wordOrder'],
            'partOfSpeech': analysis['partOfSpeech'],
            'morphology': analysis['morphology'],
            'meanings': analysis['meanings'],
            'bestTranslation': analysis['bestTranslation'],
            'lemma': analysis['lemma'],
            'bestLemmaTranslation': analysis['bestTranslation'],
            'count': str(info['count'])
        }
    
    # Generate output filenames
    base_filename = os.path.splitext(os.path.basename(input_filepath))[0]
    js_output = os.path.join(output_dir, f"{base_filename}_wordDatabase.js")
    csv_output = os.path.join(output_dir, f"{base_filename}_word_counts.csv")
    
    # Write JavaScript database file
    with open(js_output, 'w', encoding='utf-8') as f:
        f.write("// Generated word database with counts\n")
        f.write("const wordDatabase = ")
        json.dump(database, f, ensure_ascii=False, indent=2)
        f.write(";\n\nexport default wordDatabase;\n")
    
    # Write CSV file with word counts
    with open(csv_output, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Word', 'Count', 'Part of Speech', 'Lemma', 'Translation'])
        for word, data in sorted_words:
            if word in database:  # Only include words that were processed
                writer.writerow([
                    word,
                    data['count'],
                    database[word]['partOfSpeech'],
                    database[word]['lemma'],
                    database[word]['bestTranslation']
                ])
    
    elapsed_time = time.time() - start_time
    log_progress(f"Processing complete in {elapsed_time:.2f} seconds")
    log_progress(f"Generated JavaScript database: {js_output}")
    log_progress(f"Generated CSV word count file: {csv_output}")

def main():
    """Main function to handle command-line arguments."""
    parser = argparse.ArgumentParser(description='Process Ancient Greek text files to create a word database.')
    parser.add_argument('--input', required=True, help='Path to the input text file')
    parser.add_argument('--limit', type=int, help='Limit processing to the N most common words')
    parser.add_argument('--max-lines', type=int, help='Maximum number of lines to read from the input file')
    parser.add_argument('--output-dir', help='Directory to save output files (default: same as input file)')
    
    args = parser.parse_args()
    
    process_text_file(args.input, args.limit, args.output_dir, args.max_lines)

if __name__ == "__main__":
    main() 