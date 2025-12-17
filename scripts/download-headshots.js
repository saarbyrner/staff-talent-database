const fs = require('fs');
const https = require('https');
const path = require('path');

// Read the staff data to get all picUrl values
const staffDataPath = path.join(__dirname, '../src/data/staff_talent.json');
const staffData = JSON.parse(fs.readFileSync(staffDataPath, 'utf8'));

// Get unique FIFA URLs
const fifaUrls = [...new Set(staffData.map(s => s.picUrl).filter(url => url && url.includes('sofifa.net')))];

console.log(`📥 Downloading ${fifaUrls.length} unique headshots...\n`);

const outputDir = path.join(__dirname, '../public/assets/headshots');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let downloaded = 0;
let failed = 0;

function downloadImage(url, index) {
  return new Promise((resolve) => {
    // Extract player ID from URL
    const match = url.match(/players\/(\d+)\/(\d+)\/(\d+)_120\.png/);
    if (!match) {
      console.error(`❌ Invalid URL format: ${url}`);
      failed++;
      resolve();
      return;
    }

    const filename = `${match[1]}_${match[2]}.png`;
    const filepath = path.join(outputDir, filename);

    // Skip if already downloaded
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Already exists: ${filename}`);
      downloaded++;
      resolve();
      return;
    }

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          downloaded++;
          console.log(`✅ Downloaded: ${filename}`);
          resolve();
        });
      } else {
        console.error(`❌ Failed to download ${url} - Status: ${response.statusCode}`);
        failed++;
        resolve();
      }
    }).on('error', (err) => {
      console.error(`❌ Error downloading ${url}:`, err.message);
      failed++;
      resolve();
    });
  });
}

// Download images with delay to avoid rate limiting
async function downloadAll() {
  for (let i = 0; i < fifaUrls.length; i++) {
    await downloadImage(fifaUrls[i], i);
    // Small delay between requests
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Successfully downloaded: ${downloaded}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Images saved to: ${outputDir}`);
  
  // Update staff data to use local paths
  console.log(`\n🔄 Updating staff data to use local images...`);
  staffData.forEach(staff => {
    if (staff.picUrl && staff.picUrl.includes('sofifa.net')) {
      const match = staff.picUrl.match(/players\/(\d+)\/(\d+)\/(\d+)_120\.png/);
      if (match) {
        staff.picUrl = `/assets/headshots/${match[1]}_${match[2]}.png`;
      }
    }
  });
  
  fs.writeFileSync(staffDataPath, JSON.stringify(staffData, null, 2), 'utf8');
  console.log(`✅ Updated staff_talent.json with local image paths`);
}

downloadAll();
