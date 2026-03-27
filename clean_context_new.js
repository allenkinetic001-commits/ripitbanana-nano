const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'contexts', 'ChallengeContext.tsx');
if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// remove lines with vause keys
const lines = content.split(/\r?\n/);
const filteredLines = lines.filter(line => {
    return !line.includes('vause_title') && 
           !line.includes('vause_desc') && 
           !line.includes('vause_item') &&
           !line.includes('about_vause');
});

let result = filteredLines.join('\n');

// global replacements
result = result.replace(/Pley, Vause, Kight/g, 'Pley, Kight');
result = result.replace(/Pley, Vause and Kight/g, 'Pley and Kight');
result = result.replace(/Pley, Vause, and Kight/g, 'Pley and Kight');
result = result.replace(/Pley, Vause, Kight마다/g, 'Pley, Kight마다');
result = result.replace(/Pley, Vause, Kight는/g, 'Pley, Kight는');
result = result.replace(/Pley、Vause、Kight/g, 'Pley、Kight');

// remove vause from state initializations
result = result.replace(/vause: 0,\s*/g, '');

fs.writeFileSync(filePath, result, 'utf8');
console.log('Successfully cleaned ChallengeContext.tsx');
