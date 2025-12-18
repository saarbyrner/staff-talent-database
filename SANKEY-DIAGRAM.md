# Staff Data Flow Analysis (Sankey Diagram)

## Overview
The Staff Data Flow Analysis feature provides an interactive Sankey diagram that visualizes relationships between different data points in the staff talent database. This allows users to understand the composition and distribution of staff across various dimensions.

## Location
- **Route**: `/dataflow`
- **Navigation**: "Data Flow" tab in the main navigation (between "Analysis" and "Athletes")
- **Icon**: AccountTreeOutlined (flow chart icon)

## Features

### Interactive Data Selection
Users can select any two different data points to create a flow visualization:

#### Available Data Points:
1. **Gender** - Male/Female distribution
2. **Ethnicity** - Ethnic background breakdown
3. **Country** - Geographic origin
4. **Tags** - Custom tags applied to staff (e.g., "Proven", "High Potential")
5. **Role Type** - All roles including coaching, executive, technical, and sporting
6. **Work Authorization** - US and/or Canada work authorization
7. **Education Level** - Highest degree obtained
8. **MLS Experience** - Experience as player, coach, or sporting director
9. **Coaching License** - Highest coaching certification
10. **Interest Area** - Primary area of interest (e.g., Coaching, Executive)

### Visualization Details
- **Node Width**: Represents the total number of staff in each category
- **Link Width**: Shows the number of staff sharing both characteristics
- **Color Coding**: 
  - Left nodes (source): Blue (#2E5C8A)
  - Right nodes (target): Purple (#8B4789)
  - Links: Semi-transparent, matching source color
- **Labels**: Show category name, count, and percentage
- **Tooltips**: Hover over nodes and links for detailed information

### Use Cases

#### Example Combinations:
1. **Gender → Role Type**: Understanding gender distribution across different positions
2. **Tags → Role Type**: See which roles are filled by "Proven" vs other talent
3. **Ethnicity → Role Type**: Analyze diversity across coaching and executive positions
4. **Country → Work Authorization**: Understand geographic distribution and work status
5. **Education Level → Role Type**: See educational backgrounds by position type
6. **MLS Experience → Role Type**: Connect prior experience to current roles
7. **Coaching License → Role Type**: Understand certification levels by position

## Technical Implementation

### Component Location
`src/components/StaffSankeyDiagram.jsx`

### Dependencies
- **d3**: Core D3.js library for data visualization
- **d3-sankey**: Specialized Sankey diagram layout algorithm
- **@mui/material**: Material-UI components for UI controls
- **React**: Component framework

### Data Source
Reads from `src/data/staff_talent.json` - the same data used by the Staff Database grid

### Key Functions
- `extractFieldValues()`: Extracts data from staff records based on field type
- `generateSankeyData()`: Aggregates flows between source and target fields
- `d3.sankey()`: Calculates optimal node and link positions

## Future Enhancements
- Export diagram as PNG/SVG
- Filter by additional criteria (e.g., only show MLS experience holders)
- Three-way flow diagrams
- Animation when switching between data points
- Custom color schemes
- Comparison view (side-by-side Sankeys)
