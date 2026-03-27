import fs from 'fs';
const data = fs.readFileSync('errors.txt', 'utf16le');
const lines = data.split('\n');
const duplicates = lines.filter(l => l.includes('TS1117'));
console.log(duplicates.slice(0, 15).map(l => l.trim()).join('\n'));
