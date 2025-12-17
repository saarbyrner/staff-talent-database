const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/staff_talent.json', 'utf8'));

const sampleTags = [
  ['Proven', 'Homegrown'],
  ['Emerging', 'High Potential'],
  ['Proven'],
  ['High Potential', 'Emerging'],
  ['Homegrown', 'Proven'],
  ['Emerging'],
  ['Proven', 'High Potential'],
  ['Homegrown'],
  ['High Potential'],
  ['Proven', 'Emerging'],
  ['Homegrown', 'High Potential'],
  ['Emerging', 'Proven'],
  ['High Potential'],
  ['Homegrown', 'Emerging'],
  ['Proven', 'High Potential', 'Homegrown'],
  ['Emerging'],
  ['High Potential', 'Proven'],
  ['Homegrown'],
  ['Emerging', 'High Potential'],
  ['Proven']
];

// Add tags to first 30 records
for (let i = 0; i < Math.min(30, data.length); i++) {
  data[i].tags = sampleTags[i % sampleTags.length];
}

fs.writeFileSync('src/data/staff_talent.json', JSON.stringify(data, null, 2));
console.log('Added sample tags to first 30 records');
