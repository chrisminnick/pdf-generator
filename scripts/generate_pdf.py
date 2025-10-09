#!/usr/bin/env python3
"""
Generalized PDF Generator for Markdown Documents
Automatically combines all .md files in a directory into a PDF
"""

import re
import html
import subprocess
import tempfile
import os
from pathlib import Path
import argparse
import sys
import glob

def load_template(template_name):
    """
    Load HTML template from templates directory
    """
    script_dir = Path(__file__).parent.parent
    template_path = script_dir / 'templates' / f'{template_name}.html'
    
    if not template_path.exists():
        # Fall back to default template if requested template doesn't exist
        template_path = script_dir / 'templates' / 'default.html'
        
    if not template_path.exists():
        raise FileNotFoundError(f"Template not found: {template_path}")
        
    with open(template_path, 'r', encoding='utf-8') as f:
        return f.read()

def extract_table_of_contents(markdown_content):
    """
    Extract table of contents from markdown headings (# and ## headers)
    Excludes HTML comments, code blocks, and other non-header content
    """
    lines = markdown_content.split('\n')
    toc_items = []
    in_code_block = False
    code_fence_type = None
    
    for line in lines:
        original_line = line
        line = line.strip()
        
        # Handle code block fences (``` or ````)
        if line.startswith('```'):
            if not in_code_block:
                # Starting a code block
                in_code_block = True
                code_fence_type = '```'
            elif code_fence_type == '```':
                # Ending a ``` code block
                in_code_block = False
                code_fence_type = None
            continue
        elif line.startswith('````'):
            if not in_code_block:
                # Starting a code block with ````
                in_code_block = True
                code_fence_type = '````'
            elif code_fence_type == '````':
                # Ending a ```` code block
                in_code_block = False
                code_fence_type = None
            continue
        
        # Skip processing if we're inside a code block
        if in_code_block:
            continue
            
        # Skip indented code blocks (4+ spaces or 1+ tabs)
        if original_line.startswith('    ') or original_line.startswith('\t'):
            continue
        
        # Skip empty lines and HTML comments
        if not line or line.startswith('<!--') or line.endswith('-->'):
            continue
            
        # Skip lines that are inside HTML comments (multi-line)
        if '<!--' in line and '-->' not in line:
            continue
            
        # Extract h1 headings (# Title) - must be at start of line after stripping
        if line.startswith('# ') and not line.startswith('## '):
            # Make sure this is actually a header, not a comment
            title = line[2:].strip()
            # Skip generic titles and ensure it's not empty
            if title and title not in ["Table of Contents", "TOC"]:
                toc_items.append({
                    'level': 1,
                    'title': title,
                    'id': create_heading_id(title)
                })
        
        # Extract h2 headings (## Title) - must be at start of line after stripping
        elif line.startswith('## ') and not line.startswith('### '):
            title = line[3:].strip()
            # Ensure title is not empty
            if title:
                toc_items.append({
                    'level': 2,
                    'title': title,
                    'id': create_heading_id(title)
                })
    
    return toc_items

def create_heading_id(title):
    """
    Create a valid HTML ID from a heading title
    """
    return (title.lower()
            .replace(' ', '-')
            .replace('(', '')
            .replace(')', '')
            .replace(',', '')
            .replace('&', 'and')
            .replace(':', '')
            .replace('/', '-')
            .replace("'", '')
            .replace('"', '')
            .replace('–', '-')
            .replace('—', '-')
            .replace('.', '')
            .replace('?', '')
            .replace('!', ''))

