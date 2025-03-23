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

def get_normalized_pos(word, nlp_model, lang_patterns=None):
    """Get part of speech using more conservative overrides."""
    # Process with spaCy
    doc = nlp_model(word)
    if len(doc) == 0:
        return ''
    
    # Basic POS from spaCy
    spacy_pos = doc[0].pos_
    pos = SPACY_POS_MAP.get(spacy_pos, '')
    
    # Handle proper nouns first - they should almost always remain NOUN
    if is_proper_noun(word, nlp_model):
        return 'NOUN'
    
    # Only override spaCy if we have high confidence
    if lang_patterns:
        # Check if it's in our word map with a known verb ending
        if word in lang_patterns.get('word_map', {}):
            lemma = lang_patterns['word_map'][word]
            if any(lemma.endswith(ending) for ending in lang_patterns.get('verb_endings', [])):
                return 'VERB'
        
        # Only use pattern matching for verbs if there's a clear match AND spaCy doesn't have high confidence
        if spacy_pos not in ['VERB', 'AUX', 'NOUN', 'PROPN']:
            # Check imperative patterns (more reliable)
            for pattern, _ in lang_patterns.get('imperative_patterns', []):
                if re.match(pattern, word):
                    return 'VERB'
            
            # Check verb endings directly (if both past and verb endings are defined)
            if lang_patterns.get('past_patterns') and lang_patterns.get('verb_endings'):
                for pattern, _ in lang_patterns.get('past_patterns', []):
                    if re.match(pattern, word):
                        return 'VERB'
    
    # For a few very common POS tags, trust spaCy more
    if spacy_pos in ['VERB', 'AUX', 'NOUN', 'PROPN', 'ADJ', 'ADV']:
        return pos
    
    return pos

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
    """Get the lemma with improved validation."""
    # Don't lemmatize proper nouns or numerals
    if pos == 'NOUN' and is_proper_noun(word, nlp_model):
        return word
    
    if pos == 'NUMERAL' or word.isdigit():
        return word
    
    # Check language-specific word map if available
    if lang_patterns and 'word_map' in lang_patterns:
        if word in lang_patterns['word_map']:
            return lang_patterns['word_map'][word]
    
    # Process with spaCy
    doc = nlp_model(word)
    spacy_lemma = doc[0].lemma_ if len(doc) > 0 else word
    
    # If spaCy gives a plausible lemma different from the word, prioritize it
    if spacy_lemma != word:
        # Verify the lemma looks reasonable (e.g., not "confor yo")
        if ' ' not in spacy_lemma and len(spacy_lemma) > 1:
            return spacy_lemma
    
    # For verbs, apply language-specific patterns if available
    if lang_patterns and pos == 'VERB':
        for pattern_type in ['past_patterns', 'imperative_patterns']:
            if pattern_type in lang_patterns:
                for pattern, replacement in lang_patterns[pattern_type]:
                    if re.match(pattern, word):
                        candidate = re.sub(pattern, replacement, word)
                        # Verify candidate is a plausible lemma
                        if any(candidate.endswith(ending) for ending in lang_patterns.get('verb_endings', [])):
                            return candidate
    
    # If we couldn't find a better lemma, return the word itself for stability
    if spacy_lemma.strip() == '' or ' ' in spacy_lemma:
        return word
        
    return spacy_lemma

