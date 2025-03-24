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
import time
import importlib.util
from collections import defaultdict
import numpy as np

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
    'en': 'en_core_web_md',
    'es': 'es_core_news_md',
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

# Language pattern configurations - will be loaded dynamically
LANGUAGE_PATTERNS = {
    # Default language patterns (empty)
    'default': {
        'verb_endings': [],
        'past_patterns': [],
        'imperative_patterns': [],
        'word_map': {},
        'pronouns': [],
    }
}

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
    """Load the appropriate NLP model with preference for medium-sized models."""
    if not use_spacy or not SPACY_AVAILABLE:
        return None
    
    # Updated model mapping to prefer medium models
    LANGUAGE_MODELS = {
        'es': 'es_core_news_md',  # Spanish medium model
        'en': 'en_core_web_md',   # English medium model
        # Add other languages as needed
    }
    
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

def load_language_patterns(lang_code):
    """Dynamically load language-specific patterns in a more robust way."""
    # Use default patterns as a base
    patterns = LANGUAGE_PATTERNS['default'].copy()
    
    # Define possible paths to check for language patterns
    possible_paths = [
        f"language_patterns/{lang_code}_patterns.py",
        f"scripts/language_patterns/{lang_code}_patterns.py",
        f"./language_patterns/{lang_code}_patterns.py",
        f"../language_patterns/{lang_code}_patterns.py"
    ]
    
    # Try each path
    for module_path in possible_paths:
        if os.path.exists(module_path):
            try:
                spec = importlib.util.spec_from_file_location(f"{lang_code}_patterns", module_path)
                if spec and spec.loader:
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)
                    if hasattr(module, 'PATTERNS'):
                        # Update patterns with language-specific ones
                        patterns.update(module.PATTERNS)
                        print(f"Loaded patterns for {lang_code} from {module_path}")
                        return patterns
            except Exception as e:
                print(f"Error loading patterns from {module_path}: {e}")
    
    # If no pattern file is found, try to create a very minimal default pattern
    # This provides some basic functionality without hardcoding language-specific rules
    print(f"No pattern file found for {lang_code}, using minimal default patterns")
    
    # Minimal default pronouns that exist in most languages
    patterns['pronouns'] = ['me', 'you', 'he', 'she', 'it', 'we', 'they']
    
    # Create a stub path for the user to fill in
    create_pattern_stub(lang_code)
    
    return patterns

def create_pattern_stub(lang_code):
    """Create a stub pattern file for the user to fill in."""
    # Only create stub if scripts directory exists
    if os.path.exists('scripts'):
        pattern_dir = 'scripts/language_patterns'
        if not os.path.exists(pattern_dir):
            try:
                os.makedirs(pattern_dir, exist_ok=True)
                print(f"Created language patterns directory: {pattern_dir}")
            except Exception as e:
                print(f"Could not create patterns directory: {e}")
                return
        
        pattern_file = f"{pattern_dir}/{lang_code}_patterns.py"
        if not os.path.exists(pattern_file):
            try:
                with open(pattern_file, 'w', encoding='utf-8') as f:
                    f.write(f"""# {LANGUAGE_NAMES.get(lang_code, lang_code)} language patterns
PATTERNS = {{
    # Add verb endings common in this language (e.g., ['ar', 'er', 'ir'] for Spanish)
    'verb_endings': [],
    
    # Patterns for detecting past tense verbs: (regex_pattern, replacement_for_lemma)
    'past_patterns': [],
    
    # Patterns for detecting imperative verbs: (regex_pattern, replacement_for_lemma)
    'imperative_patterns': [],
    
    # Direct word to lemma mappings for common exceptions
    'word_map': {{}},
    
    # Common pronouns in this language
    'pronouns': []
}}
""")
                print(f"Created pattern stub file: {pattern_file}")
                print(f"Please fill it in with appropriate patterns for {LANGUAGE_NAMES.get(lang_code, lang_code)}")
            except Exception as e:
                print(f"Could not create pattern stub file: {e}")

