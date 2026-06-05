import fs from 'fs';
import Papa from 'papaparse';

const activeData = fs.readFileSync('public/active_portfolio.csv', 'utf-8');
const activeRecords = Papa.parse(activeData, {
  header: true,
  skipEmptyLines: true
}).data;

const countries = new Map();
for (const row of activeRecords) {
    if (row['Country Code'] && row['Country (English)']) {
        countries.set(row['Country Code'], row['Country (English)']);
    }
}
console.log(countries);
