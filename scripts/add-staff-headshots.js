const fs = require('fs');
const path = require('path');

console.log('🖼️  Adding FIFA headshots to users_staff.json...\n');

// Get all downloaded FIFA faces
const headshotsDir = path.join(__dirname, '../public/assets/headshots');
const fifaFaces = fs.existsSync(headshotsDir) 
  ? fs.readdirSync(headshotsDir).filter(f => f.endsWith('.png')).sort() 
  : [];

console.log(`🎯 Available FIFA faces: ${fifaFaces.length}\n`);

// Update users_staff.json
const usersStaffPath = path.join(__dirname, '../src/data/users_staff.json');
const usersStaff = JSON.parse(fs.readFileSync(usersStaffPath, 'utf8'));

usersStaff.forEach((staff, index) => {
  if (fifaFaces.length > 0) {
    const faceIndex = index % fifaFaces.length;
    staff.profilePic = `/assets/headshots/${fifaFaces[faceIndex]}`;
  }
});

fs.writeFileSync(usersStaffPath, JSON.stringify(usersStaff, null, 2), 'utf8');

console.log(`✅ Added profilePic to ${usersStaff.length} staff members`);
console.log(`📁 Updated: ${usersStaffPath}`);
console.log('\n🎉 Staff tab will now show FIFA headshots!');
