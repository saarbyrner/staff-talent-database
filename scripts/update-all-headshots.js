const fs = require('fs');
const path = require('path');

// Read staff data
const staffDataPath = path.join(__dirname, '../src/data/staff_talent.json');
const staffData = JSON.parse(fs.readFileSync(staffDataPath, 'utf8'));

console.log('🖼️  Updating all staff headshots with local FIFA faces...\n');

// Get all downloaded FIFA faces
const headshotsDir = path.join(__dirname, '../public/assets/headshots');
const fifaFaces = fs.existsSync(headshotsDir) 
  ? fs.readdirSync(headshotsDir).filter(f => f.endsWith('.png')).sort() 
  : [];

console.log(`📊 Total staff: ${staffData.length}`);
console.log(`🎯 Local FIFA faces available: ${fifaFaces.length}\n`);

if (fifaFaces.length < staffData.length) {
  console.log(`⚠️  WARNING: Not enough local images (${fifaFaces.length}) for all staff (${staffData.length})`);
  console.log(`   Run download-headshots.js first to download more images\n`);
}

// Update all staff with local FIFA faces (cycle through if needed)
let updated = 0;
staffData.forEach((staff, index) => {
  if (fifaFaces.length > 0) {
    // Cycle through available faces to ensure everyone gets an image
    const faceIndex = index % fifaFaces.length;
    staff.picUrl = `/assets/headshots/${fifaFaces[faceIndex]}`;
    updated++;
  } else {
    staff.picUrl = ''; // Clear any old remote URLs
  }
});

// Save updated data
fs.writeFileSync(staffDataPath, JSON.stringify(staffData, null, 2), 'utf8');

console.log('✅ Update Summary:');
console.log(`   📝 Total updated: ${updated} (${Math.round(updated/staffData.length * 100)}%)`);
console.log(`   🖼️  All using local FIFA player faces`);
console.log(`\n📁 Updated: ${staffDataPath}`);
console.log('\n🎉 All done! Professional FIFA headshots ready for Vercel.');

