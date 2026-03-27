const fs = require("fs");
const path = require("path");

const filePath = path.join(process.cwd(), "src", "contexts", "ChallengeContext.tsx");
const content = fs.readFileSync(filePath, "utf8");
const lines = content.split(/\r?\n/);

const seenKeys = new Set();
const newLines = [];

for (let line of lines) {
  // If it's a translation line 'key': 'value',
  const match = line.match(/^\s*['"](\w+)['"]\s*:/);
  if (match) {
    const key = match[1];
    if (key.includes("vause")) continue;
    // We don't check for duplicates across DIFFERENT language blocks, 
    // but the error TS1117 is within a single object literal.
    // However, our script shouldn't produce duplicates if we just filter.
  }
  
  // Fix mentions
  let newLine = line.replace(/Pley, Vause, Kight/g, "Pley, Kight")
                   .replace(/Pley, Vause and Kight/g, "Pley and Kight")
                   .replace(/Pley, Vause, and Kight/g, "Pley and Kight")
                   .replace(/Pley, Vause, Kight마다/g, "Pley, Kight마다")
                   .replace(/Pley, Vause, Kight는/g, "Pley, Kight는")
                   .replace(/Pley、Vause、Kight/g, "Pley、Kight");
  
  if (newLine.includes("vause: 0,")) {
    newLine = newLine.replace(/vause: 0,\s*/g, "");
  }

  newLines.push(newLine);
}

fs.writeFileSync(filePath, newLines.join("\n"), "utf8");
console.log("SUCCESS");
