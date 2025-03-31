// Switch to your database
use('Jiujitsu');

// Function to calculate a specific date in ISODate format
function getDate(daysAgo = 1) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  // Reset time to midnight
  date.setHours(0, 0, 0, 0);
  return date;
}

// Get yesterday's date by default
const defaultDate = getDate(1);
print(`Default date (yesterday): ${defaultDate.toISOString()}`);

// Define your batch updates in JSON format
// This makes it easy to add multiple techniques at once
const batchUpdates = [
  // Format: {collection, documentName, beltLevels, customDate}
  // Example 1: Simple update with a single belt level
  {
    collection: "Bottom",
    documentName: "Armbar from Guard",
    beltLevels: ["GRAY 3"]
  },
  
  // Example 2: Multiple belt levels
  {
    collection: "Top",
    documentName: "Mount Control", 
    beltLevels: ["WHITE 1", "WHITE 2", "WHITE 3"],
    // Optional: You can specify a custom date (days ago)
    daysAgo: 2
  },
  
  // Example 3: Using documentQuery instead of name
  {
    collection: "Checkpoint",
    documentQuery: { position: "closed guard" },
    beltLevels: ["WHITE 1", "GRAY 2"]
  },
  
  // Add more batches as needed
  // {
  //   collection: "Takedowns",
  //   documentName: "Double Leg Takedown", 
  //   beltLevels: ["WHITE 3", "GRAY 2"]
  // }
];

// Process each batch update
let successCount = 0;
let failureCount = 0;

print("\n🔄 Starting batch processing...");
print("==================================");

batchUpdates.forEach((batch, index) => {
  print(`\nProcessing batch #${index + 1}:`);
  
  // Get the date for this batch
  const batchDate = batch.daysAgo ? getDate(batch.daysAgo) : defaultDate;
  
  // Determine how to query for the document
  let documentQuery;
  if (batch.documentQuery) {
    documentQuery = batch.documentQuery;
  } else if (batch.documentName) {
    documentQuery = { name: batch.documentName };
  } else {
    print(`❌ Batch #${index + 1} missing documentName or documentQuery!`);
    failureCount++;
    return;
  }
  
  print(`Collection: ${batch.collection}`);
  print(`Document query: ${JSON.stringify(documentQuery)}`);
  print(`Belt levels: ${batch.beltLevels.join(", ")}`);
  print(`Date: ${batchDate.toISOString()}`);
  
  // Check if the document exists
  const existingDoc = db[batch.collection].findOne(documentQuery);
  
  if (existingDoc) {
    let dateUpdateOperation, levelUpdateOperation;
    const docName = existingDoc.name || existingDoc.position || existingDoc.technique || "Unknown";
    
    // Handle date_seen array
    if (existingDoc.date_seen && Array.isArray(existingDoc.date_seen)) {
      dateUpdateOperation = { $push: { date_seen: batchDate } };
    } else {
      dateUpdateOperation = { $set: { date_seen: [batchDate] } };
    }
    
    // Create visibility entries for each belt level
    const visibilityEntries = batch.beltLevels.map(level => ({
      date: batchDate,
      level: level
    }));
    
    // Handle seen_by_who array
    if (existingDoc.seen_by_who && Array.isArray(existingDoc.seen_by_who)) {
      levelUpdateOperation = { $push: { seen_by_who: { $each: visibilityEntries } } };
    } else {
      levelUpdateOperation = { $set: { seen_by_who: visibilityEntries } };
    }
    
    // Combine the update operations
    const updateOperation = {
      ...dateUpdateOperation,
      ...levelUpdateOperation
    };
    
    // Perform the update
    const updateResult = db[batch.collection].updateOne(
      documentQuery,
      updateOperation
    );
    
    // Print result
    if (updateResult.modifiedCount > 0) {
      print(`✅ Successfully updated ${docName} in ${batch.collection} for ${batch.beltLevels.length} belt level(s)`);
      successCount++;
    } else {
      print(`⚠️ Document matched but not modified. Check for duplicate entries.`);
      failureCount++;
    }
  } else {
    print(`❌ No document matched the query in ${batch.collection}`);
    
    // Help by showing available documents
    print("Available documents in this collection (sample):");
    db[batch.collection].find({}, { name: 1, technique: 1, position: 1 }).limit(3).forEach(doc => {
      printjson(doc);
    });
    
    failureCount++;
  }
});

// Print summary
print("\n=== SUMMARY ===");
print(`Total batches: ${batchUpdates.length}`);
print(`Successful updates: ${successCount}`);
print(`Failed updates: ${failureCount}`);

// INSTRUCTIONS:
// 1. Customize the batchUpdates array with your techniques
// 2. Run this script to process all updates at once
// 3. Verify the results in your database
