/**
 * Test script to verify ilmkidunya video search logic
 */
const fs = require('fs');
const path = require('path');

// Load the data
const dataPath = path.join(__dirname, '..', 'ilmkidunya-videos-enhanced.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Mock the search function logic
function searchVideos(grade, subject, chapterName) {
    let className = '';
    if (['5', '6', '7', '8', '9', '10', '11', '12'].includes(grade)) {
        className = `Class ${grade}`;
    } else {
        return [];
    }

    const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);

    // Access the data
    const classData = data[className];
    if (!classData) return [];

    // Handle subject name matching (JSON keys vs variable names)
    // In JSON: "Mathematics", "Biology" etc.
    // In variable: "Mathematics", "Biology"
    // Need to handle case sensitivity if needed, but JSON keys are capitalized

    // Find the subject key that matches
    const subjectKey = Object.keys(classData).find(k => k.toLowerCase() === subject.toLowerCase());
    if (!subjectKey) return [];

    const videos = classData[subjectKey];
    if (!videos || !Array.isArray(videos)) return [];

    // Filter logic
    const chapterLower = chapterName.toLowerCase();
    const keywords = chapterLower.split(/[\s-]+/).filter(w => w.length > 3 && !['unit', 'chapter', 'class', 'part'].includes(w));

    const matches = videos.filter(v => {
        const titleLower = v.title.toLowerCase();

        // High priority: Title contains full chapter name
        if (titleLower.includes(chapterLower)) return true;

        // Medium priority: Title contains most keywords
        if (keywords.length > 0) {
            const matchCount = keywords.filter(k => titleLower.includes(k)).length;
            return matchCount >= Math.ceil(keywords.length * 0.75);
        }

        return false;
    });

    return matches.slice(0, 5);
}

// Test cases
const tests = [
    { grade: '6', subject: 'mathematics', chapter: 'Sets' },
    { grade: '7', subject: 'science', chapter: 'Water' },
    { grade: '8', subject: 'english', chapter: 'Tolerance' },
    { grade: '9', subject: 'biology', chapter: 'Biodiversity' },
    { grade: '9', subject: 'chemistry', chapter: 'Atomic Structure' },
    { grade: '10', subject: 'mathematics', chapter: 'Quadratic Equations' },
    { grade: '11', subject: 'physics', chapter: 'Measurements' }
];

console.log('🧪 Testing Search Logic:\n');

tests.forEach(test => {
    console.log(`Searching for: Class ${test.grade} ${test.subject} - "${test.chapter}"`);
    const results = searchVideos(test.grade, test.subject, test.chapter);
    console.log(`Found ${results.length} videos:`);
    results.forEach(v => console.log(`  - ${v.title}`));
    console.log('');
});
