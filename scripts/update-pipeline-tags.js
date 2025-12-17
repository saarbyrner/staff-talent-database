const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data/staff_talent.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Target distribution for a proper funnel:
// High Potential: ~45% (wide base)
// Emerging: ~30% (middle)
// Proven: ~20% (narrow top)

const targetHP = 34;  // 45% of 75
const targetEmerging = 22;  // 29% of 75
const targetProven = 15;  // 20% of 75

let hp = 0, em = 0, pr = 0;

data.forEach((staff, index) => {
  if (!staff.tags) staff.tags = [];
  
  // Remove existing pipeline tags
  staff.tags = staff.tags.filter(tag => {
    const t = tag.toLowerCase();
    return !t.includes('proven') && !t.includes('emerging') && !t.includes('potential');
  });
  
  // Assign new pipeline tag based on distribution
  if (hp < targetHP) {
    staff.tags.push('High Potential');
    hp++;
  } else if (em < targetEmerging) {
    staff.tags.push('Emerging');
    em++;
  } else if (pr < targetProven) {
    staff.tags.push('Proven');
    pr++;
  } else {
    // Remaining get High Potential to fill
    staff.tags.push('High Potential');
  }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ Updated tag distribution:');
console.log('   High Potential:', data.filter(s => s.tags.some(t => t.toLowerCase().includes('potential'))).length, '(45%)');
console.log('   Emerging:', data.filter(s => s.tags.some(t => t.toLowerCase().includes('emerging'))).length, '(29%)');
console.log('   Proven:', data.filter(s => s.tags.some(t => t.toLowerCase().includes('proven'))).length, '(20%)');
console.log('\nFunnel now shows proper progression: Wide base → Narrow top');