def process_markdown_simple(markdown_content):
    """
    Simple markdown to HTML conversion with slide breaks, lists, and tables
    """
    lines = markdown_content.split('\n')
    html_lines = []
    code_block_stack = []
    in_list = False
    current_list_type = None
    last_list_number = 0  # Track the last number in numbered lists
    in_table = False
    
    for i, line in enumerate(lines):
        # Handle code blocks
        stripped_line = line.strip()
        
        # Check for code block markers (``` or ````)
        if stripped_line.startswith('```'):
            backtick_count = 0
            for char in stripped_line:
                if char == '`':
                    backtick_count += 1
                else:
                    break
            
            # Close any open unordered list before starting code block, but keep numbered lists open
            if not code_block_stack and in_list and current_list_type == 'ul':
                html_lines.append(f'</{current_list_type}>')
                in_list = False
                current_list_type = None
                # Keep last_list_number to allow numbered list continuation
            
            # Check if this closes an existing code block
            if code_block_stack and code_block_stack[-1]['backticks'] == backtick_count:
                code_block_stack.pop()
                if not code_block_stack:
                    html_lines.append('</code></pre>')
                else:
                    code_line = line
                    if line.startswith('   ') or line.startswith('    '):
                        code_line = line[3:] if line.startswith('   ') else line[4:]
                    html_lines.append(html.escape(code_line))
                continue
            else:
                # This starts a new code block
                code_lang = stripped_line[backtick_count:].strip()
                
                if not code_block_stack:
                    html_lines.append(f'<pre><code class="language-{code_lang}">')
                else:
                    code_line = line
                    if line.startswith('   ') or line.startswith('    '):
                        code_line = line[3:] if line.startswith('   ') else line[4:]
                    html_lines.append(html.escape(code_line))
                
                code_block_stack.append({
                    'backticks': backtick_count,
                    'language': code_lang
                })
                continue
        
        if code_block_stack:
            # We're inside a code block
            code_line = line
            if line.startswith('   ') or line.startswith('    '):
                code_line = line[3:] if line.startswith('   ') else line[4:]
            html_lines.append(html.escape(code_line))
            continue
        
        # Handle HTML comments - skip them entirely
        if line.strip().startswith('<!--') or line.strip().endswith('-->') or ('<!--' in line and '-->' in line):
            continue
            
        # Handle headers with page breaks (# and ## create new pages)
        if line.startswith('## ') and not line.startswith('### '):
            # Close any open elements before new page
            if in_list:
                html_lines.append(f'</{current_list_type}>')
                in_list = False
                current_list_type = None
                # Reset numbering at new section (new lab or major section)
                last_list_number = 0
            if in_table:
                html_lines.append('</tbody></table>')
                in_table = False
            
            title_text = line[3:].strip()
            heading_id = create_heading_id(title_text)
            html_lines.append(f'<h2 id="{heading_id}" class="slide-title">{html.escape(title_text)}</h2>')
            continue
        
        elif line.startswith('# ') and not line.startswith('## '):
            # Close any open elements before new page
            if in_list:
                html_lines.append(f'</{current_list_type}>')
                in_list = False
                current_list_type = None
                # Reset numbering at new section
                last_list_number = 0
            if in_table:
                html_lines.append('</tbody></table>')
                in_table = False
            
            title_text = line[2:].strip()
            heading_id = create_heading_id(title_text)
            html_lines.append(f'<h1 id="{heading_id}" class="main-title">{html.escape(title_text)}</h1>')
            continue
        
        # Handle other headers (h3, h4, etc.)
        elif line.startswith('### '):
            if in_list:
                html_lines.append(f'</{current_list_type}>')
                in_list = False
                current_list_type = None
                # Reset numbering at subsection start (e.g., Instructions)
                last_list_number = 0
            title_text = line[4:].strip()
            heading_id = create_heading_id(title_text)
            html_lines.append(f'<h3 id="{heading_id}">{html.escape(title_text)}</h3>')
            continue
        elif line.startswith('#### '):
            if in_list:
                html_lines.append(f'</{current_list_type}>')
                in_list = False
                current_list_type = None
                # Reset numbering at deeper subsection
                last_list_number = 0
            title_text = line[5:].strip()
            heading_id = create_heading_id(title_text)
            html_lines.append(f'<h4 id="{heading_id}">{html.escape(title_text)}</h4>')
            continue
        
        # Handle horizontal rules
        if line.strip() == '---':
            if in_list:
                html_lines.append(f'</{current_list_type}>')
                in_list = False
                current_list_type = None
                # Reset numbering across horizontal rules
                last_list_number = 0
            if in_table:
                html_lines.append('</tbody></table>')
                in_table = False
            html_lines.append('<hr>')
            continue
        
        # Handle lists
        if line.strip().startswith('- ') or line.strip().startswith('* ') or re.match(r'^\s*\d+\.\s', line):
            new_list_type = 'ol' if re.match(r'^\s*\d+\.\s', line) else 'ul'
            
            # If we're switching list types, close the current list
            if in_list and current_list_type != new_list_type:
                html_lines.append(f'</{current_list_type}>')
                in_list = False
                current_list_type = None
                # Reset numbering when switching away from ordered lists
                if new_list_type == 'ul':
                    last_list_number = 0
            
            if not in_list:
                if in_table:
                    html_lines.append('</tbody></table>')
                    in_table = False
                
                # For numbered lists, add start attribute to continue from where we left off
                if new_list_type == 'ol' and last_list_number > 0:
                    html_lines.append(f'<{new_list_type} start="{last_list_number + 1}">')
                else:
                    html_lines.append(f'<{new_list_type}>')
                in_list = True
                current_list_type = new_list_type
            
            # Extract list item content and track numbers for continuation
            if line.strip().startswith(('- ', '* ')):
                content = line.strip()[2:]
            else:
                # Extract the number for tracking continuation
                number_match = re.match(r'^\s*(\d+)\.\s+', line)
                if number_match:
                    current_number = int(number_match.group(1))
                    last_list_number = max(last_list_number, current_number)
                content = re.sub(r'^\s*\d+\.\s+', '', line)
            
            # Process inline markdown in list items
            content = process_inline_markdown(content)
            html_lines.append(f'<li>{content}</li>')
            continue
        else:
            if in_list and line.strip() == '':
                # Keep list open for blank lines
                html_lines.append('')
                continue
            elif in_list and current_list_type == 'ul':
                # Close unordered lists when we encounter non-list content
                html_lines.append(f'</{current_list_type}>')
                in_list = False
                current_list_type = None
                # Keep last_list_number to allow numbered list continuation
            elif in_list and current_list_type == 'ol':
                # For numbered lists, only close on certain content types, not code blocks or regular text
                # Allow continuation within the same subsection, but reset on headings handled above
                pass
        
        # Handle tables
        if '|' in line and line.strip().startswith('|') and line.strip().endswith('|'):
            if not in_table:
                html_lines.append('<table class="markdown-table">')
                html_lines.append('<thead>')
                in_table = True
            
            # Process table row
            cells = [cell.strip() for cell in line.strip()[1:-1].split('|')]
            
            # Check if this is a separator row
            if all(re.match(r'^:?-+:?$', cell.strip()) for cell in cells):
                html_lines.append('</thead>')
                html_lines.append('<tbody>')
                continue
            
            # Regular table row
            tag = 'th' if '</thead>' not in ''.join(html_lines[-5:]) else 'td'
            row_html = '<tr>'
            for cell in cells:
                processed_cell = process_inline_markdown(cell)
                row_html += f'<{tag}>{processed_cell}</{tag}>'
            row_html += '</tr>'
            html_lines.append(row_html)
            continue
        else:
            if in_table and line.strip() == '':
                # Keep table open for blank lines
                html_lines.append('')
                continue
            elif in_table:
                # Close table if we encounter non-table content
                html_lines.append('</tbody></table>')
                in_table = False
        
        # Handle regular paragraphs
        if line.strip():
            processed_line = process_inline_markdown(line)
            html_lines.append(f'<p>{processed_line}</p>')
        else:
            html_lines.append('')
    
    # Close any remaining open elements
    if in_list:
        html_lines.append(f'</{current_list_type}>')
        last_list_number = 0
    if in_table:
        html_lines.append('</tbody></table>')
    if code_block_stack:
        html_lines.append('</code></pre>')
    
    return '\n'.join(html_lines)

