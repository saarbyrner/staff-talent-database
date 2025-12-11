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
  
  choices(array, count) {
    const result = [];
    const available = [...array];
    const actualCount = Math.min(count, available.length);
    for (let i = 0; i < actualCount; i++) {
      const index = Math.floor(this.next() * available.length);
      result.push(available[index]);
      available.splice(index, 1);
    }
    return result;
  }
  
  boolean(probability = 0.5) {
    return this.next() < probability;
  }
  
  integer(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

// Load existing data
const dataPath = path.join(__dirname, '../src/data/staff_talent.json');
const staffData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Get the last ID and determine starting ID for new staff
const lastId = Math.max(...staffData.map(s => parseInt(s.id)));
const startingId = lastId + 1;

console.log(`Current staff count: ${staffData.length}`);
console.log(`Last ID: ${lastId}`);
console.log(`Starting new IDs from: ${startingId}`);

// Reference data
const mlsClubs = ["Atlanta United FC", "Austin FC", "Charlotte FC", "Chicago Fire FC", "FC Cincinnati", "Colorado Rapids", "Columbus Crew", "DC United", "FC Dallas", "Houston Dynamo FC", "Inter Miami CF", "LA Galaxy", "LAFC", "Minnesota United FC", "CF Montreal", "Nashville SC", "New England Revolution", "New York City FC", "New York Red Bulls", "Orlando City SC", "Philadelphia Union", "Portland Timbers", "Real Salt Lake", "San Jose Earthquakes", "Seattle Sounders FC", "Sporting Kansas City", "St. Louis City SC", "Toronto FC", "Vancouver Whitecaps FC"];

const mlsNextProClubs = ["Atlanta United 2", "Birmingham Legion FC", "Carolina Core FC", "Chicago Fire FC II", "Colorado Rapids 2", "Columbus Crew 2", "Crown Legacy FC", "FC Cincinnati 2", "Huntsville City FC", "LA Galaxy II", "New England Revolution II", "New York Red Bulls II", "North Carolina FC", "Orlando City B", "Philadelphia Union II", "Portland Timbers 2", "Real Monarchs", "San Jose Earthquakes II", "Sounders FC 2", "Sporting Kansas City II", "St. Louis City SC 2", "The Town FC", "Toronto FC II", "Ventura County FC", "Whitecaps FC 2"];

const allMlsClubs = [...mlsClubs, ...mlsNextProClubs];

const mlsCoachingExpTypes = [
  "MLS First Team Head Coaching Experience",
  "MLS First Team Assistant Coaching Experience",
  "MLS NEXT Pro Head Coaching Experience",
  "MLS NEXT Pro Assistant Coaching Experience",
  "MLS NEXT Academy Coaching Experience"
];

const nonMlsCoachExp = [
  "National Team Coaching Experience",
  "Other 1st Division Head Coaching Experience",
  "1st Division Assistant Coaching Experience",
  "Collegiate Coaching Experience",
  "Other International Coaching Experience"
];

const nonMlsSportingExp = [
  "National Team Sporting Experience",
  "USL Sporting Experience",
  "NWSL Sporting Experience",
  "Other 1st Division Sporting Experience",
  "Collegiate Sporting Experience",
  "Other International Sporting Experience"
];

const sportingVerticals = [
  "Scouting",
  "Analytics",
  "Player Development",
  "CAP & Player Personnel",
  "Other"
];

const degrees = [
  "Associates Degree",
  "Bachelors Degree",
  "Masters Degree",
  "Doctoral Degree (Ph.D.)"
];

const mlsPrograms = [
  "MLS Advance",
  "Elite Formation Coaching License",
  "Match Evaluator Program",
  "Match Director Program",
  "League Access Program"
];

const coachingLicenses = [
  "USSF PRO License",
  "USSF A - Senior License",
  "USSF A - Youth License",
  "USSF B License",
  "USSF C License",
  "USSF D License",
  "USSF Grassroots License",
  "USSF Goalkeeping A License",
  "UEFA Pro License",
  "UEFA A License",
  "UEFA B License",
  "UEFA C License",
  "Canada Soccer A License",
  "Canada Soccer B License",
  "Canada Soccer C License",
  "Elite Formation Coaching License (MLS)"
];

const sportingDirectorCerts = [
  "FIFA",
  "FA",
  "The Global Institute of Sport"
];

const organizations = [
  "FC Barcelona Academy",
  "Real Madrid Youth",
  "Manchester United Academy",
  "Bayern Munich",
  "Ajax Amsterdam",
  "Juventus Academy",
  "Paris Saint-Germain",
  "Borussia Dortmund",
  "Liverpool FC Academy",
  "Chelsea FC Academy",
  "UCLA",
  "Stanford University",
  "University of North Carolina",
  "Georgetown University",
  "Indiana University",
  "Duke University",
  "University of Virginia",
  "Wake Forest University",
  "US Soccer Federation",
  "Canadian Soccer Association",
  "Mexican Football Federation",
  "English FA",
  "German DFB"
];

const coachingRoleOptions = [
  ["MLS First Team Head Coach"],
  ["MLS First Team Assistant Coach"],
  ["MLS NEXT Pro Head Coach"],
  ["MLS NEXT Pro Assistant Coach"],
  ["MLS NEXT Academy Head Coach"],
  ["MLS First Team Head Coach", "MLS NEXT Pro Head Coach"],
  ["MLS First Team Assistant Coach", "MLS NEXT Academy Head Coach"]
];

const executiveRoleOptions = [
  ["General Manager"],
  ["Sporting Director"],
  ["Technical Director"],
  ["Director of Player Personnel"],
  ["Director of Scouting"],
  ["Assistant General Manager"],
  ["General Manager", "Sporting Director"],
  ["Sporting Director", "Technical Director"]
];

const technicalRoleOptions = [
  ["Performance Analyst"],
  ["Video Analyst"],
  ["Scout"],
  ["Data Scientist"],
  ["Sports Scientist"],
  ["Performance Analyst", "Scout"],
  ["Video Analyst", "Data Scientist"]
];

const regions = ["West", "South", "Midwest", "Northeast", "Canada"];

const firstNames = [
  "Marcus", "Elena", "Jordan", "Sophia", "Diego", "Olivia", "Carlos", "Emma",
  "Andre", "Isabella", "Lucas", "Mia", "Gabriel", "Ava", "Sebastian", "Charlotte",
  "Rafael", "Amelia", "Miguel", "Harper", "Daniel", "Evelyn", "David", "Abigail",
  "Alexander", "Emily", "James", "Madison", "Benjamin", "Chloe", "Samuel", "Lily",
  "Nathan", "Grace", "Isaac", "Zoe", "Adrian", "Hannah", "Julian", "Natalie"
];

const lastNames = [
  "Martinez", "Johnson", "Williams", "Garcia", "Rodriguez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris",
  "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen",
  "King", "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker",
  "Gonzalez", "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips"
];

const genders = ["Male", "Female", "Non-binary"];

const ethnicities = [
  "White / Caucasian",
  "Black / African American",
  "Hispanic / Latino",
  "Asian",
  "Native American",
  "Pacific Islander",
  "Two or More Races",
  "Prefer not to say"
];

const usStates = [
  "California", "New York", "Texas", "Florida", "Illinois", "Pennsylvania",
  "Ohio", "Georgia", "North Carolina", "Michigan", "New Jersey", "Virginia",
  "Washington", "Arizona", "Massachusetts", "Tennessee", "Indiana", "Missouri",
  "Maryland", "Wisconsin", "Colorado", "Minnesota", "South Carolina", "Alabama",
  "Louisiana", "Kentucky", "Oregon", "Oklahoma", "Connecticut", "Utah",
  "Iowa", "Nevada", "Arkansas", "Mississippi", "Kansas", "New Mexico"
];

const canadianProvinces = ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba"];

const cities = [
  "Los Angeles", "New York", "Chicago", "Houston", "Phoenix", "Philadelphia",
  "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville",
  "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis", "Seattle",
  "Denver", "Washington", "Boston", "Nashville", "Detroit", "Portland",
  "Las Vegas", "Memphis", "Louisville", "Baltimore", "Milwaukee", "Albuquerque",
  "Tucson", "Fresno", "Sacramento", "Kansas City", "Mesa", "Atlanta",
  "Omaha", "Colorado Springs", "Raleigh", "Miami", "Oakland", "Minneapolis",
  "Toronto", "Vancouver", "Montreal", "Calgary", "Edmonton", "Ottawa"
];

const interestAreas = ["Coaching", "Sporting Executive", "Technical & Support Staff"];

const agencyNames = [
  "Pro Sports Management", "Elite Athlete Representation", "Premier Sports Agency",
  "Global Sports Partners", "Champions Management Group", "Stellar Sports Agency",
  "Victory Sports Representation", "Peak Performance Management", "First Class Sports",
  "Strategic Sports Group"
];

const agentNames = [
  "Sarah Jenkins", "Michael Roberts", "Jennifer Martinez", "David Thompson",
  "Lisa Anderson", "Robert Garcia", "Maria Rodriguez", "John Williams",
  "Patricia Davis", "James Wilson"
];

const otherLeagueExperience = [
  "Played 3 years in La Liga (Real Sociedad)",
  "Played 5 years in Premier League (West Ham United)",
  "Played 4 years in Liga MX (Atlas)",
  "Played 2 years in Bundesliga (Hoffenheim)",
  "Played 6 years in Serie A (Fiorentina)",
  "Played 3 years in Ligue 1 (Rennes)",
  "Played 4 years in Eredivisie (AZ Alkmaar)",
  "Played 5 years in Liga NOS (Sporting CP)",
  "Played 2 years in Super Lig (Fenerbahce)",
  "Played 3 years in Belgian Pro League (Gent)"
];

// State mapping for cities
const cityStateMap = {
  "Los Angeles": "California", "San Francisco": "California", "San Diego": "California",
  "San Jose": "California", "Sacramento": "California", "Oakland": "California",
  "New York": "New York", "Chicago": "Illinois", "Houston": "Texas",
  "Dallas": "Texas", "Austin": "Texas", "San Antonio": "Texas", "Fort Worth": "Texas",
  "Philadelphia": "Pennsylvania", "Phoenix": "Arizona", "Mesa": "Arizona", "Tucson": "Arizona",
  "Seattle": "Washington", "Denver": "Colorado", "Colorado Springs": "Colorado",
  "Boston": "Massachusetts", "Portland": "Oregon", "Atlanta": "Georgia",
  "Miami": "Florida", "Orlando": "Florida", "Tampa": "Florida", "Jacksonville": "Florida",
  "Las Vegas": "Nevada", "Nashville": "Tennessee", "Memphis": "Tennessee",
  "Detroit": "Michigan", "Minneapolis": "Minnesota", "Columbus": "Ohio",
  "Cleveland": "Ohio", "Cincinnati": "Ohio", "Charlotte": "North Carolina",
  "Raleigh": "North Carolina", "Indianapolis": "Indiana", "Kansas City": "Missouri",
  "St. Louis": "Missouri", "Baltimore": "Maryland", "Milwaukee": "Wisconsin",
  "Pittsburgh": "Pennsylvania", "Salt Lake City": "Utah", "Albuquerque": "New Mexico",
  "Fresno": "California", "Omaha": "Nebraska", "Louisville": "Kentucky",
  "Toronto": "Ontario", "Vancouver": "British Columbia", "Montreal": "Quebec",
  "Calgary": "Alberta", "Edmonton": "Alberta", "Ottawa": "Ontario"
};

const roles = [
  "Head Coach", "Assistant Coach", "Technical Director", "Sporting Director",
  "Academy Director", "Scout", "Senior Scout", "Chief Scout",
  "Performance Analyst", "Video Analyst", "Data Analyst",
  "Youth Development Coach", "Goalkeeper Coach", "Fitness Coach"
];

function generateStaffMember(id, seed) {
  const rng = new SeededRandom(seed);
  
  const firstName = rng.choice(firstNames);
  const lastName = rng.choice(lastNames);
  const city = rng.choice(cities);
  const country = ["Toronto", "Vancouver", "Montreal", "Calgary", "Edmonton", "Ottawa"].includes(city) ? "Canada" : "USA";
  const state = cityStateMap[city] || rng.choice(country === "Canada" ? canadianProvinces : usStates);
  
  const interestArea = rng.choice(interestAreas);
  const hasAgent = rng.boolean(0.3);
  const proPlayerExp = rng.boolean(0.4);
  const mlsPlayerExp = proPlayerExp && rng.boolean(0.6);
  
  let coachingRoles = [];
  let execRoles = [];
  let techRoles = [];
  
  if (interestArea === "Coaching") {
    coachingRoles = rng.choice(coachingRoleOptions);
  } else if (interestArea === "Sporting Executive") {
    execRoles = rng.choice(executiveRoleOptions);
  } else {
    techRoles = rng.choice(technicalRoleOptions);
  }
  
  const proCoachExp = interestArea === "Coaching" && rng.boolean(0.7);
  const mlsCoachExp = proCoachExp && rng.boolean(0.5);
  const sportingExp = interestArea === "Sporting Executive" && rng.boolean(0.6);
  const mlsSportingExp = sportingExp && rng.boolean(0.4);
  
  const currentYear = 2025;
  const startYear = currentYear - rng.integer(1, 4);
  const currentRole = rng.choice(roles);
  const currentClub = rng.choice(mlsClubs);
  
  const prevYear1End = startYear - 1;
  const prevYear1Start = prevYear1End - rng.integer(2, 5);
  const prevRole1 = rng.choice(roles);
  const prevOrg1 = rng.choice([...mlsClubs, ...organizations]);
  
  const prevYear2End = prevYear1Start - 1;
  const prevYear2Start = prevYear2End - rng.integer(2, 4);
  const prevRole2 = rng.choice(roles);
  const prevOrg2 = rng.choice(organizations);
  
  let prevEmployer3 = null;
  let prevEmployer4 = null;
  
  if (rng.boolean(0.5)) {
    const prevYear3End = prevYear2Start - 1;
    const prevYear3Start = prevYear3End - rng.integer(2, 4);
    const prevRole3 = rng.choice(roles);
    const prevOrg3 = rng.choice(organizations);
    prevEmployer3 = `${prevOrg3} - ${prevRole3} (${prevYear3Start}-${prevYear3End})`;
    
    if (rng.boolean(0.3)) {
      const prevYear4End = prevYear3Start - 1;
      const prevYear4Start = prevYear4End - rng.integer(2, 3);
      const prevRole4 = rng.choice(roles);
      const prevOrg4 = rng.choice(organizations);
      prevEmployer4 = `${prevOrg4} - ${prevRole4} (${prevYear4Start}-${prevYear4End})`;
    }
  }
  
  const currentlyEmployed = rng.boolean(0.8);
  
  const hasCoachingLicenses = interestArea === "Coaching" || proCoachExp;
  let coachingLicensesList = ["Not Applicable"];
  if (hasCoachingLicenses) {
    const licenseCount = rng.integer(2, 5);
    coachingLicensesList = rng.choices(coachingLicenses, licenseCount);
  }
  
  const hasSportingCerts = interestArea === "Sporting Executive" && rng.boolean(0.4);
  const sportingCertsList = hasSportingCerts ? rng.choices(sportingDirectorCerts, rng.integer(1, 2)) : [];
  
  const languageCount = rng.integer(1, 3);
  const allLanguages = ["English", "Spanish", "French", "Portuguese", "German", "Italian", "Dutch"];
  const languages = rng.choices(allLanguages, Math.min(languageCount, allLanguages.length));
  if (!languages.includes("English")) {
    languages.unshift("English");
  }
  
  const highestDegree = rng.choices(degrees, rng.integer(1, 1));
  const mlsProgramming = rng.boolean(0.3) ? rng.choices(mlsPrograms, rng.integer(1, 2)) : [];
  
  const otherLicenses = rng.boolean(0.15);
  const otherLicensesList = otherLicenses ? 
    `${rng.choice(["Sports Management Certificate", "Nutrition Specialist", "Strength & Conditioning", "Mental Performance Coach"])} (${2015 + rng.integer(0, 8)})` : 
    null;
  
  const phoneNum = `+1 (555) ${String(rng.integer(100, 999)).padStart(3, '0')}-${String(rng.integer(1000, 9999)).padStart(4, '0')}`;
  
  const staff = {
    id: String(id),
    firstName,
    lastName,
    phone: phoneNum,
    email: `${firstName.toLowerCase().charAt(0)}.${lastName.toLowerCase()}@example.com`,
    country,
    state,
    city,
    workAuthUS: country === "USA" || rng.boolean(0.7),
    workAuthCA: country === "Canada" || rng.boolean(0.4),
    gender: rng.choice(genders),
    ethnicity: rng.choice(ethnicities),
    hasAgent,
    agentName: hasAgent ? rng.choice(agentNames) : null,
    agencyName: hasAgent ? rng.choice(agencyNames) : null,
    proPlayerExp,
    mlsPlayerExp,
    mlsClubsPlayed: mlsPlayerExp ? rng.choices(mlsClubs, rng.integer(1, 3)) : [],
    otherPlayerExp: proPlayerExp && !mlsPlayerExp ? rng.choice(otherLeagueExperience) : null,
    interestArea,
    coachingRoles,
    execRoles,
    techRoles,
    relocation: rng.choices(regions, rng.integer(1, 3)),
    proCoachExp,
    mlsCoachExp,
    mlsCoachRoles: mlsCoachExp ? rng.choices(mlsCoachingExpTypes, rng.integer(1, 2)) : [],
    mlsClubsCoached: mlsCoachExp ? rng.choices(mlsClubs, rng.integer(1, 2)) : [],
    nonMlsCoachExp: proCoachExp && rng.boolean(0.6) ? rng.choices(nonMlsCoachExp, rng.integer(1, 2)) : [],
    sportingExp,
    mlsSportingExp,
    mlsClubsSporting: mlsSportingExp ? rng.choices(mlsClubs, rng.integer(1, 2)) : [],
    nonMlsSportingExp: sportingExp && rng.boolean(0.5) ? rng.choices(nonMlsSportingExp, rng.integer(1, 2)) : [],
    sportingVertical: sportingExp ? rng.choices(sportingVerticals, rng.integer(1, 2)) : [],
    currentEmployer: currentlyEmployed ? `${currentClub} - ${currentRole} (${startYear}-Present)` : null,
    prevEmployer1: `${prevOrg1} - ${prevRole1} (${prevYear1Start}-${prevYear1End})`,
    prevEmployer2: `${prevOrg2} - ${prevRole2} (${prevYear2Start}-${prevYear2End})`,
    prevEmployer3,
    prevEmployer4,
    degree: highestDegree[0],
    mlsPrograms: mlsProgramming,
    coachingLicenses: coachingLicensesList,
    sportingCerts: sportingCertsList,
    languages,
    resumeUrl: `https://fake-s3.mls.com/resumes/${lastName.toLowerCase()}_${id}.pdf`,
    picUrl: `https://fake-s3.mls.com/avatars/${lastName.toLowerCase()}_${id}.jpg`,
    proCoachExpUpdate: proCoachExp,
    prevMlsCoachExp: mlsCoachExp,
    mlsCoachingExpList: mlsCoachExp ? rng.choices(mlsCoachingExpTypes, rng.integer(1, 2)) : [],
    proSportingExpUpdate: sportingExp,
    prevMlsSportingExp: mlsSportingExp,
    currentlyEmployed,
    highestDegree,
    mlsProgramming,
    sportingDirectorCerts: sportingCertsList,
    otherLicenses,
    otherLicensesList,
    coachingLicenseDoc: hasCoachingLicenses && rng.boolean(0.7) ? 
      `https://fake-s3.mls.com/licenses/${id}_coaching.pdf` : null,
    otherCertsDoc: otherLicenses ? 
      `https://fake-s3.mls.com/certs/${id}_other.pdf` : null,
    profilePrivacy: rng.boolean(0.9) ? "Public" : "Private"
  };
  
  return staff;
}

// Generate 30 new staff members
console.log('\n🚀 Generating 30 new staff members...\n');

for (let i = 0; i < 30; i++) {
  const newId = startingId + i;
  const seed = 99999 + newId * 137; // Use a different seed base to ensure variety
  const newStaff = generateStaffMember(newId, seed);
  staffData.push(newStaff);
  console.log(`✓ Added ${newStaff.firstName} ${newStaff.lastName} (ID: ${newId}, ${newStaff.interestArea})`);
}

// Write updated data
fs.writeFileSync(dataPath, JSON.stringify(staffData, null, 2), 'utf8');

console.log(`\n✅ Successfully added 30 new staff members!`);
console.log(`📊 Total staff count: ${staffData.length}`);
console.log(`📁 Data written to ${dataPath}`);
