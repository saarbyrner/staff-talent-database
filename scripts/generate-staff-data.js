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
  "UCLA",
  "Stanford University",
  "University of North Carolina",
  "Georgetown University",
  "Indiana University",
  "US Soccer Federation",
  "Canadian Soccer Association",
  "Mexican Football Federation"
];

const roles = [
  "Head Coach",
  "Assistant Coach",
  "Technical Director",
  "Sporting Director",
  "Academy Director",
  "Scout",
  "Analyst",
  "Youth Development Coach"
];

// State mapping for cities
const cityStateMap = {
  "Los Angeles": "California",
  "San Francisco": "California",
  "San Diego": "California",
  "San Jose": "California",
  "Sacramento": "California",
  "Oakland": "California",
  "New York": "New York",
  "Chicago": "Illinois",
  "Houston": "Texas",
  "Dallas": "Texas",
  "Austin": "Texas",
  "San Antonio": "Texas",
  "Philadelphia": "Pennsylvania",
  "Phoenix": "Arizona",
  "Seattle": "Washington",
  "Denver": "Colorado",
  "Boston": "Massachusetts",
  "Portland": "Oregon",
  "Atlanta": "Georgia",
  "Miami": "Florida",
  "Orlando": "Florida",
  "Tampa": "Florida",
  "Jacksonville": "Florida",
  "Las Vegas": "Nevada",
  "Nashville": "Tennessee",
  "Memphis": "Tennessee",
  "Detroit": "Michigan",
  "Minneapolis": "Minnesota",
  "Columbus": "Ohio",
  "Cleveland": "Ohio",
  "Cincinnati": "Ohio",
  "Charlotte": "North Carolina",
  "Raleigh": "North Carolina",
  "Indianapolis": "Indiana",
  "Kansas City": "Missouri",
  "St. Louis": "Missouri",
  "Baltimore": "Maryland",
  "Milwaukee": "Wisconsin",
  "Pittsburgh": "Pennsylvania",
  "Salt Lake City": "Utah",
  "Toronto": "Ontario",
  "Vancouver": "British Columbia",
  "Montreal": "Quebec",
  "Calgary": "Alberta",
  "Edmonton": "Alberta",
  "Ottawa": "Ontario",
  "Winnipeg": "Manitoba",
  "Quebec City": "Quebec",
  "Hamilton": "Ontario",
  "London": "Ontario"
};

function generateEmployerHistory(rng, currentEmployer, index) {
  const org = rng.choice(organizations);
  const role = rng.choice(roles);
  const startYear = 2010 + rng.integer(0, 10);
  const endYear = startYear + rng.integer(1, 4);
  return `${org} - ${role} (${startYear}-${endYear})`;
}

function expandCoachingLicenses(existingLicenses, interestArea, rng) {
  const expanded = [...existingLicenses];
  
  // If they have PRO license, likely have progression
  if (expanded.includes("USSF PRO License") || expanded.includes("UEFA Pro License")) {
    if (rng.boolean(0.8) && !expanded.includes("USSF A - Senior License")) {
      expanded.push("USSF A - Senior License");
    }
    if (rng.boolean(0.7) && !expanded.includes("USSF B License")) {
      expanded.push("USSF B License");
    }
  }
  
  // Add some random additional licenses
  if (interestArea === "Coaching" && rng.boolean(0.4)) {
    const additional = rng.choices(coachingLicenses.filter(l => !expanded.includes(l)), rng.integer(1, 2));
    expanded.push(...additional);
  }
  
  return expanded.length > 0 ? expanded : ["Not Applicable"];
}

// Process each staff member
console.log('Generating comprehensive staff data...');