def is_proper_noun(word, nlp_model):
    """Detect proper nouns in a language-neutral way."""
    # Proper nouns often start with capital letters
    if word and word[0].isupper() and not word.isupper():
        return True
        
    # Check spaCy's detection
    if nlp_model:  # Added check to prevent errors
        doc = nlp_model(word)
        if len(doc) > 0 and doc[0].pos_ == 'PROPN':
            return True
        
    return False

def is_verb_form(word, nlp_model):
    """More robust verb detection."""
    word = word.lower()
    
    # 1. Check basic verb infinitive endings
    if word.endswith(('ar', 'er', 'ir')):
        # Verify minimum length to avoid false positives like "ir" (to go)
        if len(word) > 3:
            return True
    
    # 2. Check common verb conjugation patterns
    # Present tense patterns
    if re.search(r'[aei](s|mos|n|is)$', word):
        return True
        
    # Past tense patterns
    if re.search(r'(é|ó|í|aste|aron|ieron|imos)$', word):
        return True
    
    # Imperative patterns (including with pronouns)
    if re.search(r'[aei](d|n|me|te|le|nos|os|les)$', word):
        return True
    
    # 3. Use spaCy's parser as additional verification
    doc = nlp_model(word)
    if len(doc) > 0:
        token = doc[0]
        # Check morphological features
        if 'VerbForm' in token.morph:
            return True
        # Check dependency parsing
        if token.dep_ in ['ROOT', 'aux', 'verb']:
            return True
    
    return False

def get_normalized_pos(word, nlp_model):
    """Get part of speech only if word exists in model's lexicon."""
    if not nlp_model:
        return ''
    
    # Check if word exists in vocabulary
    word_lower = word.lower()
    if not word_lower in nlp_model.vocab:
        return ''
        
    # Get lexeme (dictionary entry)
    lexeme = nlp_model.vocab[word_lower]
    if not lexeme.is_known:
        return ''
    
    # Process with spaCy for additional verification
    doc = nlp_model(word)
    if len(doc) == 0:
        return ''
    
    token = doc[0]
    spacy_pos = token.pos_
    
    # Map only clear POS categories
    pos_mapping = {
        'VERB': 'VERB',
        'AUX': 'VERB',  # Auxiliary verbs are still verbs
        'NOUN': 'NOUN',
        'ADJ': 'ADJECTIVE',
        'ADV': 'ADVERB'
    }
    
    return pos_mapping.get(spacy_pos, '')

def extract_imperative_pronoun(word, lang_patterns=None):
    """Attempt to extract a pronoun from an imperative verb form in a language-neutral way."""
    if not lang_patterns:
        return None, None
    
    # Check against imperative patterns
    for pattern, replacement in lang_patterns.get('imperative_patterns', []):
        if re.match(pattern, word):
            # Try to find which pronoun is attached
            for pronoun in lang_patterns.get('pronouns', []):
                if word.endswith(pronoun):
                    # Extract stem and pronoun
                    stem = word[:-len(pronoun)]
                    # Try to get the lemma
                    try:
                        lemma = re.sub(pattern, replacement, word)
                        return pronoun, lemma
                    except:
                        pass
    
    return None, None

def get_lemma(word, pos, nlp_model, lang_patterns=None):
    """Get lemma only if we're confident about it."""
    # Check word map first
    if lang_patterns and word in lang_patterns.get('word_map', {}):
        return lang_patterns['word_map'][word].get('lemma', word)
    
    # For unknown words, return the word itself
    if not pos:
        return word
    
    # For verbs, try to get lemma from patterns
    if pos == 'VERB' and lang_patterns:
        # Check verb patterns
        for pattern_type in ['past_patterns', 'imperative_patterns']:
            if pattern_type in lang_patterns:
                for pattern, replacement in lang_patterns[pattern_type]:
                    if re.match(pattern, word):
                        candidate = re.sub(pattern, replacement, word)
                        # Verify candidate is a valid verb form
                        if any(candidate.endswith(ending) for ending in lang_patterns.get('verb_endings', [])):
                            return candidate
    
    # If we can't confidently determine the lemma, return the word itself
    return word

