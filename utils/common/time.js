// formatPaperTime.js
// ✅ Converts a total number of minutes into a human-readable string
// Example: 125 → "2 hours 5 minutes"

export default function formatPaperTime(minutesTotal) {
    // Calculate full hours
    const hours = Math.floor(minutesTotal / 60);

    // Calculate remaining minutes
    const minutes = minutesTotal % 60;

    // Return formatted string with correct pluralization
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
}
