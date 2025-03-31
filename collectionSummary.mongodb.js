// Switch to your database
use('Jiujitsu');

// Define collections to analyze
const collections = [
  { name: "Top", nameProperty: "name", displayName: "TOP Technique" },
  { name: "Takedowns", nameProperty: "name", displayName: "Takedowns" },
  
  //{ name: "Bottom", nameProperty: "name", displayName: "Technique" },
 // { name: "Checkpoint", nameProperty: "position", displayName: "Position" }
];

// Define belt levels to analyze - using the standardized naming
const beltLevels = ["WHITE 1", "WHITE 2", "WHITE 3", "GRAY 2", "GRAY 3"];

// Helper function to determine if a technique/position is appropriate for a belt level
function isAppropriateForBeltLevel(item, beltLevel) {
  const itemBelt = item.belt || null;
  
  // For WHITE belt levels: only include items with no belt, WHITE belt, or explicitly marked for white
  if (beltLevel.startsWith("WHITE")) {
    return itemBelt === null || 
           itemBelt === "WHITE" || 
           itemBelt === "white";
  }
  
  // For GRAY belt levels: include WHITE, GRAY, and "Half Grey Half Yellow" items
  if (beltLevel.startsWith("GRAY")) {
    return itemBelt === null || 
           itemBelt === "WHITE" || 
           itemBelt === "white" ||
           itemBelt === "GRAY" || 
           itemBelt === "Grey" || 
           itemBelt === "Gray" ||
           itemBelt === "gray" ||
           itemBelt === "Half Grey Half Yellow" ||
           itemBelt === "Half Gray Half Yellow";
  }
  
  // Default
  return true;
}

// Process each belt level to create a combined report
beltLevels.forEach(beltLevel => {
  print(`\n\n🥋 ${beltLevel} BELT COMBINED REPORT 🥋`);
  print(`======================================================`);
  
  let totalShown = 0;
  let totalNotShown = 0;
  let totalAppropriate = 0;
  
  // Process each collection for this belt level
  collections.forEach(collection => {
    const collectionName = collection.name;
    const nameProperty = collection.nameProperty;
    const displayName = collection.displayName;
    
    print(`\n📊 ${displayName} Report for ${beltLevel} 📊`);
    print(`---------------------------------------------------`);
    
    // Get all items from this collection
    const allItems = db[collectionName].find().toArray();
    const totalCount = allItems.length;
    
    // Filter items appropriate for this belt level
    const appropriateItems = allItems.filter(item => 
      isAppropriateForBeltLevel(item, beltLevel)
    );
    
    // Find items SHOWN to this belt level
    const itemsShownToBelt = db[collectionName].find({
      "seen_by_who.level": beltLevel
    }).sort({ [nameProperty]: 1 }).toArray();
    
    // Filter shown items to only include appropriate ones for this belt level
    const appropriateShownItems = itemsShownToBelt.filter(item => 
      isAppropriateForBeltLevel(item, beltLevel)
    );
    
    const itemsDisplayName = collectionName === "Bottom" ? "techniques" : "positions";
    
    print(`✅ ${appropriateShownItems.length} of ${appropriateItems.length} appropriate ${itemsDisplayName} have been shown to ${beltLevel}:`);
    
    if (appropriateShownItems.length === 0) {
      print(`  No ${itemsDisplayName} have been shown to this belt level yet.`);
    } else {
      appropriateShownItems.forEach(item => {
        const itemName = item[nameProperty];
        const itemTechnique = collectionName === "Bottom" ? (item.technique || "No technique name") : "";
        const displayName = collectionName === "Bottom" ? `${itemName} (${itemTechnique})` : itemName;
        
        print(`- ${displayName}`);
        
        // Filter entries only for this belt level
        const beltEntries = item.seen_by_who.filter(entry => entry.level === beltLevel);
        
        if (beltEntries.length > 0) {
          // Find the most recent date for this belt level
          const dates = beltEntries
            .filter(entry => entry.date)
            .map(entry => new Date(entry.date));
          
          if (dates.length > 0) {
            const mostRecent = new Date(Math.max(...dates.map(d => d.getTime())));
            print(`  Last shown on: ${mostRecent.toISOString().split('T')[0]}`);
            
            // Show total times shown to this belt level
            print(`  Times shown to ${beltLevel}: ${beltEntries.length}`);
          }
        }
      });
    }
    
    // Create an array of item names shown to this belt
    const shownToBeltNames = appropriateShownItems.map(item => item[nameProperty]);
    
    // Find appropriate items NOT shown to this belt level
    const itemsNotShownToBelt = appropriateItems.filter(item => 
      !shownToBeltNames.includes(item[nameProperty])
    );
    
    print(`\n❌ ${itemsNotShownToBelt.length} appropriate ${itemsDisplayName} have NOT been shown to ${beltLevel}:`);
    
    if (itemsNotShownToBelt.length === 0) {
      print(`  All appropriate ${itemsDisplayName} have been shown to this belt level!`);
    } else {
      // Display all not-shown items in a simple list
      itemsNotShownToBelt.forEach(item => {
        const itemName = item[nameProperty];
        const itemTechnique = collectionName === "Bottom" ? (item.technique || "No technique name") : "";
        const displayName = collectionName === "Bottom" ? `${itemName} (${itemTechnique})` : itemName;
        
        print(`  - ${displayName}`);
      });
    }
    
    // Calculate coverage percentage for this belt level
    const beltCoveragePercentage = (appropriateShownItems.length / appropriateItems.length * 100).toFixed(1);
    print(`\n📈 ${beltLevel} ${displayName} COVERAGE: ${beltCoveragePercentage}% (${appropriateShownItems.length}/${appropriateItems.length})`);
    
    // 4. Recently taught items for this belt level
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentlyShownToBelt = appropriateShownItems.filter(item => {
      // Check for recent entries for this belt level
      const beltEntries = item.seen_by_who.filter(entry => {
        const entryDate = entry.date ? new Date(entry.date) : null;
        return entry.level === beltLevel && entryDate && entryDate >= threeMonthsAgo;
      });
      return beltEntries.length > 0;
    });
    
    print(`\n🔄 ${recentlyShownToBelt.length} ${itemsDisplayName} shown to ${beltLevel} in the last 3 months`);
    
    // Update totals for combined metrics
    totalShown += appropriateShownItems.length;
    totalNotShown += itemsNotShownToBelt.length;
    totalAppropriate += appropriateItems.length;
  });
  
  // Combined metrics for this belt level
  const combinedCoveragePercentage = (totalShown / totalAppropriate * 100).toFixed(1);
  print(`\n\n📊 COMBINED METRICS FOR ${beltLevel} 📊`);
  print(`======================================================`);
  print(`Total appropriate items: ${totalAppropriate}`);
  print(`Total items shown: ${totalShown}`);
  print(`Total items not shown: ${totalNotShown}`);
  print(`OVERALL COVERAGE: ${combinedCoveragePercentage}%`);
  print(`======================================================`);
});

