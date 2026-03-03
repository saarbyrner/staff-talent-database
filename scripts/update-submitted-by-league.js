#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load existing data
const dataPath = path.join(__dirname, '../src/data/staff_talent.json');
const staffData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Update all "MLS League" to "League"
let updatedCount = 0;
staffData.forEach(staff => {
  if (staff.submittedBy === 'MLS League') {
    staff.submittedBy = 'League';
    updatedCount++;
  }
});

// Write updated data back to file
fs.writeFileSync(dataPath, JSON.stringify(staffData, null, 2));

console.log(`✅ Updated ${updatedCount} records from "MLS League" to "League"`);
