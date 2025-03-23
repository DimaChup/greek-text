import os
import csv
import re
import argparse
from pathlib import Path
import shutil
import sys

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

def process_text_file(input_filepath, output_dir=None, max_lines=None, copy_to_db_dir=False, 
                      db_dir=None, delete_output_dir=False):
    """
    Process a text file to generate CSV files with word list and frequency.
    
    Args:
        input_filepath: Path to the input text file
        output_dir: Optional custom output directory
        max_lines: Optional maximum number of lines to process
        copy_to_db_dir: Whether to copy the JS database to the databases directory
        db_dir: Path to the databases directory (default is "src/databases")
        delete_output_dir: Whether to delete the output directory after copying
    
    Returns:
        Tuple of paths to the output CSV files
    """
    # Get the base name of the input file without extension
    input_path = Path(input_filepath)
    input_filename = input_path.stem
    
    print(f"Processing file: {input_filepath}")
    print(f"Base filename: {input_filename}")
    
    # Create output directory
    if output_dir:
        output_path = Path(output_dir)
    else:
        output_path = Path("data") / f"output_{input_filename}"
    
    print(f"Output directory will be: {output_path}")
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Copy input file to output directory
    output_text_path = output_path / f"{input_filename}.txt"
    
    # Read input text
    with open(input_filepath, 'r', encoding='utf-8') as file:
        text = file.read()
    
    # Copy text to output directory
    with open(output_text_path, 'w', encoding='utf-8') as file:
        file.write(text)
    
    # Create word list CSV with max_lines parameter
    word_list = create_word_list_from_text(text, max_lines)
    
    # Save word list to CSV (for reference)
    csv_path = output_path / f"{input_filename}_word_list.csv"
    with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.DictWriter(csvfile, fieldnames=["Line Number", "Word Order", "Word"])
        csv_writer.writeheader()
        csv_writer.writerows(word_list)
    
    print(f"Created word list CSV: {csv_path}")
    
    # Create frequency list of unique words
    word_freq = {}
    for row in word_list:
        word = row["Word"].lower()  # Convert to lowercase for case-insensitive counting
        word_freq[word] = word_freq.get(word, 0) + 1
    
    # Sort by frequency (descending)
    sorted_word_freq = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    
    # Save frequency list to CSV with a word number column
    freq_csv_path = output_path / f"{input_filename}_word_frequency.csv"
    with open(freq_csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.writer(csvfile)
        # Add WordNumber to the header
        csv_writer.writerow(["WordNumber", "Word", "Frequency"])
        # Add wordNumber to each row
        for i, (word, freq) in enumerate(sorted_word_freq, 1):
            csv_writer.writerow([i, word, freq])
    
    print(f"Created word frequency CSV: {freq_csv_path}")
    print(f"Total unique words: {len(sorted_word_freq)}")
    
    # Generate JavaScript database skeleton
    js_db_path = output_path / f"{input_filename}_db.js"
    generate_js_database_skeleton(freq_csv_path, js_db_path)
    print(f"Created JavaScript database scaffold: {js_db_path}")
    
    db_copy_path = None
    # Copy JS database to the databases directory if requested
    if copy_to_db_dir:
        if db_dir is None:
            db_dir = Path("src/databases")  # Default database directory
        
        # Create the databases directory if it doesn't exist
        db_dir = Path(db_dir)
        db_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy the file
        db_copy_path = db_dir / f"{input_filename}_db.js"
        shutil.copy2(js_db_path, db_copy_path)
        print(f"Copied database to: {db_copy_path}")
        
        # Delete the output directory if requested and copy was successful
        if delete_output_dir:
            if os.path.exists(db_copy_path):
                print(f"Attempting to delete output directory: {output_path}")
                try:
                    # Force delete - try rmtree first
                    if os.path.exists(output_path):
                        shutil.rmtree(output_path)
                        print(f"Successfully deleted output directory: {output_path}")
                    else:
                        print(f"Output directory not found: {output_path}")
                except Exception as e:
                    print(f"Error during rmtree deletion: {e}")
                    
                    # Try alternative deletion method
                    try:
                        # For Windows systems that might have permission issues
                        for root, dirs, files in os.walk(output_path, topdown=False):
                            for name in files:
                                os.chmod(os.path.join(root, name), 0o777)
                                os.remove(os.path.join(root, name))
                            for name in dirs:
                                os.chmod(os.path.join(root, name), 0o777)
                                os.rmdir(os.path.join(root, name))
                        os.rmdir(output_path)
                        print(f"Successfully deleted output directory using alternative method: {output_path}")
                    except Exception as e2:
                        print(f"Alternative deletion also failed: {e2}")
            else:
                print(f"Database copy not found at {db_copy_path}, skipping directory deletion")
    
    # Print final status
    if delete_output_dir:
        if not os.path.exists(output_path):
            print("CLEANUP SUCCESS: Output directory has been deleted.")
        else:
            print("CLEANUP FAILED: Output directory still exists.")
    
    return csv_path, freq_csv_path, js_db_path

def generate_js_database_skeleton(frequency_csv_path, output_path):
    """
    Creates a skeleton JavaScript database file with basic word properties.
    
    Args:
        frequency_csv_path: Path to the word frequency CSV file
        output_path: Path where the JS file should be saved
    """
    # Read the frequency CSV
    word_data = []
    with open(frequency_csv_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        next(reader)  # Skip header row
        for row in reader:
            if len(row) >= 3:  # Ensure we have WordNumber, Word, and Frequency
                word_data.append({
                    'word': row[1],
                    'wordNumber': int(row[0]),
                    'frequency': int(row[2])
                })
    
    # Generate JavaScript code
    js_code = "// Generated word frequency database with word numbers for " + output_path.stem.split('_')[0] + "\n"
    js_code += "const " + output_path.stem.split('_')[0] + "Database = {\n"
    
    # Add each word with its properties
    for item in word_data:
        word = item['word']
        js_code += f"    '{word}': {{\n"
        js_code += f"      wordNumber: {item['wordNumber']},\n"
        js_code += f"      frequency: {item['frequency']},\n"
        js_code += f"      partOfSpeech: '',\n"
        js_code += f"      morphology: '',\n"
        js_code += f"      meanings: [],\n"
        js_code += f"      bestTranslation: '',\n"
        js_code += f"      lemma: '',\n"
        js_code += f"      LemmaMeanings: []\n"
        
        # Add comma for all items except the last one
        if item != word_data[-1]:
            js_code += "    },\n"
        else:
            js_code += "    }\n"
    
    js_code += "  };\n"
    js_code += "  \n"
    js_code += "  export default " + output_path.stem.split('_')[0] + "Database;"
    
    # Write the file
    with open(output_path, 'w', encoding='utf-8') as file:
        file.write(js_code)
    
    print(f"Created JavaScript database skeleton: {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Process text file to create word lists and frequency CSV files.")
    parser.add_argument("--input", "-i", type=str, required=True,
                        help="Path to the input text file")
    parser.add_argument("--max-lines", "-m", type=int, default=None,
                        help="Maximum number of lines to process (default: all)")
    parser.add_argument("--output", "-o", type=str, default=None,
                        help="Custom output directory (default: data/output_filename)")
    parser.add_argument("--copy-to-db", "-c", action="store_true",
                        help="Copy the generated JS database to the databases directory")
    parser.add_argument("--db-dir", "-d", type=str, default="src/databases",
                        help="Path to the databases directory (default: src/databases)")
    parser.add_argument("--delete-output", action="store_true",
                        help="Delete the output directory after copying the database (only works with --copy-to-db)")
    
    args = parser.parse_args()
    
    # Print the current working directory and command line arguments
    print(f"Current working directory: {os.getcwd()}")
    print(f"Command line arguments: {sys.argv}")
    print(f"Parsed arguments: {args}")
    
    # Check if data directory exists
    data_dir = Path("data")
    if not data_dir.exists():
        data_dir.mkdir(parents=True, exist_ok=True)
        print(f"Created data directory: {data_dir}")
    
    process_text_file(
        args.input, 
        args.output, 
        args.max_lines, 
        args.copy_to_db, 
        args.db_dir, 
        args.delete_output
    )
    
    # Final confirmation of cleanup status
    if args.delete_output and args.copy_to_db:
        input_path = Path(args.input)
        input_filename = input_path.stem
        output_path = Path("data") / f"output_{input_filename}"
        
        if not output_path.exists():
            print("FINAL STATUS: Success - Output directory has been deleted.")
        else:
            print(f"FINAL STATUS: Warning - Output directory still exists at {output_path}")

if __name__ == "__main__":
    main()