def clean_meaning_text(text):
    """More thorough cleaning of meaning text."""
    # Skip invalid or empty meanings
    if not text or len(text) <= 1 or text in [".", ",", "-", ";"]:
        return ""
    
    # Strip HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Remove brackets and their contents
    text = re.sub(r'\[[^\]]*\]', '', text)
    text = re.sub(r'\([^)]*\)', '', text)
    
    # Remove quotes
    text = text.replace('"', '').replace('"', '').replace('"', '')
    
    # Remove trailing punctuation
    text = re.sub(r'[.,;:!?]+$', '', text)
    
    # Remove common unwanted phrases
    unwanted = [
        "to i ", "to you ", "to he ", "to she ", "to we ", "to they ",
        " —", " -", "to then managed to", "to then", 
        "as viewed through", "previously,", "then",
        "the ", "a ", "an ", "one "  # Common articles and quantifiers
    ]
    for phrase in unwanted:
        text = text.replace(phrase, "")
    
    # Fix common issues in translation API responses
    text = text.replace("to I ", "I ")
    text = text.replace("to He ", "He ")
    text = text.replace("to She ", "She ")
    
    # Remove multiple spaces
    text = re.sub(r'\s+', ' ', text)
    
    # Trim
    cleaned = text.strip()
    
    # Filter out obviously poor meanings
    if len(cleaned) < 2 or not any(c.isalpha() for c in cleaned):
        return ""
    
    # Remove meanings that are too specific (often incorrect)
    if len(cleaned.split()) > 6:  # Too wordy to be a clean meaning
        return ""
        
    return cleaned

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
    """More consistent formatting of meanings."""
    if not meanings:
        return []
    
    # Special handling for imperative forms
    is_imperative = False
    if pos == 'VERB' and lang_patterns:
        for pattern, _ in lang_patterns.get('imperative_patterns', []):
            if re.match(pattern, original_word):
                is_imperative = True
                break
    
    # Determine if this is a past/conjugated verb form
    is_past_verb = is_past_tense_verb(original_word, pos, lang_code, lang_patterns)
    is_conjugated = is_past_verb or is_imperative
    
    # Get pronouns from language patterns
    pronouns = lang_patterns.get('pronouns', []) if lang_patterns else []
    
    # Normalize and remove duplicates
    normalized = []
    seen = set()
    
    for meaning in meanings:
        # Clean and normalize the meaning
        clean_meaning = clean_meaning_text(meaning.lower())
        
        # Skip if empty or seen
        if not clean_meaning or clean_meaning in seen:
            continue
        
        # Format based on part of speech AND tense/form
        formatted_meaning = clean_meaning
        
        if pos == 'VERB':
            # Case 1: Already has personal pronoun - keep as is
            if any(clean_meaning.startswith(pronoun) for pronoun in ['i ', 'he ', 'she ', 'we ', 'they ', 'you ']):
                formatted_meaning = clean_meaning
            
            # Case 2: Has object pronouns - keep as is 
            elif pronouns and any(f" {pronoun} " in f" {clean_meaning} " for pronoun in pronouns):
                formatted_meaning = clean_meaning
            
            # Case 3: Imperative forms (like "llamadme") - remove "to" prefix
            elif is_imperative:
                if clean_meaning.startswith('to '):
                    formatted_meaning = clean_meaning[3:]
                else:
                    formatted_meaning = clean_meaning
            
            # Case 4: Conjugated verb forms - no "to" prefix
            elif is_conjugated:
                if clean_meaning.startswith('to '):
                    formatted_meaning = clean_meaning[3:]
                else:
                    formatted_meaning = clean_meaning
            
            # Case 5: Infinitive verb form - add "to" if needed
            elif lang_code != 'en' and not clean_meaning.startswith('to '):
                formatted_meaning = f"to {clean_meaning}"
            
            # All other cases - use as is
            else:
                formatted_meaning = clean_meaning
        else:
            # For non-verbs, just use the cleaned form
            formatted_meaning = clean_meaning
        
        # Add to results if not seen
        if formatted_meaning not in seen and formatted_meaning:
            normalized.append(formatted_meaning)
            seen.add(formatted_meaning)
            seen.add(clean_meaning)
    
    # Ensure we don't exceed 4 meanings
    return normalized[:4]

