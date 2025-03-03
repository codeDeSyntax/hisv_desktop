import re
import fitz
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SongExtractor:
    def __init__(self, input_pdf: str, output_dir: str):
        self.input_pdf = input_pdf
        self.output_dir = Path(output_dir)
        
    def extract_text_from_pdf(self) -> str:
        """Extracts text from PDF with error handling."""
        try:
            doc = fitz.open(self.input_pdf)
            text = ""
            for page_num in range(doc.page_count):
                page = doc.load_page(page_num)
                text += page.get_text("text")
            doc.close()
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            raise

    def extract_song_content(self, text: str):
        """Extracts songs and formats them according to the specified structure."""
        songs = []
        # Modified pattern to better handle song separation
        song_pattern = re.compile(r'(\d+)\n([^\d]+?)(?=\n\d+\n|$)', re.S)
        
        for match in song_pattern.finditer(text):
            try:
                song_content = match.group(2).strip()
                
                # Extract title (first line)
                title_match = re.match(r'([^\n]+)', song_content)
                if not title_match:
                    continue
                    
                title = title_match.group(1).strip()
                # Remove title from content
                song_content = song_content[len(title):].strip()
                
                # Clean the title for file naming
                safe_title = re.sub(r'[<>:"/\\|?*]', '_', title)
                
                # Format the content
                formatted_content = self._format_song_content(song_content)
                
                if formatted_content:
                    songs.append((safe_title, formatted_content))
                
            except Exception as e:
                logger.error(f"Error processing song: {e}")
                continue
                
        return songs

    def _format_song_content(self, content: str) -> str:
        """Formats song content with proper verse/chorus delimiters and <p> tags."""
        try:
            # Split content into lines
            lines = [line.strip() for line in content.split('\n') if line.strip()]
            
            formatted_parts = []
            current_verse = 1
            in_chorus = False
            verse_started = False
            
            i = 0
            while i < len(lines):
                line = lines[i].strip()
                
                # Skip empty lines and key information
                if not line or line.startswith('Key of'):
                    i += 1
                    continue
                
                # Check for chorus indicator
                if 'CHORUS' in line.upper() or (i > 0 and any(chorus_word in line.upper() for chorus_word in ['REFRAIN', 'CHORUS:', 'CHOR.'])):
                    if verse_started:
                        formatted_parts.append('<p></p>')
                    formatted_parts.append('<!-- Chorus -->')
                    in_chorus = True
                    verse_started = True
                    i += 1
                    continue
                
                # If we're starting a new section and not in chorus, assume it's a verse
                if (i == 0 or not lines[i-1].strip()) and not in_chorus:
                    if verse_started:
                        formatted_parts.append('<p></p>')
                    formatted_parts.append(f'<!-- Verse {current_verse} -->')
                    current_verse += 1
                    verse_started = True
                
                # Add the line content wrapped in <p> tags
                formatted_parts.append(f'<p>{line}</p>')
                
                # Check if next line starts a new section
                next_line = lines[i + 1] if i < len(lines) - 1 else None
                if next_line and ('CHORUS' in next_line.upper() or not next_line.strip()):
                    formatted_parts.append('<p></p>')
                    in_chorus = False
                
                i += 1
            
            return '\n'.join(formatted_parts)
            
        except Exception as e:
            logger.error(f"Error formatting song content: {e}")
            return ""

    def save_raw_content(self, content: str, title: str) -> bool:
        """Saves the raw content directly to a text file."""
        try:
            self.output_dir.mkdir(parents=True, exist_ok=True)
            output_path = self.output_dir / f"{title}.txt"
            
            # Write the formatted content to a text file
            with open(output_path, 'w', encoding='utf-8') as file:
                file.write(content)
            
            logger.info(f"Successfully created file: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving file for {title}: {e}")
            return False

def main():
    try:
        input_file = input("Enter the path of the song PDF file: ").strip()
        output_directory = input("Enter the output directory for files: ").strip()
        
        extractor = SongExtractor(input_file, output_directory)
        
        logger.info("Extracting text from PDF...")
        song_text = extractor.extract_text_from_pdf()
        
        logger.info("Processing songs...")
        songs = extractor.extract_song_content(song_text)
        
        successful = 0
        failed = 0
        
        for title, content in songs:
            if extractor.save_raw_content(content, title):
                successful += 1
            else:
                failed += 1
        
        logger.info(f"Process completed. Successfully generated {successful} files, {failed} failed.")
        
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        raise

if __name__ == "__main__":
    main()