def clean_meaning_text(text):
    """More thorough cleaning of meaning text."""
    if not text or len(text) <= 1:
        return ""
    
    # Remove HTML and brackets
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\[[^\]]*\]', '', text)
    text = re.sub(r'\([^)]*\)', '', text)
    
    # Remove quotes and trailing punctuation
    text = text.replace('"', '').replace('"', '').replace('"', '')
    text = re.sub(r'[.,;:!?]+$', '', text)
    
    # Remove unwanted phrases
    unwanted = [
        "to i ", "to you ", "to he ", "to she ", "to we ", "to they ",
        " —", " -", "to then managed to", "to then", 
        "as viewed through", "previously,", "then",
        "the ", "a ", "an ", "one ", "some ",
        "therefore", "according to", "managed to",
        "aid of", "viewed through", "subsequently",
        "romantic cultural", "then managed", "flow procedure"
    ]
    for phrase in unwanted:
        text = text.replace(phrase, "")
    
    # Clean up spaces
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Validate the cleaned text
    if len(text) < 2 or not any(c.isalpha() for c in text):
        return ""
    if len(text.split()) > 4:  # Too wordy
        return ""
        
    return text

def is_past_tense_verb(word, pos, lang_code, lang_patterns=None):
    """Determine if a word is a past tense verb form using language patterns."""
    if pos != 'VERB' or not lang_patterns:
        return False
    
    # Use language-specific past tense patterns if available
    past_patterns = lang_patterns.get('past_patterns', [])
    if past_patterns:
        return any(re.match(pattern[0], word) for pattern in past_patterns)
    
    # Default: just check if spaCy identifies it as past tense
    try:
        doc = nlp_model(word)
        if len(doc) > 0 and hasattr(doc[0].morph, 'get'):
            tense = doc[0].morph.get('Tense')
            return tense and tense[0].lower() == 'past'
    except:
        pass
    
    return False

def improve_meanings_format(meanings, pos, lang_code, original_word='', lang_patterns=None):
    """Format meanings with better consistency."""
    if not meanings:
        return []
    
    # Determine verb form
    is_imperative = False
    is_past_verb = False
    if pos == 'VERB' and lang_patterns:
        # Check imperative patterns
        for pattern, _ in lang_patterns.get('imperative_patterns', []):
            if re.match(pattern, original_word):
                is_imperative = True
                break
        # Check past patterns
        for pattern, _ in lang_patterns.get('past_patterns', []):
            if re.match(pattern, original_word):
                is_past_verb = True
                break
    
    # Get pronouns list
    pronouns = lang_patterns.get('pronouns', []) if lang_patterns else []
    
    normalized = []
    seen = set()
    
    for meaning in meanings:
        clean_meaning = clean_meaning_text(meaning.lower())
        if not clean_meaning or clean_meaning in seen:
            continue
        
        # Format based on POS and form
        if pos == 'VERB':
            # Handle different verb forms
            if is_imperative or is_past_verb:
                if clean_meaning.startswith('to '):
                    clean_meaning = clean_meaning[3:]
            elif not any(clean_meaning.startswith(p) for p in ['i ', 'he ', 'she ', 'we ', 'they ', 'you ']):
                if not clean_meaning.startswith('to '):
                    clean_meaning = f"to {clean_meaning}"
        
        if clean_meaning and clean_meaning not in seen:
            normalized.append(clean_meaning)
            seen.add(clean_meaning)
    
    return normalized[:4]

def format_translations(translations, is_verb_lemma=False):
    """Format translations, adding 'to' for verb lemmas."""
    formatted = []
    for trans in translations:
        trans = trans.lower().strip()
        if is_verb_lemma and not trans.startswith('to '):
            trans = f"to {trans}"
        formatted.append(trans)
    return formatted

def get_translations(word, source_lang='es', is_verb_lemma=False, max_translations=4):
    """Get multiple English translations using MyMemory API."""
    translations = []
    try:
        url = f"https://api.mymemory.translated.net/get?q={word}&langpair={source_lang}|en"
        response = requests.get(url, timeout=5)
        data = response.json()
        
        # Get main translation
        if 'responseData' in data and data['responseData']['translatedText']:
            main_trans = data['responseData']['translatedText'].lower().strip()
            if main_trans:
                translations.append(main_trans)
        
        # Get additional translations from matches
        if 'matches' in data:
            for match in data['matches']:
                if 'translation' in match:
                    trans = match['translation'].lower().strip()
                    if trans and trans not in translations:
                        translations.append(trans)
                        if len(translations) >= max_translations:
                            break
    
    except Exception as e:
        print(f"Translation error: {e}")
    
    # Format translations based on whether it's a verb lemma
    return format_translations(translations, is_verb_lemma)

