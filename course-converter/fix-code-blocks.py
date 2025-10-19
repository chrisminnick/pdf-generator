#!/usr/bin/env python3
"""
Clean up code blocks in the markdown file
"""

import re

def fix_code_blocks(file_path):
    """Fix code blocks that use ## instead of proper markdown"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    in_code_block = False
    
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        
        # Check if this is a code line (indented and starts with ##)
        if line.strip().startswith('  ## '):
            if not in_code_block:
                new_lines.append('```javascript\n')
                in_code_block = True
            # Remove the ## prefix and keep the code line
            code_line = line.replace('  ## ', '', 1)
            new_lines.append(code_line + '\n')
            
            # Look ahead to see if the next lines are also code
            j = i + 1
            while j < len(lines) and lines[j].strip().startswith('  ## '):
                next_line = lines[j].rstrip()
                code_line = next_line.replace('  ## ', '', 1)
                new_lines.append(code_line + '\n')
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

if __name__ == "__main__":
    file_path = "/Users/chrisminnick/code/src/github.com/chrisminnick/modern-web-dev/advanced-react-admin/advanced-react-slides-v1.0.0/advanced_react.md"
    fix_code_blocks(file_path)