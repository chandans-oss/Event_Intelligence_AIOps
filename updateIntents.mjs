import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const jsonPath = 'c:\\Users\\Chandan S\\Downloads\\db_intent_categorized.mongo_db_intent_categorized.json';
const tsPath = join(__dirname, 'src', 'features', 'admin', 'data', 'adminData.ts');

const rawData = JSON.parse(readFileSync(jsonPath, 'utf8'));

// Deep copy and camelCase
function convertToCamelCase(obj) {
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
  formatted.subIntent = item.subintent; // Fix specific property mapping
  return formatted;
});

const fileContent = readFileSync(tsPath, 'utf8');

const startIndex = fileContent.indexOf('export const mockIntentsFull: IntentFull[] = [');
const endIndexStr = '];\n\n// KB Categories for navigation';
const endIndex = fileContent.indexOf(endIndexStr, startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find start or end index");
    process.exit(1);
}

const tsString = JSON.stringify(formattedData, null, 2);

// Fix property formatting in JS objects to match TS syntax
let formattedStr = tsString.replace(/"([^"]+)":/g, '$1:');
// Make strings single quotes where reasonably safe
formattedStr = formattedStr.replace(/"(.*?[^\\])"/g, "'$1'");

const finalOutput = fileContent.substring(0, startIndex) +
    'export const mockIntentsFull: IntentFull[] = ' + formattedStr +
    fileContent.substring(endIndex + 1);

writeFileSync(tsPath, finalOutput);
console.log('Successfully replaced mockIntentsFull');