def get_lemma_meanings(lemma, lang_code, pos, nlp_model=None, lang_patterns=None):
    """Get accurate meanings for lemma words with improved filtering."""
    # Use regular API but pass nlp_model to fix scope issues
    meanings = get_meanings_from_api(lemma, lang_code, pos, lang_patterns, nlp_model)
    
    # Filter out low-quality meanings
    filtered_meanings = []
    seen_stems = set()
    
    for meaning in meanings:
        # Skip empty strings or single characters
        if not meaning or len(meaning) <= 1:
            continue
            
        # Generate a stem to detect duplicates
        stem = meaning.lower()
        # Remove common prefixes like "to " for verbs
        if pos == 'VERB' and stem.startswith('to '):
            stem = stem[3:]
            
        # Remove common qualifiers like "one" for nouns
        if pos == 'NOUN':
            stem = re.sub(r'^(a|an|the|one|some) ', '', stem)
        
        # Check if we've seen this stem before (avoid "time" and "one time")
        if stem in seen_stems:
            continue
            
        # Add to filtered list and track the stem
        filtered_meanings.append(meaning)
        seen_stems.add(stem)
    
    # Ensure consistent results for empty lists
    if not filtered_meanings and pos == 'NOUN':
        # For nouns with no meanings, try to create one from the lemma itself
        filtered_meanings = [lemma]
    
    return filtered_meanings

def enhance_spanish_verb_analysis(word, pos, meanings, lemma):
    """Special handling for Spanish verbs, particularly imperatives with pronouns."""
    
    # If it's an imperative with attached pronoun
    if word.endswith('me') and pos == 'VERB':
        if lemma == 'llamar' and 'call me' not in meanings:
            meanings.insert(0, 'call me')
        elif lemma == 'decir' and 'tell me' not in meanings:
            meanings.insert(0, 'tell me')
        elif lemma == 'dar' and 'give me' not in meanings:
            meanings.insert(0, 'give me')
    
    # Similar patterns for other pronouns
    elif word.endswith('te') and pos == 'VERB':
        if lemma == 'llamar' and 'call you' not in meanings:
            meanings.insert(0, 'call you')
    
    # Return possibly modified meanings
    return meanings

def filter_poor_quality_meanings(meanings_list):
    """Filter out poor quality meanings based on content analysis."""
    if not meanings_list:
        return []
    
    filtered = []
    
    for meaning in meanings_list:
        # Skip meanings that are suspiciously specific or nonsensical
        if any(bad_pattern in meaning.lower() for bad_pattern in [
            "previously", "therefore", "according to", "managed to",
            "aid of", "viewed through", "subsequently", "romantic cultural",
            "then managed", "flow procedure", "extrasensory"
        ]):
            continue
            
        # Keep good meanings
        filtered.append(meaning)
    
    return filtered

def apply_quality_checks(entry, nlp_model=None):
    """Apply stricter quality checks."""
    word = entry.get('word', '')
    pos = entry.get('partOfSpeech', '')
    lemma = entry.get('lemma', '')
    
    # Fix proper noun handling
    if word and word[0].isupper() and not word.isupper():
        if pos != 'NOUN':
            entry['partOfSpeech'] = 'NOUN'
        # Keep original capitalization for proper nouns
        entry['lemma'] = word
    
    # Fix empty or invalid lemmas
    if not lemma or ' ' in lemma or len(lemma) < 2:
        entry['lemma'] = word
    
    # Clean up meanings
    entry['meanings'] = filter_poor_quality_meanings(entry.get('meanings', []))
    entry['LemmaMeanings'] = filter_poor_quality_meanings(entry.get('LemmaMeanings', []))
    
    # Ensure proper nouns have at least one meaning
    if pos == 'NOUN' and word[0].isupper() and not entry['meanings']:
        entry['meanings'] = [word]
        entry['LemmaMeanings'] = [word]
    
    return entry

