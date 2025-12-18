/**
 * Script to update staff tags:
 * 1. Remove 'Homegrown' tag from all staff
 * 2. Ensure each staff member has exactly 1 tag based on experience
 */

const fs = require('fs');
const path = require('path');

const staffDataPath = path.join(__dirname, '../src/data/staff_talent.json');
const staffData = JSON.parse(fs.readFileSync(staffDataPath, 'utf8'));

// Available tags (excluding Homegrown)
const TAGS = ['Unproven', 'Emerging', 'High Potential', 'Proven'];

/**
 * Determine the appropriate tag for a staff member based on their experience
 * @param {object} staff - Staff member data
 * @returns {string} - The tag to assign
 */
function determineTag(staff) {
  // Calculate experience score based on various factors
  let experienceScore = 0;
  
  // MLS Experience (high weight)
  if (staff.mlsCoachExp || staff.prevMlsCoachExp) experienceScore += 3;
  if (staff.mlsSportingExp || staff.prevMlsSportingExp) experienceScore += 3;
  if (staff.mlsPlayerExp) experienceScore += 2;
  
  // Professional Experience (medium weight)
  if (staff.proCoachExp || staff.proCoachExpUpdate) experienceScore += 2;
  if (staff.sportingExp || staff.proSportingExpUpdate) experienceScore += 2;
  if (staff.proPlayerExp) experienceScore += 1;
  
  // Coaching Licenses (quality indicator)
  if (staff.coachingLicenses && Array.isArray(staff.coachingLicenses)) {
    if (staff.coachingLicenses.some(l => l.includes('PRO'))) experienceScore += 3;
    if (staff.coachingLicenses.some(l => l.includes('UEFA A') || l.includes('USSF A'))) experienceScore += 2;
    if (staff.coachingLicenses.length >= 3) experienceScore += 1;
  }
  
  // Sporting Certifications
  if (staff.sportingCerts && staff.sportingCerts.length > 0) experienceScore += 2;
  if (staff.sportingDirectorCerts && staff.sportingDirectorCerts.length > 0) experienceScore += 2;
  
  // Education
  if (staff.degree === 'Masters Degree' || staff.highestDegree?.includes('Masters Degree')) experienceScore += 1;
  if (staff.degree === 'PhD' || staff.highestDegree?.includes('PhD')) experienceScore += 2;
  
  // MLS Clubs coached/worked at (indicates established career)
  if (staff.mlsClubsCoached && staff.mlsClubsCoached.length > 0) experienceScore += staff.mlsClubsCoached.length;
  if (staff.mlsClubsSporting && staff.mlsClubsSporting.length > 0) experienceScore += staff.mlsClubsSporting.length;
  
  // Determine tag based on score
  if (experienceScore >= 10) return 'Proven';
  if (experienceScore >= 5) return 'Emerging';
  if (experienceScore >= 2) return 'High Potential';
  return 'Unproven';
}

// Process each staff member
let updatedCount = 0;
let removedHomegrown = 0;

staffData.forEach(staff => {
  const originalTags = staff.tags || [];
  
  // Check if Homegrown exists
  if (originalTags.includes('Homegrown')) {
    removedHomegrown++;
  }
  
  // Determine the single tag based on experience
  const newTag = determineTag(staff);
  
  // Update tags to have exactly 1 tag
  staff.tags = [newTag];
  
  if (JSON.stringify(originalTags) !== JSON.stringify(staff.tags)) {
    updatedCount++;
  }
  
  console.log(`${staff.firstName} ${staff.lastName}: ${originalTags.join(', ') || 'none'} → ${newTag}`);
});

// Write updated data back to file
fs.writeFileSync(staffDataPath, JSON.stringify(staffData, null, 2), 'utf8');

console.log('\n=== Summary ===');
console.log(`Total staff members: ${staffData.length}`);
console.log(`Staff with updated tags: ${updatedCount}`);
console.log(`Homegrown tags removed: ${removedHomegrown}`);
console.log('\nTag distribution:');
const tagCounts = staffData.reduce((acc, staff) => {
  const tag = staff.tags[0];
  acc[tag] = (acc[tag] || 0) + 1;
  return acc;
}, {});
Object.entries(tagCounts).forEach(([tag, count]) => {
  console.log(`  ${tag}: ${count} (${((count / staffData.length) * 100).toFixed(1)}%)`);
});