def get_meanings_from_api(word, lang_code, pos='', lang_patterns=None, nlp_model=None):
    """Get word meanings with language-neutral handling of special cases."""
    # Add nlp_model as a parameter to fix scope issues
    
    # Cache check
    cache_key = f"{lang_code}:{word}:{pos}"
    if cache_key in TRANSLATION_CACHE:
        return TRANSLATION_CACHE[cache_key]
    
    # For numbers and digits, return empty meanings
    if word.isdigit():
        return []
    
    # For proper nouns, try to preserve the case
    if pos == 'NOUN' and nlp_model and is_proper_noun(word, nlp_model):
        try:
            url = f"https://api.mymemory.translated.net/get?q={word}&langpair={lang_code}|en"
            response = requests.get(url, timeout=5)
            data = response.json()
            
            if 'matches' in data and data['matches']:
                for match in data['matches']:
                    if 'translation' in match:
                        trans = match['translation'].strip()
                        # Preserve capitalization for proper nouns
                        if trans and trans[0].isupper():
                            return [trans]
        except Exception as e:
            print(f"Error with proper noun translation for '{word}': {e}")
    
    # Special handling for imperative forms with attached pronouns
    if pos == 'VERB' and lang_patterns:
        pronoun, lemma = extract_imperative_pronoun(word, lang_patterns)
        
        if pronoun:
            # Try to get direct translation first
            try:
                url = f"https://api.mymemory.translated.net/get?q={word}&langpair={lang_code}|en"
                response = requests.get(url, timeout=5)
                data = response.json()
                
                if 'matches' in data and data['matches']:
                    for match in data['matches']:
                        if 'translation' in match:
                            trans = clean_meaning_text(match['translation'].lower())
                            # Remove "to" prefix from imperatives
                            if trans.startswith('to '):
                                trans = trans[3:]
                            # Return the clean form if it looks good
                            if ' ' in trans and len(trans) > 3:
                                return [trans]
            except Exception:
                pass
            
            # Fallback: try to construct from lemma + pronoun
            try:
                # Get lemma meaning first
                lemma_url = f"https://api.mymemory.translated.net/get?q={lemma}&langpair={lang_code}|en"
                lemma_response = requests.get(lemma_url, timeout=5)
                lemma_data = lemma_response.json()
                
                # Then get pronoun translation
                pronoun_url = f"https://api.mymemory.translated.net/get?q={pronoun}&langpair={lang_code}|en"
                pronoun_response = requests.get(pronoun_url, timeout=5)
                pronoun_data = pronoun_response.json()
                
                # Combine them intelligently
                if 'matches' in lemma_data and 'matches' in pronoun_data:
                    lemma_trans = ""
                    pronoun_trans = ""
                    
                    for match in lemma_data['matches']:
                        if 'translation' in match:
                            lemma_trans = clean_meaning_text(match['translation'].lower())
                            if lemma_trans.startswith('to '):
                                lemma_trans = lemma_trans[3:]
                            break
                    
                    for match in pronoun_data['matches']:
                        if 'translation' in match:
                            pronoun_trans = clean_meaning_text(match['translation'].lower())
                            break
                    
                    if lemma_trans and pronoun_trans:
                        return [f"{lemma_trans} {pronoun_trans}"]
            except Exception as e:
                print(f"Error with imperative form handling for '{word}': {e}")
    
    # Now try the regular API approach
    try:
        # Use MyMemory API for translation
        url = f"https://api.mymemory.translated.net/get?q={word}&langpair={lang_code}|en"
        response = requests.get(url, timeout=5)
        data = response.json()
        
        meanings = []
        
        # Get translations from API response
        if 'matches' in data:
            for match in data['matches']:
                if 'translation' in match and match['translation']:
                    # Clean up translation
                    translation = clean_meaning_text(match['translation'])
                    
                    # Skip if empty or duplicate
                    if translation and translation.lower() not in [m.lower() for m in meanings]:
                        meanings.append(translation)
                    if len(meanings) >= 4:  # Limit to 4 meanings
                        break
        
        # Format meanings properly based on part of speech and original word
        formatted = improve_meanings_format(meanings, pos, lang_code, word, lang_patterns)
        TRANSLATION_CACHE[cache_key] = formatted
        return formatted
    
    except Exception as e:
        print(f"Error getting meanings for '{word}': {e}")
        return []

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
    """Apply quality checks to fix common issues in a language-neutral way."""
    word = entry.get('word', '')
    pos = entry.get('partOfSpeech', '')
    lemma = entry.get('lemma', '')
    
    # Fix POS for proper nouns
    if word and word[0].isupper() and pos != 'NOUN' and nlp_model:
        if is_proper_noun(word, nlp_model):
            entry['partOfSpeech'] = 'NOUN'
    
    # Ensure proper nouns keep their capitalization
    if pos == 'NOUN' and word and word[0].isupper() and lemma != word:
        # For proper nouns, prefer to keep the original capitalization
        entry['lemma'] = word
    
    # Fix bad lemmas - if lemma contains spaces or is empty, use original word
    if not lemma or ' ' in lemma:
        entry['lemma'] = word
    
    # Fix bad lemma meanings by removing suspicious entries
    meanings = entry.get('LemmaMeanings', [])
    cleaned_meanings = []
    for meaning in meanings:
        # Skip very short or suspicious entries
        if len(meaning) < 2 or meaning in ['.', ',', '-']:
            continue
        # Skip obviously wrong patterns
        if any(bad in meaning.lower() for bad in ['therefore', 'according to', 'viewed through']):
            continue
        cleaned_meanings.append(meaning)
    
    # If we filtered everything out but should have meanings, add a basic one
    if not cleaned_meanings and pos == 'NOUN':
        cleaned_meanings = [lemma.lower()]
    
    entry['LemmaMeanings'] = cleaned_meanings
    
    return entry

