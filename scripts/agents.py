from google import genai

def main():
    # Read the JavaScript file as text
    with open("src/databases/temp_text.js", 'r', encoding='utf-8') as f:
        database_content = f.read()
    
    # Create a prompt that includes the database content
    prompt = f"""You are given a JavaScript database file with Spanish words and empty properties.

Your task is to fill in the missing properties for each word while keeping the EXACT same format:
1. partOfSpeech: Part of speech (VERB, NOUN, ADJECTIVE, ADVERB, DETERMINER, PRONOUN, PREPOSITION, CONJUNCTION)
2. meanings: Array of English translations (1-3 meanings)
3. bestTranslation: The best/primary translation 
4. lemma: Base form of word (for verbs, this is the infinitive form)
5. LemmaMeanings: Array of translations for the lemma (for verbs, start with "to")

IMPORTANT RULES:
- Do NOT change the structure, indentation, or spacing
- Do NOT modify wordNumber or frequency properties
- For verbs, lemma MUST be infinitive (-ar, -er, -ir)
- For verbs, LemmaMeanings MUST start with "to"
- Add single quotes around string values
- Properly format arrays with brackets and commas

Here's the file to enhance:

```javascript
{database_content}
```

Return the COMPLETE database file with all properties filled in correctly, preserving the exact format."""

    # Send to Gemini with simple parameters
    client = genai.Client(api_key="AIzaSyC8K77ZRJjrelyDV2znFEzevsFWrUh4Kp8")
    response = client.models.generate_content(
        model="gemini-2.5-pro-exp-03-25",
        contents=prompt
    )
    
    # Extract code block if present (Gemini sometimes adds markdown formatting)
    output_text = response.text
    if "```javascript" in output_text:
        output_text = output_text.split("```javascript")[1].split("```")[0].strip()
    elif "```js" in output_text:
        output_text = output_text.split("```js")[1].split("```")[0].strip()
    
    # Save results
    with open("src/databases/temp_text_enriched.js", "w", encoding="utf-8") as f:
        f.write(output_text)
    
    print("Enriched database saved to src/databases/temp_text_enriched.js")

if __name__ == "__main__":
    main()