def get_pos_from_model(word, nlp_model):
    """Check word in es_core_news_md and return any valid POS found."""
    if not nlp_model:
        return ''
        
    # Process the word
    doc = nlp_model(word)
    if len(doc) == 0:
        return ''
        
    # Get the POS and morphology
    token = doc[0]
    pos = token.pos_
    morph = token.morph
    
    # Special case handling
    if pos == 'VERB':
        # Check if it might be an adjective misidentified as verb
        if 'Gender' in morph and 'Number' in morph:
            # Words with gender and number are more likely to be adjectives
            if word.endswith(('a', 'o', 'as', 'os')):
                return 'ADJECTIVE'
    
    # Map all valid spaCy POS tags
    pos_mapping = {
        'VERB': 'VERB',
        'AUX': 'VERB',
        'NOUN': 'NOUN',
        'PROPN': 'NOUN',
        'ADJ': 'ADJECTIVE',
        'ADV': 'ADVERB',
        'DET': 'DETERMINER',
        'PRON': 'PRONOUN',
        'ADP': 'PREPOSITION',
        'CCONJ': 'CONJUNCTION',
        'SCONJ': 'CONJUNCTION',
        'NUM': 'NUMERAL',
        'INTJ': 'INTERJECTION',
        'PART': 'PARTICLE'
    }
    
    return pos_mapping.get(pos, pos)

def enrich_database(database, lang_code, args):
    """Process each word in database with improved enrichment."""
    try:
        nlp_model = spacy.load(LANGUAGE_MODELS.get(lang_code, 'es_core_news_md'))
    except:
        print("Error: Please install the required model")
        return database

    print(f"\nProcessing {len(database)} words...")
    enriched = {}
    
    for word in tqdm(database.keys()):
        enriched[word] = database[word].copy()
        
        try:
            # Process word
            doc = nlp_model(word)
            token = doc[0]
            
            # Get POS - keep all valid POS tags from spaCy
            pos = token.pos_
            
            # Get lemma
            lemma = token.lemma_
            
            # Get multiple translations
            word_translations = get_translations(word, lang_code)
            lemma_translations = get_translations(lemma, lang_code, is_verb_lemma=(pos == 'VERB'))
            
            # Update entry
            enriched[word].update({
                'partOfSpeech': pos,
                'lemma': lemma,
                'meanings': word_translations,
                'LemmaMeanings': lemma_translations
            })
            
        except Exception as e:
            print(f"Error processing word '{word}': {e}")
    
    return enriched

def get_verb_lemma(word, nlp_model):
    """Get correct lemma for Spanish verbs, handling attached pronouns."""
    word = word.lower()
    
    # If word already ends in ar/er/ir, it's likely already a lemma
    if word.endswith(('ar', 'er', 'ir')) and len(word) > 3:
        return word
        
    # Check for attached pronouns (me, te, le, nos, os, les)
    pronouns = ['me', 'te', 'le', 'nos', 'os', 'les']
    for pronoun in pronouns:
        if word.endswith(pronoun):
            # Remove pronoun and try to get base form
            base = word[:-len(pronoun)]
            # Check common imperative to infinitive patterns
            if base.endswith('d'):  # llamad + me -> llamar
                return base[:-1] + 'r'
            if base.endswith('id'):  # decid + me -> decir
                return base[:-2] + 'ir'
    
    # Use spaCy's lemmatizer as fallback
    doc = nlp_model(word)
    return doc[0].lemma_

