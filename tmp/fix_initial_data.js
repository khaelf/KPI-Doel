const fs = require('fs');
let s = fs.readFileSync('src/data/initialData.ts', 'utf8');
s = s.replace(/'\$\{curMonth\}'/g, 'curMonth');
s = s.replace(/'\$\{curMonth\}([^']*)'/g, '`${curMonth}$1`');
fs.writeFileSync('src/data/initialData.ts', s, 'utf8');
console.log('Fixed cleanly');
