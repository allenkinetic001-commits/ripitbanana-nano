const fs = require('fs');
let content = fs.readFileSync('src/components/PostCard.tsx', 'utf8');

// Remove the invisible hit zone div that's messing up layout
const withHitZone = 
  '             <div className="flex items-center">\r\n' +
  '               <div\r\n' +
  '                 {...traitorLongPress.handlers}\r\n' +
  '                 className="w-5 h-10 cursor-pointer flex-shrink-0"\r\n' +
  '               />\r\n' +
  '               <button ';

const withoutHitZone = 
  '             <div className="flex items-center">\r\n' +
  '               <button ';

content = content.replace(withHitZone, withoutHitZone);

// Instead, wrap the entire top-right actions container div with the traitor long press
// The container is: <div className="flex items-center space-x-2">
// We add the handlers there so the whole row (space beside add enemy, between buttons) triggers it
content = content.replace(
  '         <div className="flex items-center space-x-2">',
  '         <div className="flex items-center space-x-2" {...traitorLongPress.handlers}>'
);

fs.writeFileSync('src/components/PostCard.tsx', content, 'utf8');
console.log('Done');
console.log('traitorLongPress count:', (content.match(/traitorLongPress\.handlers/g)||[]).length);
