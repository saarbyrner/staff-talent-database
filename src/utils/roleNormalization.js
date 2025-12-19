/**
 * Utility to normalize and consolidate erratic roles into a clean, standardized set.
 */

const ROLE_MAPPING = {
    // Head Coaching
    'MLS First Team Head Coach': 'Head Coach',
    'MLS NEXT Pro Head Coach': 'Head Coach',
    'Head Coach': 'Head Coach',

    // Assistant Coaching
    'Assistant Coach': 'Assistant Coach',
    'First Team Coach': 'Assistant Coach',
    'MLS NEXT Pro Assistant Coach': 'Assistant Coach',
    'Tactical Coach': 'Assistant Coach',
    'Set Piece Specialist': 'Assistant Coach',
    'First Team Specialist Coach': 'Assistant Coach',

    // Academy & Youth
    'Academy Coach': 'Academy Coaching',
    'MLS NEXT (Academy) Coach': 'Academy Coaching',
    'MLS NEXT Academy Head Coach': 'Academy Coaching',
    'MLS NEXT Coach': 'Academy Coaching',
    'Youth Developer': 'Academy Coaching',
    'Youth Lead': 'Academy Coaching',
    'Director of Academy': 'Academy Coaching',
    'Academy Director': 'Academy Coaching',
    'Reserve Team Coach': 'Academy Coaching',

    // Specialist Coaching
    'Goalkeeping Coach': 'Specialist Coach',
    'Strikers Coach': 'Specialist Coach',
    'Midfield Coach': 'Specialist Coach',

    // Sporting & Executive
    'General Manager or Sporting Director': 'Sporting Executive',
    'Sporting Director': 'Sporting Executive',
    'Sporting Executive': 'Sporting Executive',
    'Head of Women\'s Football': 'Sporting Executive',
    'Director of Football Operations': 'Sporting Executive',
    'Assistant General Manager or Sporting Director': 'Sporting Executive',
    'Executive': 'Sporting Executive',
    'General Manager': 'Sporting Executive',
    'Director of Football': 'Sporting Executive',
    'Director of League Relations': 'Sporting Executive',
    'Director of Player Personnel': 'Sporting Executive',

    // Technical Leadership
    'Technical Director': 'Technical Director',
    'Technical Lead': 'Technical Director',
    'Academy Technical Director': 'Technical Director',

    // Recruitment & Scouting
    'Head of Recruitment': 'Recruitment & Scouting',
    'Scout': 'Recruitment & Scouting',
    'Senior Scout': 'Recruitment & Scouting',
    'Recruitment Lead': 'Recruitment & Scouting',
    'Chief Scout': 'Recruitment & Scouting',

    // Data & Analysis
    'Data analyst': 'Data & Analysis',
    'Data Scientist': 'Data & Analysis',
    'Insights Lead': 'Data & Analysis',
    'Performance Analyst': 'Data & Analysis',
    'Systems Analyst': 'Data & Analysis',
    'Tactical Analyst': 'Data & Analysis',
    'Video Analyst': 'Data & Analysis',
    'Set Piece Analyst': 'Data & Analysis',
    'Technical Director of Analytics': 'Data & Analysis',
    'Director of Analytics': 'Data & Analysis',
    'Lead Data Analyst': 'Data & Analysis',
    'Director of Scouting': 'Recruitment & Scouting',

    // Performance & Medical
    'Head of Physical Prep': 'Performance & Medical',
    'Head of Sports Science': 'Performance & Medical',
    'Performance Coach': 'Performance & Medical',
    'performance coach': 'Performance & Medical',
    'Performance Director': 'Performance & Medical',
    'Sports Scientist': 'Performance & Medical',
    'Sports Psychologist': 'Performance & Medical',
    'Team Doctor': 'Performance & Medical',
    'Physiotherapist': 'Performance & Medical',
    'S&C Coach': 'Performance & Medical',
    'Nutritionist': 'Performance & Medical',
    'Strength & Conditioning Coach': 'Performance & Medical',
    'Medical Staff': 'Performance & Medical',
    'Sports Nutritionist': 'Performance & Medical',

    // Operations & Support (Merging odd roles like Product Strategist/User Research)
    'Player Care': 'Operations & Support',
    'Head of Talent': 'Operations & Support',
    'Player Development': 'Operations & Support',
    'Head of Player Development': 'Operations & Support',
    'Product Owner': 'Technical Operations',
    'Product Strategist': 'Technical Operations',
    'User Research': 'Technical Operations',
    'Other Technical Role': 'Technical Operations',
    'Technical & Support Staff': 'Technical Operations',
    'IT': 'Technical Operations',
    'System Admin': 'Technical Operations',
    'System Administrator': 'Technical Operations'
};

/**
 * Standardizes a role string.
 * @param {string} role The raw role string
 * @returns {string} The normalized role string
 */
export const normalizeRole = (role) => {
    if (!role) return 'Other';

    // Clean the input
    const cleanRole = role.trim();

    // Check direct mapping
    if (ROLE_MAPPING[cleanRole]) {
        return ROLE_MAPPING[cleanRole];
    }

    // Case-insensitive check
    const entries = Object.entries(ROLE_MAPPING);
    for (const [key, value] of entries) {
        if (key.toLowerCase() === cleanRole.toLowerCase()) {
            return value;
        }
    }

    // Part-of-string check for common keywords
    if (cleanRole.toLowerCase().includes('coach')) return 'Assistant Coach';
    if (cleanRole.toLowerCase().includes('scout') || cleanRole.toLowerCase().includes('recruitment')) return 'Recruitment & Scouting';
    if (cleanRole.toLowerCase().includes('analyst') || cleanRole.toLowerCase().includes('analysis')) return 'Data & Analysis';
    if (cleanRole.toLowerCase().includes('director') || cleanRole.toLowerCase().includes('manager')) return 'Sporting Executive';
    if (cleanRole.toLowerCase().includes('performance') || cleanRole.toLowerCase().includes('medical') || cleanRole.toLowerCase().includes('doctor')) return 'Performance & Medical';

    return 'Other';
};

/**
 * Gets the set of all unique normalized roles.
 */
export const getStandardizedRoles = () => {
    return [...new Set(Object.values(ROLE_MAPPING))].sort();
};
