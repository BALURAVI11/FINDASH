const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function editFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Background replacements
  content = content.replace(/\bbg-white\b/g, 'bg-[#FFFFF0]');
  content = content.replace(/\bbg-slate-50\b/g, 'bg-[#FDFBF7]');

  // Indigo to Dark Green/Yellow replacements (Only if not prefixed by dark:)
  
  // text-indigo-600 -> text-emerald-800 (Dark Green)
  content = content.replace(/(?<!dark:)(?:text|bg|border|ring|shadow)-indigo-600/g, match => match.replace('indigo-600', 'emerald-800'));
  
  // text-indigo-700 -> text-emerald-900
  content = content.replace(/(?<!dark:)(?:text|bg|border|ring|shadow)-indigo-700/g, match => match.replace('indigo-700', 'emerald-900'));
  
  // text-indigo-800 -> text-emerald-950
  content = content.replace(/(?<!dark:)(?:text|bg|border|ring|shadow)-indigo-800/g, match => match.replace('indigo-800', 'emerald-950'));
  
  // bg-indigo-100 -> bg-yellow-100 (Yellow accent for light backgrounds)
  content = content.replace(/(?<!dark:)(?:text|bg|border|ring|shadow)-indigo-100/g, match => match.replace('indigo-100', 'yellow-100'));
  
  // bg-indigo-50 -> bg-yellow-50
  content = content.replace(/(?<!dark:)(?:text|bg|border|ring|shadow)-indigo-50/g, match => match.replace('indigo-50', 'yellow-50'));
  
  // focus:border-indigo-500 -> focus:border-emerald-800
  content = content.replace(/(?<!dark:)focus:border-indigo-500/g, 'focus:border-emerald-800');
  content = content.replace(/(?<!dark:)focus:ring-indigo-500/g, 'focus:ring-emerald-800');
  
  // text-indigo-500 -> text-emerald-700
  content = content.replace(/(?<!dark:)(?:text|bg|border|ring|shadow)-indigo-500/g, match => match.replace('indigo-500', 'emerald-700'));
  
  // border-indigo-200 -> border-emerald-200
  content = content.replace(/(?<!dark:)(?:text|bg|border|ring|shadow)-indigo-200/g, match => match.replace('indigo-200', 'emerald-200'));

  // DashboardLayout specific glow/shadow tweaks
  content = content.replace(/rgba\(79,70,229,0\.3\)/g, 'rgba(6,78,59,0.3)'); // rgb for indigo to emerald-900ish

  // Specifically inject yellow in the logo
  if (filePath.includes('DashboardLayout.jsx')) {
    content = content.replace('text-white', 'text-yellow-400');
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
      editFile(fullPath);
    }
  }
}

processDirectory(directoryPath);
console.log('Files updated successfully.');
