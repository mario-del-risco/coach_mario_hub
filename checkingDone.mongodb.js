// Switch to your database
use('Jiujitsu');

// Get all collection names
const collections = db.getCollectionNames();

// Initialize results object
let results = {};

// Loop through each collection
collections.forEach(collectionName => {
  // Query for documents with a date_seen field
  const documentsWithDateSeen = db[collectionName].find(
    { date_seen: { $exists: true } }
  ).toArray();
  
  // If documents found, add to results
  if (documentsWithDateSeen.length > 0) {
    results[collectionName] = documentsWithDateSeen;
    print(`\nFound ${documentsWithDateSeen.length} documents with 'date_seen' in ${collectionName}:`);
    
    // Print details for each document
    documentsWithDateSeen.forEach(doc => {
      // Use technique or name field as identifier, depending on the collection schema
      const movementName = doc.technique || doc.name || "Unknown movement";
      print(`  - ${movementName}: date_seen = ${doc.date_seen}`);
    });
  }
});

// Output summary
print("\n=== SUMMARY ===");
const collectionsWithDateSeen = Object.keys(results);

if (collectionsWithDateSeen.length === 0) {
  print("No documents with 'date_seen' field found in any collection.");
} else {
  print(`Found documents with 'date_seen' field in ${collectionsWithDateSeen.length} collections:`);
  collectionsWithDateSeen.forEach(collection => {
    print(`- ${collection}: ${results[collection].length} documents`);
  });
}