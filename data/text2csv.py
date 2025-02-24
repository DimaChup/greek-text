import re
import csv
import os
from pathlib import Path

def create_word_list_csv(input_filepath):
    """
    Creates a CSV file containing a list of words from an input text file,
    along with their line numbers and word order.

    Args:
        input_filepath: Path to the input text file
    """
    # Get the base name of the input file without extension
    input_filename = Path(input_filepath).stem
    
    # Create output directory with correct path from script location
    output_dir = os.path.join("data", f"output_{input_filename}")
    os.makedirs(output_dir, exist_ok=True)
    
    # Copy input file to output directory
    output_text_path = os.path.join(output_dir, f"{input_filename}.txt")
    
    # Read input text
    with open(input_filepath, 'r', encoding='utf-8') as file:
        text = file.read()
        
    # Copy text to output directory
    with open(output_text_path, 'w', encoding='utf-8') as file:
        file.write(text)
    
    # Process the text
    lines = text.strip().split('\n')
    word_order = 1
    
    # Create CSV in output directory
    csv_path = os.path.join(output_dir, f"{input_filename}_word_list.csv")
    
    with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(["Line Number", "Word Order", "Word"])  # Header row

        for line_num, line in enumerate(lines, 1):
            # Remove line numbers like "1. " at the beginning of the line
            line = re.sub(r"^\s*\d+\.\s*", "", line)

            # Tokenize, keeping apostrophes but removing other punctuation
            words = re.findall(r"[\w''\-]+|[,;]", line)

            for word in words:
                # remove punctuation marks that we don't need separately
                if word not in [",", "·", "..."]:
                    csv_writer.writerow([line_num, word_order, word])
                    word_order += 1

def process_input_directory():
    """
    Process all .txt files in the data/input directory
    """
    # Define paths relative to root directory
    input_dir = os.path.join("data", "input")
    
    # Create input directory if it doesn't exist
    os.makedirs(input_dir, exist_ok=True)
    
    # Process each .txt file in the input directory
    for filename in os.listdir(input_dir):
        if filename.endswith('.txt'):
            input_filepath = os.path.join(input_dir, filename)
            print(f"Processing {filename}...")
            create_word_list_csv(input_filepath)
            print(f"Created output in data/output_{Path(filename).stem}")

if __name__ == "__main__":
    process_input_directory()