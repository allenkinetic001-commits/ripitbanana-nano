const fs = require('fs');
let content = fs.readFileSync('src/components/PostCard.tsx', 'utf8');

// 1. Remove traitorLongPress from the profile header
content = content.replace(
  '          {...heartsHandlers}\r\n          {...traitorLongPress.handlers}\r\n        >',
  '          {...heartsHandlers}\r\n        >'
);

// 2. Restore normal comment button - remove wrapping div
const commentWrapped = [
  '            <div {...traitorLongPress.handlers} className="px-10 py-4 -mx-6 -my-2 flex items-center justify-center cursor-pointer">',
  '              <button ',
  '                onClick={(e) => {',
  '                  e.stopPropagation();',
  '                  navigate(`/post/${id}`);',
  '                }}',
  '                className="flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 h-8 w-8 rounded-full transition-colors group"',
  '              >',
  '                <MessageCircle size={20} stroke="black" />',
  '              </button>',
  '            </div>',
].join('\r\n');

const commentNormal = [
  '            <button ',
  '              onClick={() => navigate(`/post/${id}`)}',
  '              className="flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 h-8 w-8 rounded-full transition-colors group"',
  '            >',
  '              <MessageCircle size={20} stroke="black" />',
  '            </button>',
].join('\r\n');

content = content.replace(commentWrapped, commentNormal);

// 3. Add invisible hit zone BEFORE the enemy button (beside it, to the left)
const enemyBtnStart = '             <div className="flex items-center">\r\n               <button ';
const enemyBtnWithHitZone = 
  '             <div className="flex items-center">\r\n' +
  '               <div\r\n' +
  '                 {...traitorLongPress.handlers}\r\n' +
  '                 className="w-5 h-10 cursor-pointer flex-shrink-0"\r\n' +
  '               />\r\n' +
  '               <button ';

content = content.replace(enemyBtnStart, enemyBtnWithHitZone);

fs.writeFileSync('src/components/PostCard.tsx', content, 'utf8');
console.log('Done');
console.log('traitorLongPress count:', (content.match(/traitorLongPress\.handlers/g)||[]).length);
console.log('heartsHandlers lines:', content.split('\n').filter(l => l.includes('heartsHandlers')).length);