def process_inline_markdown(text):
    """
    Process inline markdown formatting (bold, italic, code, links)
    """
    # First escape HTML entities in the raw text
    text = html.escape(text, quote=False)
    
    # Handle code spans first (to avoid interfering with other formatting)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    
    # Handle bold text
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'__([^_]+)__', r'<strong>\1</strong>', text)
    
    # Handle italic text
    text = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', text)
    text = re.sub(r'_([^_]+)_', r'<em>\1</em>', text)
    
    # Handle links
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', text)
    
    return text

def create_complete_html(html_content, title, toc_items=None, include_toc=True, template_name='default'):
    """
    Create complete HTML document using external template
    The title page content should be first, followed by TOC, then remaining content
    """
    toc_html = ""
    if toc_items and include_toc:
        toc_html = generate_toc_html(toc_items)

    # Load the template
    template = load_template(template_name)
    
    # Replace placeholders in template
    return template.replace('{{title}}', html.escape(title)).replace('{{content}}', html_content)

def generate_toc_html(toc_items):
    """
    Generate HTML for table of contents with proper nesting
    """
    if not toc_items:
        return ""
    
    toc_html = ['<div class="toc page-break">']
    toc_html.append('<h2>Table of Contents</h2>')
    toc_html.append('<ul>')
    
    current_level = 1
    
    for item in toc_items:
        level = item['level']
        title = item['title']
        item_id = item['id']
        
        # Handle level changes
        if level > current_level:
            # We need to open nested lists (going deeper)
            # Don't open a new <ul> for the first item, it's already in the existing list
            if current_level > 0:
                toc_html.append('<ul>')
        elif level < current_level:
            # We need to close nested lists (going back up)
            for _ in range(current_level, level, -1):
                toc_html.append('</ul>')
        
        # Add the TOC item
        css_class = f'toc-level-{level}'
        toc_html.append(f'<li class="{css_class}"><a href="#{item_id}">{html.escape(title)}</a></li>')
        
        current_level = level
    
    # Close any remaining open lists
    for _ in range(current_level, 1, -1):
        toc_html.append('</ul>')
    
    toc_html.append('</ul>')  # Close the main list
    toc_html.append('</div>')
    return '\n'.join(toc_html)

