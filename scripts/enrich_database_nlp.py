#!/usr/bin/env python3

"""
NLP-Based Database Enrichment

This script uses natural language processing libraries (spaCy, NLTK)
to enrich a skeleton database file with linguistic information.

Usage: python enrich_database_nlp.py --input path/to/input_db.js --output path/to/output_db.js
"""

import os
import re
import sys
import json
import argparse
import datetime
from pathlib import Path
import requests
from tqdm import tqdm
import langid

# Try to import spaCy
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    print("Warning: spaCy not available. Some features will be limited.")

# Try to import NLTK
try:
    import nltk
    from nltk.corpus import wordnet
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False
    print("Warning: NLTK not available. Some features will be limited.")

# Mapping from spaCy POS tags to standardized POS
SPACY_POS_MAP = {
    'NOUN': 'NOUN',
    'PROPN': 'NOUN',
    'VERB': 'VERB',
    'ADJ': 'ADJECTIVE',
    'ADV': 'ADVERB',
    'ADP': 'PREPOSITION',
    'CCONJ': 'CONJUNCTION',
    'SCONJ': 'CONJUNCTION',
    'PRON': 'PRONOUN',
    'DET': 'DETERMINER',
    'NUM': 'NUMERAL',
    'INTJ': 'INTERJECTION',
    'AUX': 'VERB',
    'PART': 'PARTICLE'
}

# Language code mapping (ISO 639-1 to spaCy model names)
LANGUAGE_MODELS = {
    'en': 'en_core_web_sm',
    'es': 'es_core_news_sm',
    'fr': 'fr_core_news_sm',
    'de': 'de_core_news_sm',
    'it': 'it_core_news_sm',
    'pt': 'pt_core_news_sm',
    'nl': 'nl_core_news_sm',
    'el': 'el_core_news_sm',  # Greek
    'ja': 'ja_core_news_sm',
    'zh': 'zh_core_web_sm',
    # Add more as needed
}

# Language names
LANGUAGE_NAMES = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'nl': 'Dutch',
    'el': 'Greek',
    'ja': 'Japanese',
    'zh': 'Chinese',
    # Add more as needed
}

# Dictionary for looking up word translations (simple implementation)
TRANSLATION_CACHE = {}

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Enrich a JavaScript database file with linguistic information")
    parser.add_argument("-i", "--input", required=True, help="Path to input database file")
    parser.add_argument("-o", "--output", help="Path to output enriched database file")
    parser.add_argument("-l", "--language", help="Force specific language code (ISO 639-1)")
    parser.add_argument("--no-spacy", action="store_true", help="Disable spaCy processing")
    parser.add_argument("--no-nltk", action="store_true", help="Disable NLTK processing")
    parser.add_argument("--batch-size", type=int, default=100, help="Number of words to process in each batch")
    parser.add_argument("--sample-text", help="Path to sample text in the target language")
    
    return parser.parse_args()

def extract_database(filepath):
    """Extract the database object from a JavaScript file."""
    print(f"Extracting database from: {filepath}")
    
    # Read the JavaScript file
    with open(filepath, 'r', encoding='utf-8') as f:
        js_code = f.read()
    
    # Extract the const declaration
    match = re.search(r'const\s+(\w+)\s*=\s*({[\s\S]+})\s*;?\s*(?:module\.exports|export)', js_code)
    if not match:
        match = re.search(r'const\s+(\w+)\s*=\s*({[\s\S]+})', js_code)
    
    if not match:
        raise ValueError(f"Could not find database object in {filepath}")
    
    database_name = match.group(1)
    database_json = match.group(2)
    
    # Convert JavaScript object to valid JSON
    # Replace JS-style properties with JSON-style properties
    json_str = re.sub(r'(\w+):', r'"\1":', database_json)
    # Replace single quotes with double quotes
    json_str = json_str.replace("'", '"')
    # Fix any trailing commas
    json_str = re.sub(r',\s*}', '}', json_str)
    json_str = re.sub(r',\s*]', ']', json_str)
    
    try:
        database = json.loads(json_str)
        return database, database_name
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Problem parsing portion: {json_str[:100]}...")
        raise ValueError(f"Failed to parse database JSON: {e}")

