const fs = require('fs');
const path = require('path');

function cleanHome(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove Vause Pill block
    // Look for {/* Vause Pill */} and the following <div>...</div> block
    // We can use a simpler regex if we know the markers
    const startMarker = '{/* Vause Pill */}';
    const endMarker = '{/* Kight Pill */}';
    
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);
    
    if (startIndex !== -1 && endIndex !== -1) {
        content = content.slice(0, startIndex) + content.slice(endIndex);
    }
    
    // Remove Vause InfoModal block
    // Looking for a div that contains about_vause_title
    const infoPattern = /\s*<div className=\"bg-purple-50 p-4 rounded-2xl border border-purple-100\">[\s\S]*?about_vause_title[\s\S]*?<\/div>/g;
    content = content.replace(infoPattern, '');
    
    fs.writeFileSync(filePath, content);
    console.log('Cleaned Home.tsx');
}

function cleanContext(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const filteredLines = lines.filter(line => {
        return !line.includes('vause_title') && 
               !line.includes('vause_desc') && 
               !line.includes('vause_item') &&
               !line.includes('about_vause');
    });
    
    let result = filteredLines.join('\n');
    
    // Clean up inline mentions
    result = result.replace(/Pley, Vause, Kight/g, 'Pley, Kight');
    result = result.replace(/Pley, Vause, and Kight/g, 'Pley and Kight');
    result = result.replace(/Pley, Vause and Kight/g, 'Pley and Kight');
    result = result.replace(/Pley, Vause, and Kight/g, 'Pley and Kight');
    result = result.replace(/Pley, Vause, Kight마다/g, 'Pley, Kight마다');
    result = result.replace(/Pley, Vause, Kight는/g, 'Pley, Kight는');
    
    fs.writeFileSync(filePath, result);
    console.log('Cleaned ChallengeContext.tsx');
}

const homePath = path.join(process.cwd(), 'src', 'pages', 'Home.tsx');
const contextPath = path.join(process.cwd(), 'src', 'contexts', 'ChallengeContext.tsx');

if (fs.existsSync(homePath)) cleanHome(homePath);
if (fs.existsSync(contextPath)) cleanContext(contextPath);
