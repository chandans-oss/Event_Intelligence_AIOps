import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const jsonPath = 'c:\\Users\\Chandan S\\Downloads\\db_intent_categorized.mongo_db_intent_categorized.json';
const tsPath = join(__dirname, 'src', 'features', 'admin', 'data', 'adminData.ts');

const rawData = JSON.parse(readFileSync(jsonPath, 'utf8'));

export function convertToCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => convertToCamelCase(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const newKey = key.replace(/([-_][a-z])/g, group =>
        group.toUpperCase().replace('-', '').replace('_', '')
      );
      result[newKey] = convertToCamelCase(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

const formattedData = rawData.map(item => {
  const formatted = convertToCamelCase(item);
  formatted.subIntent = item.subintent; 
  delete formatted.subintent;
  // Let's also ensure `linkedKB` is preserved if there
  if (item.linkedKB) formatted.linkedKB = item.linkedKB;
  if (item.linked_kb) formatted.linkedKB = item.linked_kb;
  return formatted;
});

// Dynamic Categories construction
const categoryMap = {};
for(const i of formattedData) {
  const dom = i.domain;
  const domId = dom.toLowerCase().replace(/[^a-z0-9]/g, '-');
  if(!categoryMap[dom]) {
    categoryMap[dom] = {
      id: domId,
      name: dom,
      domain: dom,
      subcategoriesMap: {}
    };
  }
  
  const intent = i.intent;
  const subName = intent.charAt(0).toUpperCase() + intent.slice(1);
  if(!categoryMap[dom].subcategoriesMap[intent]) {
    categoryMap[dom].subcategoriesMap[intent] = {
      id: intent,
      name: subName,
      function: i.function || 'General',
      intentCount: 0
    };
  }
  categoryMap[dom].subcategoriesMap[intent].intentCount++;
}

const dynamicCategories = Object.values(categoryMap).map(c => ({
  id: c.id,
  name: c.name,
  domain: c.domain,
  subcategories: Object.values(c.subcategoriesMap)
}));


let fileContent = readFileSync(tsPath, 'utf8');

// REPLACE mockIntentCategories
const catStart = fileContent.indexOf('export const mockIntentCategories: IntentCategory[] = [');
const catEndStr = '];\n\n// Full Intent Data';
const catEnd = fileContent.indexOf(catEndStr, catStart);
if (catStart !== -1 && catEnd !== -1) {
  let catStr = JSON.stringify(dynamicCategories, null, 2).replace(/"([^"]+)":/g, '$1:');
  catStr = catStr.replace(/"(.*?[^\\])"/g, "'$1'");
  fileContent = fileContent.substring(0, catStart) +
    'export const mockIntentCategories: IntentCategory[] = ' + catStr +
    fileContent.substring(catEnd + 1); // catEnd points to `];` so +1 includes `]` but misses `;`
} else {
  console.log("Could not find mockIntentCategories block");
}

let intStart = fileContent.indexOf('export const mockIntentsFull: IntentFull[] = [');
let intEndStr = '];\n\n// KB Categories';
let intEnd = fileContent.indexOf(intEndStr, intStart);

if (intStart === -1 || intEnd === -1) {
    console.error("Could not find start or end index for mockIntentsFull");
    process.exit(1);
}

let tsString = JSON.stringify(formattedData, null, 2);
tsString = tsString.replace(/"([^"]+)":/g, '$1:');
tsString = tsString.replace(/"(.*?[^\\])"/g, "'$1'");

fileContent = fileContent.substring(0, intStart) +
    'export const mockIntentsFull: IntentFull[] = ' + tsString +
    fileContent.substring(intEnd + 1);

writeFileSync(tsPath, fileContent);
console.log('Successfully replaced mockIntentsFull and mockIntentCategories');