// Generate a Cross-Belt Report to show what's missing for each belt level
print(`\n\n📊 CROSS-BELT MISSING ITEMS REPORT 📊`);
print(`======================================================`);

// Create a map to store what's missing for each belt level by collection
const missingByBelt = {};

beltLevels.forEach(beltLevel => {
  missingByBelt[beltLevel] = {};
  
  collections.forEach(collection => {
    const collectionName = collection.name;
    const nameProperty = collection.nameProperty;
    
    // Get all items from this collection
    const allItems = db[collectionName].find().toArray();
    
    // Filter items appropriate for this belt level
    const appropriateItems = allItems.filter(item => 
      isAppropriateForBeltLevel(item, beltLevel)
    );
    
    // Find items SHOWN to this belt level
    const itemsShownToBelt = db[collectionName].find({
      "seen_by_who.level": beltLevel
    }).toArray();
    
    // Create an array of item names shown to this belt
    const shownToBeltNames = itemsShownToBelt.map(item => item[nameProperty]);
    
    // Find appropriate items NOT shown to this belt level
    const itemsNotShownToBelt = appropriateItems.filter(item => 
      !shownToBeltNames.includes(item[nameProperty])
    );
    
    // Store missing items in the map
    missingByBelt[beltLevel][collectionName] = itemsNotShownToBelt.map(item => ({
      name: item[nameProperty],
      technique: item.technique || item.position || item[nameProperty]
    }));
  });
});

// Print missing items report
beltLevels.forEach(beltLevel => {
  print(`\n🥋 ITEMS MISSING FOR ${beltLevel} 🥋`);
  print(`---------------------------------------------------`);
  
  let totalMissing = 0;
  
  collections.forEach(collection => {
    const collectionName = collection.name;
    const displayName = collection.displayName;
    const missing = missingByBelt[beltLevel][collectionName] || [];
    
    totalMissing += missing.length;
    
    print(`\n${displayName}s not shown (${missing.length}):`);
    
    if (missing.length === 0) {
      print(`  All appropriate ${displayName.toLowerCase()}s have been shown!`);
    } else {
      missing.forEach(item => {
        if (collectionName === "Bottom") {
          print(`  - ${item.name} (${item.technique})`);
        } else {
          print(`  - ${item.name}`);
        }
      });
    }
  });
  
  print(`\nTotal items missing for ${beltLevel}: ${totalMissing}`);
});

print(`\n🥋 END OF COMBINED BELT LEVEL REPORT 🥋`);