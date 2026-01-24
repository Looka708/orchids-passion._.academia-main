/**
 * Generate TypeScript mappings from categorized JSON
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'ilmkidunya-videos-enhanced.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let output = `// Auto-generated video mappings from ilmkidunya channel
// Total categorized videos: ${Object.values(data).reduce((acc, cat) => {
    if (Array.isArray(cat)) return acc;
    return acc + Object.values(cat).reduce((a, b) => a + b.length, 0);
}, 0)}

export interface VideoMapping {
    videoId: string;
    title: string;
    searchKeywords: string[];
}
`;

// Helper to clean title
const cleanTitle = (title) => title.replace(/"/g, '\\"').replace(/\$/g, '\\$');

// Process each category
for (const [category, subjects] of Object.entries(data)) {
    if (category === 'Other') continue;

    output += `\n// ==========================================\n`;
    output += `// ${category}\n`;
    output += `// ==========================================\n`;

    for (const [subject, videos] of Object.entries(subjects)) {
        if (videos.length === 0) continue;

        // Create variable name: Class9BiologyVideos, TestPrepPhysicsVideos, etc.
        const varName = `${category.replace(/\s+/g, '')}${subject.replace(/\s+/g, '')}Videos`;

        output += `\nexport const ${varName}: VideoMapping[] = [\n`;

        videos.forEach(video => {
            output += `  {\n`;
            output += `    videoId: "${video.videoId}",\n`;
            output += `    title: "${cleanTitle(video.title)}",\n`;
            output += `    searchKeywords: ["${subject}", "${category}"]\n`;
            output += `  },\n`;
        });

        output += `];\n`;
    }
}

const outputPath = path.join(__dirname, '..', 'src', 'lib', 'youtube', 'ilmkidunyaMappings.ts');
fs.writeFileSync(outputPath, output);
console.log(`✅ Generated TypeScript mappings at: ${outputPath}`);
