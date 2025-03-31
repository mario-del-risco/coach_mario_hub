// MongoDB script to standardize belt level names in the seen_by_who field for the Checkpoint collection
// Connect to the Jiujitsu database
use('Jiujitsu');

// Function to standardize belt levels according to the mapping rules
function standardizeCheckpointBeltLevels() {
  // First, let's find all documents in the Checkpoint collection that have seen_by_who field
  const documents = db.Checkpoint.find({ "seen_by_who": { $exists: true } }).toArray();
  
  console.log(`Found ${documents.length} documents with seen_by_who field in Checkpoint collection`);
  
  // Process each document
  for (const doc of documents) {
    const originalSeenByWho = [...doc.seen_by_who]; // Create a copy of the original array
    let modifiedSeenByWho = [...doc.seen_by_who]; // Start with a copy that we'll modify
    let modified = false;
    
    // Check and replace entries in the array
    for (const entry of originalSeenByWho) {
      const level = entry.level;
      const date = entry.date;
      
      // Standardize WHITE levels
      if (level === "WHITE TINY") {
        // Replace WHITE TINY with WHITE 1
        modifiedSeenByWho = modifiedSeenByWho.map(item => 
          item.level === "WHITE TINY" ? { ...item, level: "WHITE 1" } : item
        );
        modified = true;
      } 
      else if (level === "WHITE") {
        // Replace WHITE with both WHITE 2 and WHITE 3
        // First remove the original WHITE entry
        modifiedSeenByWho = modifiedSeenByWho.filter(item => 
          !(item.level === "WHITE" && item.date === date)
        );
        
        // Add WHITE 2 and WHITE 3 entries
        modifiedSeenByWho.push({ date: date, level: "WHITE 2" });
        modifiedSeenByWho.push({ date: date, level: "WHITE 3" });
        modified = true;
      }
      
      // Standardize GRAY levels - directly to GRAY 2 and GRAY 3 (skipping GRAY 1)
      else if (level === "GRAY") {
        // Replace GRAY with both GRAY 2 and GRAY 3
        // First remove the original GRAY entry
        modifiedSeenByWho = modifiedSeenByWho.filter(item => 
          !(item.level === "GRAY" && item.date === date)
        );
        
        // Add GRAY 2 and GRAY 3 entries
        modifiedSeenByWho.push({ date: date, level: "GRAY 2" });
        modifiedSeenByWho.push({ date: date, level: "GRAY 3" });
        modified = true;
      }
    }
    
    // Update the document if modifications were made
    if (modified) {
      const updateResult = db.Checkpoint.updateOne(
        { _id: doc._id },
        { $set: { seen_by_who: modifiedSeenByWho } }
      );
      
      console.log(`Updated checkpoint document ${doc._id}, position: ${doc.position || doc.name} - ${updateResult.modifiedCount} document modified`);
    }
  }
}

// Execute the function
standardizeCheckpointBeltLevels();

// Now check if there are any documents with GRAY 1 that need to be fixed
function fixGrayOneLevels() {
  // Find all documents in the Checkpoint collection that have GRAY 1 in seen_by_who
  const documents = db.Checkpoint.find({ "seen_by_who.level": "GRAY 1" }).toArray();
  
  console.log(`Found ${documents.length} documents with GRAY 1 in seen_by_who field`);
  
  // Process each document
  for (const doc of documents) {
    const originalSeenByWho = [...doc.seen_by_who]; // Create a copy of the original array
    let modifiedSeenByWho = [...doc.seen_by_who]; // Start with a copy that we'll modify
    
    // Find all GRAY 1 entries
    const gray1Entries = originalSeenByWho.filter(entry => entry.level === "GRAY 1");
    
    if (gray1Entries.length > 0) {
      // Remove all GRAY 1 entries
      modifiedSeenByWho = modifiedSeenByWho.filter(entry => entry.level !== "GRAY 1");
      
      // Add GRAY 2 and GRAY 3 entries for each original GRAY 1 entry
      for (const entry of gray1Entries) {
        modifiedSeenByWho.push({ date: entry.date, level: "GRAY 2" });
        modifiedSeenByWho.push({ date: entry.date, level: "GRAY 3" });
      }
      
      // Update the document
      const updateResult = db.Checkpoint.updateOne(
        { _id: doc._id },
        { $set: { seen_by_who: modifiedSeenByWho } }
      );
      
      console.log(`Fixed GRAY 1 in document ${doc._id}, position: ${doc.position || doc.name} - ${updateResult.modifiedCount} document modified`);
    }
  }
}

// Execute the GRAY 1 fix function
fixGrayOneLevels();

// Verify the changes - Let's count the different belt levels after standardization
const beltLevelCounts = {};
const documents = db.Checkpoint.find({ "seen_by_who": { $exists: true } }).toArray();

for (const doc of documents) {
  for (const entry of doc.seen_by_who) {
    const level = entry.level;
    beltLevelCounts[level] = (beltLevelCounts[level] || 0) + 1;
  }
}

console.log("Final belt level counts in Checkpoint collection:");
console.log(beltLevelCounts);

// Check that no GRAY 1 remains
const grayOneCount = db.Checkpoint.countDocuments({ "seen_by_who.level": "GRAY 1" });
console.log(`GRAY 1 count after fix: ${grayOneCount} (should be 0)`);