staffData.forEach((person, index) => {
  const rng = new SeededRandom(12345 + index); // Fixed seed based on index
  
  // Add state if missing or update from city
  if (!person.state || person.state === "California" || person.state === "New York") {
    person.state = cityStateMap[person.city] || rng.choice(Object.values(cityStateMap));
  }
  
  // Professional Coaching Section
  const hasCoachingInterest = person.interestArea === "Coaching" || person.proCoachExp;
  person.proCoachExpUpdate = hasCoachingInterest && person.proCoachExp;
  
  if (person.proCoachExpUpdate) {
    person.prevMlsCoachExp = person.mlsCoachExp || rng.boolean(0.7);
    
    if (person.prevMlsCoachExp) {
      // Use existing or generate
      if (!person.mlsCoachRoles || person.mlsCoachRoles.length === 0) {
        person.mlsCoachingExpList = rng.choices(mlsCoachingExpTypes, rng.integer(1, 3));
      } else {
        person.mlsCoachingExpList = person.mlsCoachRoles;
      }
      
      // Use existing or generate
      if (!person.mlsClubsCoached || person.mlsClubsCoached.length === 0) {
        person.mlsClubsCoached = rng.choices(mlsClubs, rng.integer(1, 2));
      }
    } else {
      person.mlsCoachingExpList = [];
      person.mlsClubsCoached = [];
    }
    
    // Non-MLS experience
    if (!person.nonMlsCoachExp || person.nonMlsCoachExp.length === 0) {
      person.nonMlsCoachExp = rng.boolean(0.6) ? rng.choices(nonMlsCoachExp, rng.integer(1, 2)) : [];
    }
  } else {
    person.prevMlsCoachExp = false;
    person.mlsCoachingExpList = [];
    person.mlsClubsCoached = [];
    person.nonMlsCoachExp = [];
  }
  
  // Professional Sporting Experience Section
  const hasSportingInterest = person.interestArea === "Sporting Executive";
  person.proSportingExpUpdate = person.sportingExp || hasSportingInterest;
  
  if (person.proSportingExpUpdate) {
    person.prevMlsSportingExp = person.mlsSportingExp || rng.boolean(0.6);
    
    if (person.prevMlsSportingExp) {
      if (!person.mlsClubsSporting || person.mlsClubsSporting.length === 0) {
        person.mlsClubsSporting = rng.choices(mlsClubs, rng.integer(1, 2));
      }
    } else {
      person.mlsClubsSporting = [];
    }
    
    if (!person.nonMlsSportingExp || person.nonMlsSportingExp.length === 0) {
      person.nonMlsSportingExp = rng.boolean(0.5) ? rng.choices(nonMlsSportingExp, rng.integer(1, 2)) : [];
    }
    
    if (!person.sportingVertical || person.sportingVertical.length === 0) {
      person.sportingVertical = rng.choices(sportingVerticals, rng.integer(1, 3));
    }
  } else {
    person.prevMlsSportingExp = false;
    person.mlsClubsSporting = [];
    person.nonMlsSportingExp = [];
    person.sportingVertical = [];
  }
  
  // Employment History Section
  person.currentlyEmployed = rng.boolean(0.85);
  
  if (!person.currentEmployer) {
    person.currentEmployer = `${rng.choice(mlsClubs)} - ${rng.choice(roles)} (${2020 + rng.integer(0, 4)}-Present)`;
  }
  
  if (!person.prevEmployer1) {
    person.prevEmployer1 = generateEmployerHistory(rng, person.currentEmployer, 1);
  }
  
  if (!person.prevEmployer2 || person.prevEmployer2 === "") {
    person.prevEmployer2 = rng.boolean(0.7) ? generateEmployerHistory(rng, person.currentEmployer, 2) : null;
  }
  
  person.prevEmployer3 = rng.boolean(0.4) ? generateEmployerHistory(rng, person.currentEmployer, 3) : null;
  person.prevEmployer4 = rng.boolean(0.2) ? generateEmployerHistory(rng, person.currentEmployer, 4) : null;
  
  // Education & Languages Section
  // Convert degree string to array if needed
  if (typeof person.degree === 'string' && person.degree) {
    person.highestDegree = [person.degree];
  } else {
    person.highestDegree = rng.choices(degrees, rng.integer(1, 2));
  }
  
  // MLS Programming
  if (!person.mlsPrograms || person.mlsPrograms.length === 0) {
    if (hasCoachingInterest) {
      person.mlsProgramming = rng.boolean(0.4) ? rng.choices(mlsPrograms, rng.integer(1, 2)) : [];
    } else {
      person.mlsProgramming = rng.boolean(0.2) ? [rng.choice(mlsPrograms)] : [];
    }
  } else {
    person.mlsProgramming = person.mlsPrograms;
  }
  
  // Expand coaching licenses
  if (person.coachingLicenses && person.coachingLicenses.length > 0) {
    person.coachingLicenses = expandCoachingLicenses(person.coachingLicenses, person.interestArea, rng);
  } else {
    person.coachingLicenses = hasCoachingInterest ? rng.choices(coachingLicenses, rng.integer(2, 4)) : ["Not Applicable"];
  }
  
  // Sporting Director Certifications
  if (!person.sportingCerts || person.sportingCerts.length === 0) {
    if (hasSportingInterest) {
      person.sportingDirectorCerts = rng.boolean(0.5) ? rng.choices(sportingDirectorCerts, rng.integer(1, 2)) : [];
    } else {
      person.sportingDirectorCerts = [];
    }
  } else {
    person.sportingDirectorCerts = person.sportingCerts;
  }
  
  // Other licenses
  person.otherLicenses = rng.boolean(0.15);
  person.otherLicensesList = person.otherLicenses ? 
    `${rng.choice(["Sports Management Certificate", "Nutrition Specialist", "Strength & Conditioning", "Mental Performance Coach"])} (${2015 + rng.integer(0, 8)})` : 
    null;
  
  // Languages - expand if needed
  if (!person.languages || person.languages.length === 0) {
    person.languages = ["English"];
  }
  if (person.languages.length < 2 && rng.boolean(0.7)) {
    const additionalLangs = ["Spanish", "French", "Portuguese", "German", "Italian"];
    person.languages.push(rng.choice(additionalLangs.filter(l => !person.languages.includes(l))));
  }
  
  // File upload URLs
  if (!person.coachingLicenseDoc) {
    person.coachingLicenseDoc = hasCoachingInterest && rng.boolean(0.7) ? 
      `https://fake-s3.mls.com/licenses/${person.id}_coaching.pdf` : null;
  }
  
  if (!person.otherCertsDoc) {
    person.otherCertsDoc = person.otherLicenses ? 
      `https://fake-s3.mls.com/certs/${person.id}_other.pdf` : null;
  }
  
  console.log(`✓ Processed ${person.firstName} ${person.lastName} (${person.interestArea})`);
});

// Write updated data
fs.writeFileSync(dataPath, JSON.stringify(staffData, null, 2), 'utf8');
console.log(`\n✓ Successfully updated ${staffData.length} staff records`);
console.log(`✓ Data written to ${dataPath}`);