def enrich_database(database, lang_code, args):
    """Enrich the database with linguistic information."""
    enriched_db = {}
    words = list(database.keys())
    
    # Load NLP model
    use_spacy = SPACY_AVAILABLE and not args.no_spacy
    nlp_model = load_nlp_model(lang_code, use_spacy) if use_spacy else None
    
    # Load language-specific patterns
    lang_patterns = load_language_patterns(lang_code)
    
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
            
            try:
                # Determine part of speech using spaCy (with language-specific patterns)
                pos = ''
                if nlp_model:
                    pos = get_normalized_pos(word, nlp_model, lang_patterns)
                
                # Get lemma using NLP model and language patterns
                lemma = word
                if nlp_model:
                    lemma = get_lemma(word, pos, nlp_model, lang_patterns)
                
                # Get word morphology
                morphology = ''
                if nlp_model and len(pos) > 0:
                    morphology = get_morphology(word, pos, nlp_model)
                
                # Get word meanings from API using POS info and language patterns
                # Pass nlp_model to fix scope issues
                meanings = get_meanings_from_api(word, lang_code, pos, lang_patterns, nlp_model)
                
                # Get lemma meanings with improved function
                lemma_meanings = []
                if lemma != word:
                    # Pass nlp_model to fix scope issues
                    lemma_meanings = get_lemma_meanings(lemma, lang_code, pos, nlp_model, lang_patterns)
                else:
                    lemma_meanings = meanings
                
                # Apply quality checks to fix common issues
                enriched_entry = {
                    'word': word,  # Include the word for quality checks
                    'wordNumber': word_data.get('wordNumber', 0),
                    'frequency': word_data.get('frequency', 1),
                    'partOfSpeech': pos,
                    'morphology': morphology,
                    'meanings': meanings,
                    'bestTranslation': '',  # Leave blank as requested
                    'lemma': lemma,
                    'LemmaMeanings': lemma_meanings
                }
                
                # Apply quality checks before storing
                enriched_entry = apply_quality_checks(enriched_entry, nlp_model)
                
                # Remove temporary fields
                if 'word' in enriched_entry:
                    del enriched_entry['word']
                
                # Store the enriched data
                enriched_db[word] = enriched_entry
                
                # Add a short delay to prevent API rate limiting
                if i % 5 == 0:
                    time.sleep(0.1)
                
            except Exception as e:
                print(f"Error processing word '{word}': {e}")
                # If error, keep original data
                enriched_db[word] = word_data
    
    return enriched_db

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