def combine_markdown_files(directory_path):
    """
    Combine all markdown files in a directory, with title-page.md first if it exists
    Ignores README files as they are typically for repository documentation
    Returns tuple: (title_page_content, main_content)
    """
    directory = Path(directory_path)
    if not directory.is_dir():
        raise ValueError(f"Directory does not exist: {directory_path}")
    
    # Find all .md files
    md_files = list(directory.glob("*.md"))
    if not md_files:
        raise ValueError(f"No .md files found in directory: {directory_path}")
    
    title_page_content = ""
    main_content = []
    
    # Check for title-page.md first
    title_page = directory / "title-page.md"
    if title_page.exists():
        print(f"📄 Loading title page from {title_page}")
        try:
            with open(title_page, 'r', encoding='utf-8') as f:
                title_page_content = f.read().strip()
            md_files.remove(title_page)
        except Exception as e:
            print(f"⚠️  Warning: Could not read title page: {e}")
    
    # Remove README files from processing
    readme_files = [f for f in md_files if f.name.upper().startswith('README')]
    for readme_file in readme_files:
        print(f"⏭️  Ignoring README file: {readme_file.name}")
        md_files.remove(readme_file)
    
    # Check if we still have files to process
    if not md_files:
        if title_page.exists():
            print("⚠️  Only title page found after filtering README files")
        else:
            raise ValueError(f"No processable .md files found in directory after filtering: {directory_path}")
    
    # Sort remaining files alphabetically
    md_files.sort(key=lambda x: x.name)
    
    # Process each markdown file
    for md_file in md_files:
        print(f"📄 Processing {md_file.name}")
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            
            # Add content with separator
            if main_content and main_content[-1] != "---":
                main_content.extend(["", "---", ""])
            
            main_content.extend(content.split('\n'))
            main_content.extend(["", ""])
            
        except Exception as e:
            print(f"⚠️  Warning: Could not read {md_file}: {e}")
    
    return title_page_content, '\n'.join(main_content)

