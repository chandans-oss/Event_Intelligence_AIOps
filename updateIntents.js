const fs = require('fs');
const path = require('path');

const jsonPath = 'c:\\Users\\Chandan S\\Downloads\\db_intent_categorized.mongo_db_intent_categorized.json';
const tsPath = path.join(__dirname, 'src', 'features', 'admin', 'data', 'adminData.ts');

const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Convert snake_case to camelCase
function convertToCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => convertToCamelCase(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce(
      (result, key) => {
        const newKey = key.replace(/([-_][a-z])/g, group =>
          group.toUpperCase().replace('-', '').replace('_', '')
        );
        result[newKey] = convertToCamelCase(obj[key]);
        return result;
      },
      {}
    );
  }
  return obj;
}

const formattedData = rawData.map(item => {
  const formatted = convertToCamelCase(item);
  if (formatted.subintent) {
    formatted.subIntent = formatted.subintent;
    delete formatted.subintent;
  }
  return formatted;
});

const fileContent = fs.readFileSync(tsPath, 'utf8');

const startIndex = fileContent.indexOf('export const mockIntentsFull: IntentFull[] = [');
const endIndexStr = '];\n\n// KB Categories for navigation';
const endIndex = fileContent.indexOf(endIndexStr, startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find start or end index");
    process.exit(1);
}

const newArrayContent = JSON.stringify(formattedData, null, 2).replace(/"([^"]+)":/g, '$1:').replace(/"/g, "'");
// fix double quotes for string values that need it if we blindly replace quotes, it might break JSON.
// let's do something safer for formatting to ts formatting
const tsString = JSON.stringify(formattedData, null, 2);
// using a regex replacer only for keys and string values
const tsFinal = tsString.replace(/"([^"]+)":/g, '$1:').replace(/"(.*?[^\\])"/g, "'$1'"); // simple replace double to single quotes


const finalOutput = fileContent.substring(0, startIndex) +
    'export const mockIntentsFull: IntentFull[] = ' + tsString +
    fileContent.substring(endIndex + 1);

fs.writeFileSync(tsPath, finalOutput);
console.log('Successfully replaced mockIntentsFull');
