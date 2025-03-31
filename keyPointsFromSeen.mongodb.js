// Switch to your database
use('Jiujitsu');

// Define which collection you want to check
const collectionName = "Bottom"; // Change this to the collection you want to analyze

print(`\n🥋 TECHNIQUE LEARNING SUMMARY FOR "${collectionName}" 🥋`);
print(`======================================================`);

// Find techniques that have been shown to students (only using seen_by_who)
const shownTechniques = db[collectionName].find({
  seen_by_who: { $exists: true, $ne: [] }
}).sort({ name: 1 }).toArray();

if (shownTechniques.length === 0) {
  print(`No techniques have been shown to students in the ${collectionName} collection yet.`);
} else {
  print(`\n📋 SUMMARY OF ${shownTechniques.length} TECHNIQUES THAT HAVE BEEN TAUGHT:`);
  print(`------------------------------------------------------`);
  
  // Create a consolidated learning points summary
  let allKeyPoints = [];
  let allCommonMistakes = [];
  
  // Process each technique
  shownTechniques.forEach((technique, index) => {
    print(`\n${index + 1}. ${technique.technique || technique.name}`);
    
    // Show to whom it was taught and when
    if (technique.seen_by_who && technique.seen_by_who.length > 0) {
      // Get distinct belt levels
      const beltLevels = [...new Set(technique.seen_by_who.map(entry => entry.level))].join(', ');
      print(`   Shown to: ${beltLevels} belt students`);
      
      // Find the most recent date shown
      const dates = technique.seen_by_who
        .filter(entry => entry.date)
        .map(entry => entry.date);
      
      if (dates.length > 0) {
        const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
        print(`   Last shown on: ${latestDate.toISOString().split('T')[0]}`);
      }
    }
    
    // Key Points
    print(`   📌 KEY POINTS:`);
    if (technique.key_points && technique.key_points.length > 0) {
      technique.key_points.forEach(point => {
        print(`     • ${point}`);
        allKeyPoints.push(point);
      });
    } else {
      print(`     • No key points recorded`);
    }
    
    // Common Mistakes
    print(`   ⚠️ COMMON MISTAKES:`);
    if (technique.common_mistakes && technique.common_mistakes.length > 0) {
      technique.common_mistakes.forEach(mistake => {
        print(`     • ${mistake}`);
        allCommonMistakes.push(mistake);
      });
    } else {
      print(`     • No common mistakes recorded`);
    }
  });
  
  // Find most frequent key points
  print(`\n🔑 MOST EMPHASIZED KEY POINTS ACROSS ALL TECHNIQUES:`);
  print(`------------------------------------------------------`);
  
  const keyPointFrequency = {};
  allKeyPoints.forEach(point => {
    const lowercasePoint = point.toLowerCase();
    keyPointFrequency[lowercasePoint] = (keyPointFrequency[lowercasePoint] || 0) + 1;
  });
  
  // Sort by frequency
  const sortedKeyPoints = Object.entries(keyPointFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10
  
  sortedKeyPoints.forEach(([point, count]) => {
    print(`• ${point} (mentioned in ${count} techniques)`);
  });
  
  // Find most frequent mistakes
  print(`\n⚠️ MOST COMMON MISTAKES ACROSS ALL TECHNIQUES:`);
  print(`------------------------------------------------------`);
  
  const mistakeFrequency = {};
  allCommonMistakes.forEach(mistake => {
    const lowercaseMistake = mistake.toLowerCase();
    mistakeFrequency[lowercaseMistake] = (mistakeFrequency[lowercaseMistake] || 0) + 1;
  });
  
  // Sort by frequency
  const sortedMistakes = Object.entries(mistakeFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10
  
  sortedMistakes.forEach(([mistake, count]) => {
    print(`• ${mistake} (mentioned in ${count} techniques)`);
  });
  
  // Learning themes identification
  print(`\n🔍 KEY LEARNING THEMES:`);
  print(`------------------------------------------------------`);
  
  // Look for keywords in key points
  const keyThemes = {
    "posture": 0,
    "control": 0,
    "grip": 0,
    "hip": 0,
    "angle": 0,
    "pressure": 0,
    "timing": 0,
    "balance": 0,
    "leverage": 0,
    "movement": 0
  };
  
  // Count theme occurrences
  allKeyPoints.forEach(point => {
    const lowercasePoint = point.toLowerCase();
    Object.keys(keyThemes).forEach(theme => {
      if (lowercasePoint.includes(theme)) {
        keyThemes[theme]++;
      }
    });
  });
  
  // Sort themes by frequency
  const sortedThemes = Object.entries(keyThemes)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count > 0);
  
  sortedThemes.forEach(([theme, count]) => {
    print(`• ${theme.charAt(0).toUpperCase() + theme.slice(1)}: mentioned ${count} times across key points`);
  });
  
  print(`\n🥋 END OF LEARNING SUMMARY 🥋`);
}