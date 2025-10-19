#!/usr/bin/env python3
"""
Clean up the converted markdown file to match course slide conventions
"""

import re
import sys

def clean_markdown_file(file_path):
    """Clean up the markdown file"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix the header section
    header_pattern = r'^# Advanced React Development\n\n## copyright.*?\n\n## version.*?\n\n## March 2024\n\n'
    new_header = '''# Advanced React Development

**Advanced React concepts and best practices for experienced developers**

**📚 Course Repository:**  
[https://github.com/chrisminnick/advanced-react](https://github.com/chrisminnick/advanced-react)

**Version:** 1.3.0  
**Date:** March 2024  
**Author:** Chris Minnick

**Copyright © 2024 WatzThis, Inc.**  
All rights reserved.

**Website:** [https://www.watzthis.com](https://www.watzthis.com)

## Course Overview

**Advanced React Development**

**What You'll Learn:**

- Component lifecycle and advanced hooks
- State management with Redux and Redux Toolkit
- Client-side routing with React Router
- Performance optimization techniques
- Server-side rendering and React frameworks
- Micro-frontend architecture
- Security best practices
- Modern React patterns and best practices

**Course Structure:** Multiple modules, hands-on labs, real-world projects

'''
    
    content = re.sub(header_pattern, new_header, content, flags=re.MULTILINE | re.DOTALL)
    
    # Remove HTML attributes from headings
    content = re.sub(r' \{#[^}]*style="[^"]*"[^}]*\}', '', content)
    
    # Fix underlined links
    content = re.sub(r'\[\[([^\]]*)\]\{\.underline\}\]\(([^)]*)\)', r'[\1](\2)', content)
    
    # Fix escaped characters
    content = content.replace('\\>', '>')
    content = content.replace('\\<', '<')
    content = content.replace('=\\>', '=>')
    
    # Fix code blocks that start with ##
    # Convert code sections to proper markdown code blocks
    lines = content.split('\n')
    new_lines = []
    in_code_block = False
    
    for i, line in enumerate(lines):
        # Check if this is a code line (starts with ##)
        if line.strip().startswith('## ') and not line.strip().startswith('## '):
            if not in_code_block:
                new_lines.append('```javascript')
                in_code_block = True
            # Remove the ## prefix and add the code line
            new_lines.append(line.replace('## ', '', 1))
        # Check if we're ending a code block (next line is not code or is empty)
        elif in_code_block:
            next_line = lines[i+1] if i+1 < len(lines) else ''
            if not next_line.strip().startswith('## ') or next_line.strip() == '':
                new_lines.append(line)
                if line.strip():  # Only add closing if current line is not empty
                    new_lines.append('```')
                in_code_block = False
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
    
    content = '\n'.join(new_lines)
    
    # Clean up multiple blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    # Fix any remaining formatting issues
    content = content.replace('**Navigate**', 'Navigate')
    content = content.replace('**Outlet**', 'Outlet')
    
    # Write the cleaned content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Cleaned up {file_path}")

if __name__ == "__main__":
    file_path = "/Users/chrisminnick/code/src/github.com/chrisminnick/modern-web-dev/advanced-react-admin/advanced-react-slides-v1.0.0/advanced_react.md"
    clean_markdown_file(file_path)