def test_single_word(word, lang_code=None):
    """Enhanced test function with better translation formatting."""
    print(f"\n===== ANALYZING WORD: '{word}' =====")
    
    # Detect language if not provided
    if not lang_code:
        lang_code, confidence = langid.classify(word)
        print(f"\nLANGUAGE DETECTION:")
        print(f"  Detected language: {LANGUAGE_NAMES.get(lang_code, lang_code)}")
        print(f"  Confidence: {confidence:.2f}")
    
    try:
        nlp_model = spacy.load(LANGUAGE_MODELS.get(lang_code, 'es_core_news_md'))
    except:
        print(f"ERROR: Please install required model")
        return

    # Process word
    doc = nlp_model(word)
    token = doc[0]
    
    # Get POS
    pos = token.pos_
    
    # Get lemma with special handling for verbs
    if pos == 'VERB':
        lemma = get_verb_lemma(word, nlp_model)
    else:
        lemma = token.lemma_
    
    # Get translations (add 'to' for verb lemmas)
    word_translations = get_translations(word, lang_code)
    lemma_translations = get_translations(lemma, lang_code, is_verb_lemma=(pos == 'VERB'))
    
    print("\nANALYSIS:")
    print(f"  Word: {word}")
    print(f"  Part of Speech: {pos}")
    print("  Translations:")
    for i, trans in enumerate(word_translations, 1):
        print(f"    {i}. {trans}")
    print(f"  Lemma: {lemma}")
    print("  Lemma translations:")
    for i, trans in enumerate(lemma_translations, 1):
        print(f"    {i}. {trans}")

    return {
        'word': word,
        'pos': pos,
        'translations': word_translations,
        'lemma': lemma,
        'lemma_translations': lemma_translations
    }

def format_database_code(database, database_name, lang_code):
    """Format the database exactly like the input format to avoid syntax issues."""
    # Get empty arrays and other data in the right format
    output_parts = []
    output_parts.append(f"// Enriched word frequency database for {database_name}")
    output_parts.append(f"// Language: {LANGUAGE_NAMES.get(lang_code, lang_code)}")
    output_parts.append(f"// Generated on: {datetime.datetime.now().isoformat()}")
    output_parts.append(f"const {database_name} = {{")
    
    # Sort words by wordNumber if available
    sorted_words = sorted(database.keys(), key=lambda w: database[w].get('wordNumber', 0))
    
    for i, word in enumerate(sorted_words):
        word_data = database[word]
        
        # Start the word entry
        output_parts.append(f"  '{word}': {{")
        
        # Add each property exactly in the right format
        output_parts.append(f"    wordNumber: {word_data.get('wordNumber', 0)},")
        output_parts.append(f"    frequency: {word_data.get('frequency', 1)},")
        
        # For string values, ensure they're properly escaped
        pos = word_data.get('partOfSpeech', '')
        if "'" in pos:
            pos = pos.replace("'", "\\'")
        output_parts.append(f"    partOfSpeech: '{pos}',")
        
        morph = word_data.get('morphology', '')
        if "'" in morph:
            morph = morph.replace("'", "\\'")
        output_parts.append(f"    morphology: '{morph}',")
        
        # For arrays, format them exactly as in the original
        meanings = word_data.get('meanings', [])
        if meanings:
            output_parts.append("    meanings: [")
            for j, meaning in enumerate(meanings):
                # Escape any single quotes in the meaning
                safe_meaning = meaning.replace("'", "\\'")
                
                # Remove any line breaks that would break JavaScript
                safe_meaning = safe_meaning.replace("\n", " ").replace("\r", " ")
                
                output_parts.append(f"      '{safe_meaning}'{',' if j < len(meanings) - 1 else ''}")
            output_parts.append("    ],")
        else:
            output_parts.append("    meanings: [],")
        
        # Best translation
        best_trans = word_data.get('bestTranslation', '')
        if "'" in best_trans:
            best_trans = best_trans.replace("'", "\\'")
        best_trans = best_trans.replace("\n", " ").replace("\r", " ")  # Remove line breaks
        output_parts.append(f"    bestTranslation: '{best_trans}',")
        
        # Lemma
        lemma = word_data.get('lemma', '')
        if "'" in lemma:
            lemma = lemma.replace("'", "\\'")
        output_parts.append(f"    lemma: '{lemma}',")
        
        # Lemma meanings array
        lemma_meanings = word_data.get('LemmaMeanings', [])
        if lemma_meanings:
            output_parts.append("    LemmaMeanings: [")
            for j, meaning in enumerate(lemma_meanings):
                # Escape any single quotes in the meaning
                safe_meaning = meaning.replace("'", "\\'")
                
                # Remove any line breaks that would break JavaScript
                safe_meaning = safe_meaning.replace("\n", " ").replace("\r", " ")
                
                output_parts.append(f"      '{safe_meaning}'{',' if j < len(lemma_meanings) - 1 else ''}")
            output_parts.append("    ]")
        else:
            output_parts.append("    LemmaMeanings: []")
        
        # Close the word entry
        output_parts.append(f"  }}{'' if i == len(sorted_words) - 1 else ','}")
    
    # Close the database object
    output_parts.append("};")
    output_parts.append("")  # Add a blank line
    output_parts.append(f"export default {database_name};")
    
    # Join all parts with newlines
    return "\n".join(output_parts)

