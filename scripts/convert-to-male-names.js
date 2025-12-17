const fs = require('fs');
const path = require('path');

// Male first names to use
const maleNames = [
  'James', 'Michael', 'Robert', 'John', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher',
  'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Andrew', 'Paul', 'Joshua', 'Kenneth',
  'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob',
  'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel',
  'Raymond', 'Gregory', 'Alexander', 'Patrick', 'Frank', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose',
  'Adam', 'Nathan', 'Henry', 'Zachary', 'Douglas', 'Peter', 'Kyle', 'Noah', 'Ethan', 'Jeremy',
  'Walter', 'Christian', 'Keith', 'Roger', 'Terry', 'Austin', 'Sean', 'Gerald', 'Carl', 'Harold',
  'Dylan', 'Arthur', 'Lawrence', 'Jordan', 'Jesse', 'Bryan', 'Billy', 'Bruce', 'Albert', 'Willie'
];

console.log('👨 Converting all names to male...\n');

// Update staff_talent.json
const staffTalentPath = path.join(__dirname, '../src/data/staff_talent.json');
const staffTalent = JSON.parse(fs.readFileSync(staffTalentPath, 'utf8'));

staffTalent.forEach((staff, index) => {
  staff.firstName = maleNames[index % maleNames.length];
  staff.gender = 'Male';
});

fs.writeFileSync(staffTalentPath, JSON.stringify(staffTalent, null, 2), 'utf8');
console.log(`✅ Updated ${staffTalent.length} staff in staff_talent.json`);

// Update users_staff.json
const usersStaffPath = path.join(__dirname, '../src/data/users_staff.json');
const usersStaff = JSON.parse(fs.readFileSync(usersStaffPath, 'utf8'));

usersStaff.forEach((staff, index) => {
  staff.firstname = maleNames[index % maleNames.length];
  staff.gender = 'Male';
});

fs.writeFileSync(usersStaffPath, JSON.stringify(usersStaff, null, 2), 'utf8');
console.log(`✅ Updated ${usersStaff.length} staff in users_staff.json`);

console.log('\n🎉 All names converted to male!');
