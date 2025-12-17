const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/staff_talent.json', 'utf8'));

// Add sample tags to first 10 records
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
  ['Proven', 'Emerging']
];

for (let i = 0; i < Math.min(10, data.length); i++) {
  if (!data[i].tags) {
    data[i].tags = sampleTags[i % sampleTags.length];
  }
}

fs.writeFileSync('src/data/staff_talent.json', JSON.stringify(data, null, 2));
console.log('Added sample tags to first 10 records');