def test_pos(words, lang_code='es'):
    """Test part of speech detection on multiple words."""
    print(f"\n===== TESTING PART OF SPEECH DETECTION FOR {len(words)} WORDS =====")
    
    # Load NLP model
    if not SPACY_AVAILABLE:
        print("ERROR: spaCy is required for this test")
        return
    
    nlp_model = load_nlp_model(lang_code)
    if not nlp_model:
        print(f"ERROR: Could not load spaCy model for {lang_code}")
        return
    
    results = []
    
    for word in words:
        doc = nlp_model(word)
        if len(doc) == 0:
            raw_pos = "UNKNOWN"
        else:
            raw_pos = doc[0].pos_
        
        # Get our mapped POS
        mapped_pos = SPACY_POS_MAP.get(raw_pos, 'UNKNOWN')
        
        # Get normalized POS
        norm_pos = get_normalized_pos(word, nlp_model)
        
        # Store results
        results.append({
            'word': word,
            'raw_spacy_pos': raw_pos,
            'mapped_pos': mapped_pos,
            'normalized_pos': norm_pos,
            'correction_applied': mapped_pos != norm_pos
        })
    
    # Print results in table format
    print("\n{:<15} {:<12} {:<12} {:<15} {:<10}".format(
        "WORD", "SPACY RAW", "MAPPED POS", "NORMALIZED POS", "CORRECTED?"
    ))
    print("-" * 70)
    
    for r in results:
        print("{:<15} {:<12} {:<12} {:<15} {:<10}".format(
            r['word'], 
            r['raw_spacy_pos'], 
            r['mapped_pos'], 
            r['normalized_pos'],
            "YES" if r['correction_applied'] else "NO"
        ))
    
    return results

def main():
    """Main entry point for the script."""
    # Check for test modes
    if len(sys.argv) > 1:
        # Test a single word
        if sys.argv[1] == "--test":
            if len(sys.argv) > 2:
                test_word = sys.argv[2]
                lang = sys.argv[3] if len(sys.argv) > 3 else 'es'
                test_single_word(test_word, lang)
                return
        
        # Test part of speech on multiple words
        elif sys.argv[1] == "--test-pos":
            if len(sys.argv) > 2:
                words = sys.argv[2].split(',')
                lang = sys.argv[3] if len(sys.argv) > 3 else 'es'
                test_pos(words, lang)
                return
            else:
                print("Please provide words to test, separated by commas")
                print("Example: python enrich_database_nlp.py --test-pos llamar,hablar,comer es")
                sys.exit(1)
    
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
    # Check for test modes
    if len(sys.argv) > 1:
        # Test a single word
        if sys.argv[1] == "--test":
            if len(sys.argv) > 2:
                test_word = sys.argv[2]
                lang = sys.argv[3] if len(sys.argv) > 3 else 'es'
                test_single_word(test_word, lang)
                sys.exit(0)
            else:
                print("Please provide a word to test")
                print("Example: python enrich_database_nlp.py --test llamadme es")
                sys.exit(1)
        
        # Test part of speech on multiple words
        elif sys.argv[1] == "--test-pos":
            if len(sys.argv) > 2:
                words = sys.argv[2].split(',')
                lang = sys.argv[3] if len(sys.argv) > 3 else 'es'
                test_pos(words, lang)
                sys.exit(0)
            else:
                print("Please provide words to test, separated by commas")
                print("Example: python enrich_database_nlp.py --test-pos llamar,hablar,comer es")
                sys.exit(1)
    
    # Otherwise, run the normal script
    main() 