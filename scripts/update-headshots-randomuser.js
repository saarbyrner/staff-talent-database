const fs = require('fs');
const path = require('path');

// Read staff data
const staffDataPath = path.join(__dirname, '../src/data/staff_talent.json');
const staffData = JSON.parse(fs.readFileSync(staffDataPath, 'utf8'));

console.log('🖼️  Updating staff headshots with professional AI-generated photos...\n');
console.log(`📊 Total staff members: ${staffData.length}\n`);

// Use a combination of professional headshot services that are CORS-friendly
// These AI-generated faces look more professional and sporty

let maleIndex = 0;
let femaleIndex = 0;

staffData.forEach((staff, index) => {
  let picUrl;
  
  if (staff.gender === 'Male') {
    // Use xsgames.co/randomusers API - more professional looking
    // They have better quality, more diverse professional headshots
    const seed = 1000 + maleIndex;
    picUrl = `https://xsgames.co/randomusers/avatar.php?g=male&seed=${seed}`;
    maleIndex++;
  } else if (staff.gender === 'Female') {
    const seed = 1000 + femaleIndex;
    picUrl = `https://xsgames.co/randomusers/avatar.php?g=female&seed=${seed}`;
    femaleIndex++;
  } else {
    // For non-binary or other, use pixel avatars
    const seed = 1000 + index;
    picUrl = `https://xsgames.co/randomusers/avatar.php?g=pixel&seed=${seed}`;
  }
  
  staff.picUrl = picUrl;
});

// Save updated data
fs.writeFileSync(staffDataPath, JSON.stringify(staffData, null, 2), 'utf8');

console.log(`✅ Successfully updated ${staffData.length} staff headshots`);
console.log(`   👨 Male portraits: ${maleIndex}`);
console.log(`   👩 Female portraits: ${femaleIndex}`);
console.log(`\n📁 Updated file: ${staffDataPath}`);
console.log('\n🎉 All done! Professional AI-generated headshots that work on Vercel.');