#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Seeded random number generator for reproducible results
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  choice(array) {
    return array[Math.floor(this.next() * array.length)];
  }
  
  boolean(probability = 0.5) {
    return this.next() < probability;
  }
}

// Load existing data
const dataPath = path.join(__dirname, '../src/data/staff_talent.json');
const staffData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// MLS Clubs
const mlsClubs = [
  "Atlanta United FC", "Austin FC", "Charlotte FC", "Chicago Fire FC", 
  "FC Cincinnati", "Colorado Rapids", "Columbus Crew", "DC United", 
  "FC Dallas", "Houston Dynamo FC", "Inter Miami CF", "LA Galaxy", 
  "LAFC", "Minnesota United FC", "CF Montreal", "Nashville SC", 
  "New England Revolution", "New York City FC", "New York Red Bulls", 
  "Orlando City SC", "Philadelphia Union", "Portland Timbers", 
  "Real Salt Lake", "San Jose Earthquakes", "Seattle Sounders FC", 
  "Sporting Kansas City", "St. Louis City SC", "Toronto FC", 
  "Vancouver Whitecaps FC"
];

// Add submittedBy field to each staff member
staffData.forEach((staff, index) => {
  const rng = new SeededRandom(parseInt(staff.id) * 7);
  
  // 40% chance submitted by League, 60% by a club
  if (rng.boolean(0.4)) {
    staff.submittedBy = 'MLS League';
  } else {
    staff.submittedBy = rng.choice(mlsClubs);
  }
});

// Write updated data back to file
fs.writeFileSync(dataPath, JSON.stringify(staffData, null, 2));

console.log(`✅ Updated ${staffData.length} staff records with submittedBy field`);
console.log('Distribution:');
const distribution = {};
staffData.forEach(staff => {
  distribution[staff.submittedBy] = (distribution[staff.submittedBy] || 0) + 1;
});
console.log(distribution);
