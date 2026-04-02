import fs from 'fs';
import path from 'path';

/**
 * Reads all .md and .txt files from a specific context subfolder
 * and joins them into a single string for Gemini's context window.
 */
export function getFolderContext(subfolder: 'bio' | 'knowledge'): string {
  const dirPath = path.join(process.cwd(), 'context', subfolder);
  
  try {
    const files = fs.readdirSync(dirPath);
    
    return files
      .filter(file => file.endsWith('.md') || file.endsWith('.txt'))
      .map(file => {
        const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
        // We wrap each file in markers so Gemini knows where one document ends 
        // and the next begins.
        return `--- START OF SOURCE: ${file} ---\n${content}\n--- END OF SOURCE: ${file} ---`;
      })
      .join('\n\n');
  } catch (error) {
    console.error(`Error reading context from ${subfolder}:`, error);
    return '';
  }
}