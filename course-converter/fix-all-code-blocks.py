#!/usr/bin/env python3
"""
Fix code blocks in both slides and labs by adding proper markdown code fencing
"""

import re
import os

def fix_code_blocks_in_file(file_path):
    """Fix code blocks that are just indented to use proper markdown fencing"""
    
    print(f"Processing {file_path}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    in_code_block = False
    i = 0
    
    while i < len(lines):
        line = lines[i].rstrip()
        
        # Check if this line starts a code block (indented with spaces and looks like code)
        if (line.startswith('    ') and 
            line.strip() and  # not empty
            not in_code_block and
            (any(char in line for char in ['(', ')', '{', '}', ';', '=', 'import', 'const', 'function', 'return']) or
             line.strip().startswith('//') or  # comments
             line.strip().endswith(';') or    # statements
             line.strip().endswith('{') or    # opening braces
             line.strip().endswith('}') or    # closing braces
             'export' in line or 'import' in line or 'const' in line or 'let' in line or 'var' in line)):
            
            # Start a code block
            new_lines.append('```javascript\n')
            in_code_block = True
            
            # Add this line and look for consecutive code lines
            new_lines.append(line[4:] + '\n')  # Remove 4-space indentation
            
            # Look ahead for more code lines
            j = i + 1
            while j < len(lines):
                next_line = lines[j].rstrip()
                
                # If it's another indented code line, add it
                if next_line.startswith('    ') and next_line.strip():
                    new_lines.append(next_line[4:] + '\n')  # Remove indentation
                # If it's an empty line, check if code continues after
                elif not next_line.strip():
                    # Look ahead to see if code continues
                    k = j + 1
                    continues_code = False
                    while k < len(lines) and not lines[k].strip():
                        k += 1
                    if k < len(lines) and lines[k].startswith('    ') and lines[k].strip():
                        new_lines.append('\n')  # Add the empty line
                    else:
                        break  # End of code block
                else:
                    break  # End of code block
                j += 1
            
            # Close the code block
            new_lines.append('```\n')
            in_code_block = False
            i = j - 1  # Set i to the last processed line
            
        else:
            new_lines.append(line + '\n')
        
        i += 1
    
    # Write the result
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print(f"✅ Fixed code blocks in {file_path}")

def process_directory(directory):
    """Process all markdown files in a directory"""
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                fix_code_blocks_in_file(file_path)

if __name__ == "__main__":
    # Fix slides
    slides_file = "/Users/chrisminnick/code/src/github.com/chrisminnick/modern-web-dev/advanced-react-admin/advanced-react-slides-v1.0.0/advanced_react.md"
    if os.path.exists(slides_file):
        fix_code_blocks_in_file(slides_file)
    
    # Fix labs
    labs_dir = "/Users/chrisminnick/code/src/github.com/chrisminnick/modern-web-dev/advanced-react-admin/advanced-react-labs-v1.0.0"
    if os.path.exists(labs_dir):
        process_directory(labs_dir)
    
    print("🎉 All files processed!")