def detect_language(database, sample_text_path=None):
    """Detect the language of the database."""
    # If sample text is provided, use it for detection
    if sample_text_path and os.path.exists(sample_text_path):
        with open(sample_text_path, 'r', encoding='utf-8') as f:
            sample_text = f.read()
        lang, confidence = langid.classify(sample_text)
        print(f"Language detection from sample text: {LANGUAGE_NAMES.get(lang, lang)} ({confidence:.2f} confidence)")
        return lang
    
    # Otherwise, use database words
    words = list(database.keys())
    sample = ' '.join(words[:min(50, len(words))])
    lang, confidence = langid.classify(sample)
    print(f"Language detection from words: {LANGUAGE_NAMES.get(lang, lang)} ({confidence:.2f} confidence)")
    return lang

def load_nlp_model(lang_code, use_spacy=True):
    """Load the appropriate NLP model for the language."""
    if not use_spacy or not SPACY_AVAILABLE:
        return None
    
    model_name = LANGUAGE_MODELS.get(lang_code)
    if not model_name:
        print(f"No spaCy model available for language code: {lang_code}")
        return None
    
    # Check if model is installed
    if not spacy.util.is_package(model_name):
        print(f"Model {model_name} not found. Please install it with:")
        print(f"python -m spacy download {model_name}")
        return None
    
    print(f"Loading spaCy model: {model_name}")
    try:
        return spacy.load(model_name)
    except OSError as e:
        print(f"Error loading model: {e}")
        return None

def get_wordnet_pos(spacy_pos):
    """Convert spaCy POS tags to WordNet POS tags."""
    if not NLTK_AVAILABLE:
        return None
        
    if spacy_pos == 'NOUN':
        return wordnet.NOUN
    elif spacy_pos == 'VERB':
        return wordnet.VERB
    elif spacy_pos == 'ADJ':
        return wordnet.ADJ
    elif spacy_pos == 'ADV':
        return wordnet.ADV
    else:
        return None

def get_morphology(word, pos, nlp_model=None):
    """Determine morphological features of a word."""
    if not nlp_model:
        return "invariable"
    
    # Process the word with spaCy
    doc = nlp_model(word)
    if len(doc) == 0:
        return "invariable"
    
    token = doc[0]
    
    # Extract morphological features
    features = []
    
    # Gender (for applicable languages)
    if hasattr(token.morph, 'get') and token.morph.get('Gender'):
        gender = token.morph.get('Gender')[0].lower()
        features.append(gender)
    
    # Number
    if hasattr(token.morph, 'get') and token.morph.get('Number'):
        number = token.morph.get('Number')[0].lower()
        features.append(number)
    
    # Verb tense and form
    if pos == 'VERB':
        if hasattr(token.morph, 'get'):
            if token.morph.get('Tense'):
                tense = token.morph.get('Tense')[0].lower()
                features.append(tense)
            if token.morph.get('VerbForm'):
                form = token.morph.get('VerbForm')[0].lower()
                features.append(form)
    
    # Default
    if not features:
        if pos == 'PREPOSITION' or pos == 'CONJUNCTION' or pos == 'INTERJECTION':
            return "invariable"
        return "unknown"
    
    return " ".join(features)

def get_lemma(word, pos, nlp_model=None):
    """Get the lemma (base form) of a word."""
    if not nlp_model:
        return word
        
    # Process with spaCy
    doc = nlp_model(word)
    if len(doc) == 0:
        return word
        
    return doc[0].lemma_

def get_meanings(word, lang_code, lemma=None):
    """Get meanings of a word using translation APIs or WordNet."""
    # First, check cache
    cache_key = f"{lang_code}:{word}"
    if cache_key in TRANSLATION_CACHE:
        return TRANSLATION_CACHE[cache_key]
    
    meanings = []
    
    # Try to get meanings using NLTK's WordNet (English only)
    if lang_code == 'en' and NLTK_AVAILABLE:
        try:
            for synset in wordnet.synsets(lemma or word):
                meanings.append(synset.definition())
                if len(meanings) >= 5:
                    break
        except Exception as e:
            print(f"WordNet error: {e}")
    
    # If no meanings found or not English, try translation API
    if not meanings:
        try:
            # Simple MyMemory Translation API request (free, no key required)
            url = f"https://api.mymemory.translated.net/get?q={word}&langpair={lang_code}|en"
            response = requests.get(url, timeout=5)
            data = response.json()
            
            if 'matches' in data:
                for match in data['matches']:
                    if 'translation' in match and match['translation']:
                        meanings.append(match['translation'])
                    if len(meanings) >= 5:
                        break
        except Exception as e:
            print(f"Translation API error: {e}")
    
    # Fallback if we couldn't find any meanings
    if not meanings:
        meanings = [word]
    
    # Cache the results
    TRANSLATION_CACHE[cache_key] = meanings
    return meanings

