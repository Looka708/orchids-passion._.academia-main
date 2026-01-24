/**
 * Script to fetch ALL videos from ilmkidunya YouTube channel
 * Supports Classes 5-12
 * Run with: node scripts/fetch-ilmkidunya-videos.js
 */

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || 'AIzaSyBVDbq-XvCEN7zA3AYv0gWe4MPYEujvK1k';
const CHANNEL_ID = 'UCplMtixZJ6pRcrMogBSYvuQ'; // ilmkidunyaofficial channel

async function getChannelUploadsPlaylistId(channelId) {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            return data.items[0].contentDetails.relatedPlaylists.uploads;
        }
    } catch (error) {
        console.error('Error getting uploads playlist:', error);
    }
    return null;
}

async function getPlaylistVideos(playlistId) {
    let allVideos = [];
    let nextPageToken = null;
    let pageCount = 0;

    do {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&pageToken=${nextPageToken || ''}&key=${YOUTUBE_API_KEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.items) {
                const videos = data.items.map(item => ({
                    videoId: item.snippet.resourceId.videoId,
                    title: item.snippet.title,
                    description: item.snippet.description,
                    publishedAt: item.snippet.publishedAt,
                    thumbnail: item.snippet.thumbnails.medium.url
                }));

                allVideos = allVideos.concat(videos);
                pageCount++;
                console.log(`Fetched ${allVideos.length} videos so far... (Page ${pageCount})`);
            }

            nextPageToken = data.nextPageToken;
        } catch (error) {
            console.error('Error fetching playlist videos:', error);
            break;
        }
    } while (nextPageToken);

    return allVideos;
}

function categorizeVideos(videos) {
    const categories = {
        'Class 5': { mathematics: [], science: [], english: [], urdu: [] },
        'Class 6': { mathematics: [], science: [], english: [], urdu: [] },
        'Class 7': { mathematics: [], science: [], english: [], urdu: [] },
        'Class 8': { mathematics: [], science: [], english: [], urdu: [] },
        'Class 9': { biology: [], physics: [], chemistry: [], mathematics: [], english: [], urdu: [], science: [] },
        'Class 10': { biology: [], physics: [], chemistry: [], mathematics: [], english: [], urdu: [], science: [] },
        'Class 11': { biology: [], physics: [], chemistry: [], mathematics: [], english: [], urdu: [], science: [] },
        'Class 12': { biology: [], physics: [], chemistry: [], mathematics: [], english: [], urdu: [], science: [] },
        'Other': []
    };

    videos.forEach(video => {
        const title = video.title.toLowerCase();
        const description = video.description.toLowerCase();
        const text = `${title} ${description}`;

        // Detect class
        let detectedClass = null;
        if (text.includes('class 5') || text.includes('5th class')) detectedClass = 'Class 5';
        else if (text.includes('class 6') || text.includes('6th class')) detectedClass = 'Class 6';
        else if (text.includes('class 7') || text.includes('7th class')) detectedClass = 'Class 7';
        else if (text.includes('class 8') || text.includes('8th class')) detectedClass = 'Class 8';
        else if (text.includes('class 9') || text.includes('9th class')) detectedClass = 'Class 9';
        else if (text.includes('class 10') || text.includes('10th class') || text.includes('matric')) detectedClass = 'Class 10';
        else if (text.includes('class 11') || text.includes('11th class') || text.includes('1st year')) detectedClass = 'Class 11';
        else if (text.includes('class 12') || text.includes('12th class') || text.includes('2nd year')) detectedClass = 'Class 12';

        // Detect subject
        let detectedSubject = null;
        if (text.includes('biology')) detectedSubject = 'biology';
        else if (text.includes('physics')) detectedSubject = 'physics';
        else if (text.includes('chemistry') && !text.includes('urdu')) detectedSubject = 'chemistry';
        else if (text.includes('math')) detectedSubject = 'mathematics';
        else if (text.includes('science') && !text.includes('computer')) detectedSubject = 'science';
        else if (text.includes('english')) detectedSubject = 'english';
        else if (text.includes('urdu')) detectedSubject = 'urdu';

        if (detectedClass && detectedSubject && categories[detectedClass] && categories[detectedClass][detectedSubject]) {
            categories[detectedClass][detectedSubject].push(video);
        } else {
            categories['Other'].push(video);
        }
    });

    return categories;
}

async function main() {
    console.log('🎥 Fetching ALL videos from ilmkidunya YouTube channel...\\n');
    console.log(`Channel ID: ${CHANNEL_ID}\\n`);

    // Step 1: Get uploads playlist
    console.log('Step 1: Getting uploads playlist...');
    const uploadsPlaylistId = await getChannelUploadsPlaylistId(CHANNEL_ID);

    if (!uploadsPlaylistId) {
        console.error('❌ Could not get uploads playlist');
        return;
    }

    console.log(`✅ Found playlist: ${uploadsPlaylistId}\\n`);

    // Step 2: Fetch ALL videos
    console.log('Step 2: Fetching ALL videos (this may take a while)...\\n');
    const videos = await getPlaylistVideos(uploadsPlaylistId);

    console.log(`\\n✅ Fetched ${videos.length} total videos\\n`);

    // Step 3: Categorize videos
    console.log('Step 3: Categorizing videos by class and subject...\\n');
    const categorized = categorizeVideos(videos);

    // Print statistics
    console.log('📊 Video Statistics:\\n');
    let totalCategorized = 0;
    for (const [className, subjects] of Object.entries(categorized)) {
        if (className === 'Other') {
            console.log(`  ${className}: ${subjects.length} videos`);
        } else {
            let classTotal = 0;
            console.log(`  ${className}:`);
            for (const [subject, vids] of Object.entries(subjects)) {
                if (vids.length > 0) {
                    console.log(`    - ${subject}: ${vids.length} videos`);
                    classTotal += vids.length;
                }
            }
            totalCategorized += classTotal;
        }
    }
    console.log(`\\n  Total Categorized: ${totalCategorized} videos`);
    console.log(`  Uncategorized: ${categorized['Other'].length} videos\\n`);

    // Step 4: Save data
    console.log('Step 4: Saving data...\\n');
    const fs = require('fs');
    const path = require('path');

    // Save raw JSON
    const jsonPath = path.join(__dirname, '..', 'ilmkidunya-videos-all.json');
    fs.writeFileSync(jsonPath, JSON.stringify(categorized, null, 2));
    console.log(`✅ Saved raw data to: ${jsonPath}`);

    console.log('\\n🎉 Done! Review the JSON file and integrate videos as needed.');
}

main().catch(console.error);
