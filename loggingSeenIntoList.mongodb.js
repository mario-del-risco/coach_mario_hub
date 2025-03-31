// Switch to your database
use('Jiujitsu');

// Function to calculate yesterday's date in ISODate format
function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  // Reset time to midnight
  yesterday.setHours(0, 0, 0, 0);
  return yesterday;
}

// Get yesterday's date
const yesterdayDate = getYesterdayDate();
print(`Yesterday's date: ${yesterdayDate.toISOString()}`);

// Define parameters - MODIFY THESE VALUES
const collectionName = "Bottom"; // Change to your desired collection
const documentQuery = { name: "Armbar from Guard" }; // Change to match the document you want to update
const beltLevel = "GRAY 3"; // Change to either "WHITE" or "GRAY"

// Create visibility entry object with date and belt level
const visibilityEntry = {
  date: yesterdayDate,
  level: beltLevel
};

// Check if the document exists
const existingDoc = db[collectionName].findOne(documentQuery);

if (existingDoc) {
  let dateUpdateOperation, levelUpdateOperation;
  
  // Handle date_seen array
  if (existingDoc.date_seen && Array.isArray(existingDoc.date_seen)) {
    // If date_seen exists as an array, push the new date
    dateUpdateOperation = { $push: { date_seen: yesterdayDate } };
    print("Found existing date_seen array, adding new date to it.");
  } else {
    // If date_seen doesn't exist or isn't an array, set it as a new array with one date
    dateUpdateOperation = { $set: { date_seen: [yesterdayDate] } };
    print("Creating new date_seen array with yesterday's date.");
  }
  
  // Handle seen_by_who array
  if (existingDoc.seen_by_who && Array.isArray(existingDoc.seen_by_who)) {
    // If seen_by_who exists as an array, push the new entry
    levelUpdateOperation = { $push: { seen_by_who: visibilityEntry } };
    print("Found existing seen_by_who array, adding new entry to it.");
  } else {
    // If seen_by_who doesn't exist or isn't an array, set it as a new array with one entry
    levelUpdateOperation = { $set: { seen_by_who: [visibilityEntry] } };
    print("Creating new seen_by_who array with new entry.");
  }
  
  // Combine the update operations
  const updateOperation = {
    ...dateUpdateOperation,
    ...levelUpdateOperation
  };
  
  // Perform the update
  const updateResult = db[collectionName].updateOne(
    documentQuery,
    updateOperation
  );
  
  // Print result
  if (updateResult.modifiedCount > 0) {
    print(`✅ Successfully updated visibility information for ${documentQuery.name} in ${collectionName} collection.`);
    
    // Display the updated document
    const updatedDoc = db[collectionName].findOne(documentQuery);
    print("\nUpdated document:");
    printjson(updatedDoc);
  } else {
    print(`⚠️ Document matched but not modified. The information might already be in the arrays.`);
    
    // Check if date is already in the array to provide better feedback
    if (existingDoc.date_seen && existingDoc.date_seen.some(date => 
        date.getFullYear() === yesterdayDate.getFullYear() &&
        date.getMonth() === yesterdayDate.getMonth() &&
        date.getDate() === yesterdayDate.getDate())) {
      print("Yesterday's date is already in the date_seen array.");
    }
  }
} else {
  print(`❌ No document matched the query: ${JSON.stringify(documentQuery)}`);
  print("Please check your collection name and query criteria.");
  
  // Help by showing available documents
  print("\nAvailable documents in this collection:");
  db[collectionName].find({}, { name: 1, technique: 1 }).limit(5).forEach(doc => {
    printjson(doc);
  });
}