def markdown_to_pdf(directory_path, output_file=None, dist_dir="dist", include_toc=True, template_name="default"):
    """
    Convert all markdown files in a directory to PDF
    """
    try:
        directory = Path(directory_path)
        
        # Generate output filename if not provided
        if output_file is None:
            output_filename = f"{directory.name}.pdf"
            output_file = Path(dist_dir) / output_filename
        else:
            output_file = Path(output_file)
        
        # Ensure output directory exists
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        print(f"🔄 Processing directory: {directory}")
        print(f"📄 Output file: {output_file}")
        
        # Combine all markdown files (returns title page and main content separately)
        title_page_content, main_content = combine_markdown_files(directory_path)
        
        # Extract table of contents from main content only
        toc_items = extract_table_of_contents(main_content) if include_toc else None
        
        # Process title page and main content separately to avoid TOC placeholder issues
        title_page_html = ""
        main_content_html = ""
        
        # Process title page if it exists
        if title_page_content:
            title_page_html = process_markdown_simple(title_page_content)
        
        # Process main content
        if main_content:
            main_content_html = process_markdown_simple(main_content)
        
        # Combine HTML parts with TOC in the correct order
        html_parts = []
        
        # Add title page
        if title_page_html:
            html_parts.append(title_page_html)
        
        # Add TOC if requested (no page break before TOC)
        if toc_items and include_toc:
            toc_html = generate_toc_html(toc_items)
            html_parts.append(toc_html)
        
        # Add main content (headers already have page-break-before in CSS)
        if main_content_html:
            html_parts.append(main_content_html)
        
        # Join all parts without automatic page breaks
        html_content = ''.join(html_parts)
        
        full_html = create_complete_html(html_content, directory.name, toc_items, include_toc, template_name)
        
        # Create temporary HTML file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as temp_html:
            temp_html.write(full_html)
            temp_html_path = temp_html.name
        
        try:
            # Try different methods to convert HTML to PDF
            success = False
            
            # Method: Try using Chrome/Chromium headless mode
            chrome_paths = [
                '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                '/Applications/Chromium.app/Contents/MacOS/Chromium',
                'google-chrome',
                'chromium',
                'chrome'
            ]
            
            for chrome_path in chrome_paths:
                try:
                    cmd = [
                        chrome_path,
                        '--headless',
                        '--disable-gpu',
                        '--no-pdf-header-footer',
                        '--print-to-pdf=' + str(output_file),
                        f'file://{temp_html_path}'
                    ]
                    
                    result = subprocess.run(cmd, capture_output=True, timeout=60)
                    if result.returncode == 0 and Path(output_file).exists():
                        success = True
                        break
                except (subprocess.TimeoutExpired, FileNotFoundError):
                    continue
            
            if success:
                # Get file size
                file_size = Path(output_file).stat().st_size
                size_mb = file_size / (1024 * 1024)
                
                print(f"✅ PDF generated successfully: {output_file}")
                print(f"📊 File size: {size_mb:.1f}MB")
                if toc_items:
                    print(f"📖 Total sections: {len([item for item in toc_items if item['level'] == 1])}")
                return True
            else:
                # Fallback: Save HTML file for manual conversion
                html_file = output_file.with_suffix('.html')
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(full_html)
                
                print(f"⚠️  Could not automatically generate PDF")
                print(f"📄 HTML file saved: {html_file}")
                print(f"💡 Open the HTML file in Chrome and use 'Print to PDF' to generate the PDF manually")
                return False
                
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_html_path)
            except:
                pass
        
    except Exception as e:
        print(f"❌ Error generating PDF: {e}")
        return False

def main():
    """
    Main function with command line argument parsing
    """
    parser = argparse.ArgumentParser(
        description="Convert all Markdown files in a directory to a combined PDF",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python generate_pdf.py ./lab-instructions/
  python generate_pdf.py ./slides-source/ -o my-slides.pdf --template modern
  python generate_pdf.py ./docs/ --dist-dir ./output/ --template minimal
  python generate_pdf.py ./docs/ --no-toc --template default

Templates:
  default   - Professional design with modern fonts (default)
  minimal   - Clean academic style with serif fonts  
  modern    - Contemporary design with gradients and colors
  classic   - Traditional book-style with warm earth tones

Features:
- Automatically combines all .md files in alphabetical order
- Places title-page.md first if it exists (before TOC)
- Creates page breaks for # and ## headers
- Generates table of contents after title page (unless --no-toc)
- Supports multiple styling templates (see pdf-generator/templates/)
- Outputs PDF with same name as directory by default
        """
    )
    
    parser.add_argument(
        'directory_path',
        help='Directory containing Markdown files to combine'
    )
    
    parser.add_argument(
        '-o', '--output',
        help='Output PDF file (default: <directory_name>.pdf in dist folder)'
    )
    
    parser.add_argument(
        '--dist-dir',
        default='dist',
        help='Output directory for PDF files (default: dist)'
    )
    
    parser.add_argument(
        '--no-toc',
        action='store_true',
        help='Do not generate table of contents'
    )
    
    parser.add_argument(
        '--template',
        default='default',
        help='Template to use for PDF styling (default, minimal, modern, or custom template name)'
    )
    
    args = parser.parse_args()
    
    directory_path = Path(args.directory_path)
    
    # Check if directory exists
    if not directory_path.exists():
        print(f"❌ Error: Directory '{directory_path}' does not exist.")
        sys.exit(1)
    
    if not directory_path.is_dir():
        print(f"❌ Error: '{directory_path}' is not a directory.")
        sys.exit(1)
    
    print("🔄 Processing markdown directory...")
    success = markdown_to_pdf(str(directory_path), args.output, args.dist_dir, include_toc=not args.no_toc, template_name=args.template)
    
    if success:
        print("🎉 PDF generated successfully!")
    else:
        print("❌ PDF generation failed or requires manual conversion")
        sys.exit(1)

if __name__ == "__main__":
    main()