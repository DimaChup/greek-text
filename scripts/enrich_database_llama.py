import requests
import json
import argparse
import re
import datetime
from tqdm import tqdm

def analyze_word(word, model_name="llama2"):
    """Get word analysis including both word and lemma translations."""
    prompt = f"""You are a Spanish linguistic expert. For the word "{word}", give me exactly 5 things in this order:
1. the word itself
2. its translation
3. its part of speech (VERB, NOUN, ADJECTIVE, etc.)
4. its lemma (base form - for verbs this is the infinitive ending in ar/er/ir)
5. lemma translation (if it's a verb, MUST start with "to")

Format: word, translation, part of speech, lemma, lemma translation

Examples:
llamadme, call me, VERB, llamar, to call
sentía, felt, VERB, sentir, to feel
extraña, strange, ADJECTIVE, extraño, strange
varias, several, ADJECTIVE, vario, various
repetí, I repeated, VERB, repetir, to repeat

Remember: 
- For verbs with pronouns (me/te/se/nos/os/les), remove pronoun to find lemma
- Verb lemma MUST end in ar/er/ir
- Verb lemma translations MUST start with "to"
- Give accurate translations based on the actual form of the word

Give me just the 5 items separated by commas for the word: {word}"""

    try:
        response = requests.post('http://localhost:11434/api/generate', 
            json={
                "model": model_name,
                "prompt": prompt,
                "stream": False
            })
        
        result = response.json()
        print(result['response'].strip())
        
    except Exception as e:
        print(f"Error: {e}")

def test_single_word(word):
    """Test analysis of a single word."""
    print(f"\n=== Testing: {word} ===")
    
    analyze_word(word)

def extract_database(filepath):
    """Extract database from JavaScript file."""
    print(f"Reading database from: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        js_code = f.read()
    
    # Extract the database object
    match = re.search(r'const\s+(\w+)\s*=\s*({[\s\S]+})\s*;?\s*(?:module\.exports|export)', js_code)
    if not match:
        match = re.search(r'const\s+(\w+)\s*=\s*({[\s\S]+})', js_code)
    
    if not match:
        raise ValueError(f"Could not find database object in {filepath}")
    
    database_name = match.group(1)
    database_json = match.group(2)
    
    # Convert to valid JSON
    json_str = re.sub(r'(\w+):', r'"\1":', database_json)
    json_str = json_str.replace("'", '"')
    json_str = re.sub(r',\s*}', '}', json_str)
    json_str = re.sub(r',\s*]', ']', json_str)
    
    return json.loads(json_str), database_name

def format_database_code(database, database_name):
    """Format the enriched database back to JavaScript."""
    output_parts = []
    output_parts.append(f"// Enriched database using llama2")
    output_parts.append(f"// Generated on: {datetime.datetime.now().isoformat()}")
    output_parts.append(f"const {database_name} = {{")
    
    # Sort words by wordNumber
    sorted_words = sorted(database.keys(), key=lambda w: database[w].get('wordNumber', 0))
    
    for i, word in enumerate(sorted_words):
        word_data = database[word]
        
        output_parts.append(f"  '{word}': {{")
        output_parts.append(f"    wordNumber: {word_data.get('wordNumber', 0)},")
        output_parts.append(f"    frequency: {word_data.get('frequency', 1)},")
        
        # String values
        pos = word_data.get('partOfSpeech', '').replace("'", "\\'")
        output_parts.append(f"    partOfSpeech: '{pos}',")
        
        morph = word_data.get('morphology', '').replace("'", "\\'")
        output_parts.append(f"    morphology: '{morph}',")
        
        # Arrays
        meanings = word_data.get('meanings', [])
        if meanings:
            output_parts.append("    meanings: [")
            for j, meaning in enumerate(meanings):
                safe_meaning = meaning.replace("'", "\\'").replace("\n", " ")
                output_parts.append(f"      '{safe_meaning}'{',' if j < len(meanings) - 1 else ''}")
            output_parts.append("    ],")
        else:
            output_parts.append("    meanings: [],")
        
        # Best translation
        best_trans = word_data.get('bestTranslation', '').replace("'", "\\'")
        output_parts.append(f"    bestTranslation: '{best_trans}',")
        
        # Lemma
        lemma = word_data.get('lemma', '').replace("'", "\\'")
        output_parts.append(f"    lemma: '{lemma}',")
        
        # Lemma meanings
        lemma_meanings = word_data.get('LemmaMeanings', [])
        if lemma_meanings:
            output_parts.append("    LemmaMeanings: [")
            for j, meaning in enumerate(lemma_meanings):
                safe_meaning = meaning.replace("'", "\\'").replace("\n", " ")
                output_parts.append(f"      '{safe_meaning}'{',' if j < len(lemma_meanings) - 1 else ''}")
            output_parts.append("    ]")
        else:
            output_parts.append("    LemmaMeanings: []")
        
        output_parts.append(f"  }}{'' if i == len(sorted_words) - 1 else ','}")
    
    output_parts.append("};")
    output_parts.append("")
    output_parts.append(f"export default {database_name};")
    
    return "\n".join(output_parts)

def enrich_database(input_file, output_file):
    """Enrich entire database using llama2."""
    # Load database
    database, database_name = extract_database(input_file)
    
    print(f"\nProcessing {len(database)} words...")
    enriched = {}
    
    # Process each word
    for word in tqdm(database.keys()):
        enriched[word] = database[word].copy()
        
        try:
            analyze_word(word)
            if analyze_word(word):
                enriched[word].update({
                    'partOfSpeech': analyze_word(word).split(',')[1],
                    'lemma': analyze_word(word).split(',')[2],
                    'meanings': analyze_word(word).split(',')[3:],
                    'LemmaMeanings': analyze_word(word).split(',')[3:]
                })
            
        except Exception as e:
            print(f"Error processing word '{word}': {e}")
    
    # Save enriched database
    js_code = format_database_code(enriched, database_name)
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_code)
    
    print(f"\nEnriched database saved to: {output_file}")

def main():
    parser = argparse.ArgumentParser(description="Analyze Spanish words using llama2")
    parser.add_argument("word", help="Word to analyze")
    
    args = parser.parse_args()
    analyze_word(args.word)

if __name__ == "__main__":
    main() 