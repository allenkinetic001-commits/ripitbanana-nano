import fs from 'fs';

const file = 'src/contexts/ChallengeContext.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

const newLines = [];
let currentLang = null;
let seenKeys = new Set();
let removedCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  const langMatch = line.match(/^\s*([a-z]{2}(-[A-Z]{2})?):\s*\{\s*$/);
  if (langMatch) {
    currentLang = langMatch[1];
    seenKeys = new Set();
    newLines.push(line);
    continue;
  }
  
  if (currentLang && line.match(/^\s*\},?\s*$/)) {
    currentLang = null;
    newLines.push(line);
    continue;
  }
  
  if (currentLang) {
    const keyMatch = line.match(/^\s*['"]([^'"]+)['"]\s*:/);
    if (keyMatch) {
      const key = keyMatch[1];
      if (seenKeys.has(key)) {
        console.log(`Removed duplicate key '${key}' in lang '${currentLang}' at line ${i+1}`);
        removedCount++;
        continue;
      } else {
        seenKeys.add(key);
      }
    }
  }
  
  newLines.push(line);
}

fs.writeFileSync(file, newLines.join('\n'), 'utf8');
console.log(`Done cleaning! Removed ${removedCount} duplicates.`);