def enrich_database(database, lang_code, args):
    """Enrich the database with linguistic information."""
    enriched_db = {}
    words = list(database.keys())
    
    # Load NLP model
    use_spacy = SPACY_AVAILABLE and not args.no_spacy
    nlp_model = load_nlp_model(lang_code, use_spacy) if use_spacy else None
    
    # Initialize NLTK components if available
    if NLTK_AVAILABLE and not args.no_nltk and lang_code == 'en':
        try:
            nltk.download('wordnet', quiet=True)
            nltk.download('omw-1.4', quiet=True)
        except Exception as e:
            print(f"Warning: Failed to download NLTK data: {e}")
    
    print(f"Processing {len(words)} words...")
    
    # Process words in batches
    for i in tqdm(range(0, len(words), args.batch_size)):
        batch = words[i:i+args.batch_size]
        
        for word in batch:
            word_data = database[word]
            
            # Skip words that already have complete data
            if all(k in word_data and word_data[k] for k in ['partOfSpeech', 'morphology', 'meanings', 'lemma', 'LemmaMeanings']):
                enriched_db[word] = word_data
                continue
            
            # Process with NLP pipeline
            pos = word_data.get('partOfSpeech')
            
            # Determine part of speech if not already set
            if not pos and nlp_model:
                doc = nlp_model(word)
                if len(doc) > 0:
                    spacy_pos = doc[0].pos_
                    pos = SPACY_POS_MAP.get(spacy_pos, 'UNKNOWN')
            
            # Get lemma
            lemma = word_data.get('lemma')
            if not lemma:
                lemma = get_lemma(word, pos, nlp_model) if nlp_model else word
            
            # Get morphology
            morphology = word_data.get('morphology')
            if not morphology:
                morphology = get_morphology(word, pos, nlp_model)
            
            # Get meanings
            meanings = word_data.get('meanings', [])
            if not meanings:
                meanings = get_meanings(word, lang_code, lemma)
            
            # Get lemma meanings if needed
            lemma_meanings = word_data.get('LemmaMeanings', [])
            if not lemma_meanings and lemma != word:
                lemma_meanings = get_meanings(lemma, lang_code)
            elif not lemma_meanings:
                lemma_meanings = meanings
            
            # Best translation (first meaning)
            best_translation = word_data.get('bestTranslation')
            if not best_translation and meanings:
                best_translation = meanings[0]
            elif not best_translation:
                best_translation = word
            
            # Populate enriched data
            enriched_db[word] = {
                'wordNumber': word_data.get('wordNumber', 0),
                'frequency': word_data.get('frequency', 1),
                'partOfSpeech': pos or 'UNKNOWN',
                'morphology': morphology or 'invariable',
                'meanings': meanings[:5] if meanings else [word],
                'bestTranslation': best_translation,
                'lemma': lemma,
                'LemmaMeanings': lemma_meanings[:5] if lemma_meanings else [lemma]
            }
    
    return enriched_db

def format_database_code(database, database_name, lang_code):
    """Format the database as JavaScript code."""
    # Convert database to JavaScript format
    js_code = json.dumps(database, indent=2, ensure_ascii=False)
    
    # Convert JSON style to JavaScript style
    js_code = re.sub(r'"(\w+)":', r'\1:', js_code)
    js_code = js_code.replace('"', "'")
    
    language_name = LANGUAGE_NAMES.get(lang_code, lang_code)
    
    return f"""// Enriched word frequency database for {database_name}
// Language: {language_name}
// Generated on: {datetime.datetime.now().isoformat()}
const {database_name} = {js_code};

module.exports = {database_name};
"""

def main():
    """Main entry point for the script."""
    args = parse_args()
    
    try:
        # Extract database from JavaScript file
        database, database_name = extract_database(args.input)
        
        # Detect language if not specified
        lang_code = args.language or detect_language(database, args.sample_text)
        print(f"Using language: {LANGUAGE_NAMES.get(lang_code, lang_code)}")
        
        # Enrich the database
        enriched_db = enrich_database(database, lang_code, args)
        
        # Determine output path
        output_path = args.output
        if not output_path:
            input_path = Path(args.input)
            output_path = input_path.with_stem(f"{input_path.stem}_enriched")
        
        # Format and save the enriched database
        js_code = format_database_code(enriched_db, database_name, lang_code)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(js_code)
        
        print(f"Enriched database saved to: {output_path}")
        print(f"Total words processed: {len(enriched_db)}")
        
    except Exception as e:
        import traceback
        print(f"Error: {e}", file=sys.stderr)
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main() 