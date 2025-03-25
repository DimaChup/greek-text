import requests
import json

def ask_ollama(word, model_name="llama2"):
    """Simple test function to query Ollama."""
    prompt = f"""You are a linguistic expert. Analyze this Spanish word: "{word}"
    
    Provide:
    1. Part of speech (VERB, NOUN, ADJECTIVE, etc.)
    2. Base form (lemma)
    3. English translations
    4. If it's a verb lemma, include "to" before translations
    
    Format your response as JSON only, like this:
    {{
        "pos": "part of speech",
        "lemma": "base form",
        "translations": ["translation1", "translation2"],
        "lemma_translations": ["translation1", "translation2"]
    }}"""

    try:
        response = requests.post('http://localhost:11434/api/generate', 
            json={
                "model": model_name,
                "prompt": prompt,
                "stream": False
            })
        
        result = response.json()
        print("\nRaw response:", result['response'])
        
        # Try to parse JSON from response
        try:
            analysis = json.loads(result['response'])
            
            # Print in a nice format
            print(f"\nAnalysis of word: {word}")
            print(f"Part of Speech: {analysis.get('pos', '')}")
            print(f"Lemma: {analysis.get('lemma', '')}")
            print("Translations:", analysis.get('translations', []))
            print("Lemma Translations:", analysis.get('lemma_translations', []))
            
        except json.JSONDecodeError:
            print("Could not parse JSON from response")
            
    except Exception as e:
        print(f"Error: {e}")

# Test with a few words
test_words = ["llamadme", "sentía", "extraña", "varias"]

for word in test_words:
    print(f"\n=== Testing: {word} ===")
    ask_ollama(word) 