def test_single_word(word, lang_code='es'):
    """Test the enrichment pipeline on a single word with detailed output."""
    print(f"\n===== ANALYZING WORD: '{word}' =====")
    
    # Load NLP model
    if not SPACY_AVAILABLE:
        print("ERROR: spaCy is required for this test")
        return
    
    nlp_model = load_nlp_model(lang_code)
    if not nlp_model:
        print(f"ERROR: Could not load spaCy model for {lang_code}")
        return
    
    # Load language patterns
    lang_patterns = load_language_patterns(lang_code)
    print(f"Using language patterns for: {lang_code}")
    
    print("\n1. SPACY ANALYSIS:")
    doc = nlp_model(word)
    if len(doc) == 0:
        print("  No tokens found")
    else:
        token = doc[0]
        print(f"  Raw token: {token.text}")
        print(f"  spaCy POS tag: {token.pos_}")
        print(f"  spaCy detailed tag: {token.tag_}")
        print(f"  spaCy lemma: {token.lemma_}")
        print(f"  spaCy morphology: {token.morph}")
        
        # Show spaCy's dependency parsing info
        print(f"  Dependency relation: {token.dep_}")
        if token.head.text != token.text:
            print(f"  Head word: {token.head.text} (POS: {token.head.pos_})")
    
    # Get part of speech with our improved function
    pos = get_normalized_pos(word, nlp_model, lang_patterns)
    print(f"\n2. PART OF SPEECH:")
    raw_pos = doc[0].pos_ if len(doc) > 0 else "UNKNOWN"
    mapped_pos = SPACY_POS_MAP.get(raw_pos, "UNKNOWN")
    print(f"  spaCy raw POS: {raw_pos}")
    print(f"  Mapped POS: {mapped_pos}")
    print(f"  Final POS: {pos}")
    if pos != mapped_pos:
        print(f"  Note: POS was corrected from '{mapped_pos}' to '{pos}'")
    
    # Get the lemma (base form)
    lemma = get_lemma(word, pos, nlp_model, lang_patterns)
    print(f"\n3. LEMMA ANALYSIS:")
    print(f"  spaCy lemma: {doc[0].lemma_ if len(doc) > 0 else 'UNKNOWN'}")
    print(f"  Our lemma: {lemma}")
    if lemma != (doc[0].lemma_ if len(doc) > 0 else word):
        print(f"  Note: Lemma was corrected from '{doc[0].lemma_ if len(doc) > 0 else word}' to '{lemma}'")
    
    # Get morphological features
    morphology = get_morphology(word, pos, nlp_model)
    print(f"\n4. MORPHOLOGY:")
    print(f"  Morphological features: {morphology}")
    
    # Get meanings
    print(f"\n5. WORD MEANINGS:")
    meanings = get_meanings_from_api(word, lang_code, pos, lang_patterns, nlp_model)
    if meanings:
        for i, meaning in enumerate(meanings, 1):
            print(f"  {i}. {meaning}")
    else:
        print("  No meanings found")
    
    # Get lemma meanings using our improved function
    print(f"\n6. LEMMA MEANINGS:")
    if lemma != word:
        lemma_meanings = get_lemma_meanings(lemma, lang_code, pos, nlp_model, lang_patterns)
        if lemma_meanings:
            for i, meaning in enumerate(lemma_meanings, 1):
                print(f"  {i}. {meaning}")
        else:
            print("  No lemma meanings found")
    else:
        print(f"  (Same as word meanings - lemma '{lemma}' is identical to word '{word}')")
    
    # Display enriched database entry
    print("\n===== FINAL ENRICHED DATABASE ENTRY =====")
    entry = {
        'wordNumber': 1,
        'frequency': 1,
        'partOfSpeech': pos,
        'morphology': morphology,
        'meanings': meanings,
        'bestTranslation': '',
        'lemma': lemma,
        'LemmaMeanings': get_lemma_meanings(lemma, lang_code, pos, nlp_model, lang_patterns) if lemma != word else meanings
    }
    
    # Print in a readable format
    for key, value in entry.items():
        if isinstance(value, list):
            print(f"  {key}:")
            if value:
                for i, item in enumerate(value, 1):
                    print(f"    {i}. {item}")
            else:
                print("    []")
        else:
            print(f"  {key}: {value}")
    
    print("\n===== END OF ANALYSIS =====")
    return entry

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