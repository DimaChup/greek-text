import os
import csv
import re
import argparse
from pathlib import Path

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

def process_text_file(input_filepath, output_dir=None, max_lines=None):
    """
    Process a text file to generate CSV files with word list and frequency.
    
    Args:
        input_filepath: Path to the input text file
        output_dir: Optional custom output directory
        max_lines: Optional maximum number of lines to process
    
    Returns:
        Tuple of paths to the output CSV files
    """
    # Get the base name of the input file without extension
    input_path = Path(input_filepath)
    input_filename = input_path.stem
    
    # Create output directory
    if output_dir:
        output_path = Path(output_dir)
    else:
        output_path = Path("data") / f"output_{input_filename}"
    
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
    
    # Save frequency list to CSV
    freq_csv_path = output_path / f"{input_filename}_word_frequency.csv"
    with open(freq_csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(["Word", "Frequency"])
        csv_writer.writerows(sorted_word_freq)
    
    print(f"Created word frequency CSV: {freq_csv_path}")
    
    return csv_path, freq_csv_path

def main():
    parser = argparse.ArgumentParser(description="Process text file to create word lists and frequency CSV files.")
    parser.add_argument("--input", "-i", type=str, required=True,
                        help="Path to the input text file")
    parser.add_argument("--max-lines", "-m", type=int, default=None,
                        help="Maximum number of lines to process (default: all)")
    parser.add_argument("--output", "-o", type=str, default=None,
                        help="Custom output directory (default: data/output_filename)")
    args = parser.parse_args()
    
    process_text_file(args.input, args.output, args.max_lines)

if __name__ == "__main__":
    main()