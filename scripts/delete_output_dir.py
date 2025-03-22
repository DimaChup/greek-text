#!/usr/bin/env python3
import os
import shutil
import argparse
from pathlib import Path

def delete_output_directory(text_name):
    """
    Delete the output directory for a given text file.
    
    Args:
        text_name: Base name of the input text (without extension)
    
    Returns:
        True if deletion was successful, False otherwise
    """
    output_dir = Path("data") / f"output_{text_name}"
    
    if not output_dir.exists():
        print(f"Output directory not found: {output_dir}")
        return False
    
    try:
        shutil.rmtree(output_dir)
        print(f"Successfully deleted directory: {output_dir}")
        return True
    except Exception as e:
        print(f"Error deleting directory: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Delete output directory created by text2db.py")
    parser.add_argument("--text", "-t", type=str, required=True,
                      help="Base name of the text (e.g., 'mundoA' for data/input/mundoA.txt)")
    
    args = parser.parse_args()
    delete_output_directory(args.text)

if __name__ == "__main__":
    main()