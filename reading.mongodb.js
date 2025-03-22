// Jiujitsu Database Explorer
// This script provides a summary of the Jiujitsu database and its collections

// Connect to the Jiujitsu database
use('Jiujitsu');

// Function to display collection information
function exploreCollection(collectionName) {
  print(`\n----- Collection: ${collectionName} -----`);
  
  // Get count of documents
  const count = db[collectionName].count();
  print(`Document count: ${count}`);
  
  if (count === 0) {
    print("Empty collection, no documents to display.");
    return;
  }
  
  // Get a sample document to understand schema
  const sampleDoc = db[collectionName].findOne();
  print("\nSample document structure:");
  printjson(sampleDoc);
  
  // Get all fields used across documents
  const allFields = [];
  const fieldUsage = {};
  
  db[collectionName].find().forEach(doc => {
    Object.keys(doc).forEach(key => {
      if (!allFields.includes(key)) {
        allFields.push(key);
        fieldUsage[key] = 1;
      } else {
        fieldUsage[key]++;
      }
    });
  });
  
  print("\nFields used in this collection:");
  for (const field of allFields) {
    const usage = fieldUsage[field];
    const usagePercent = ((usage / count) * 100).toFixed(2);
    print(`- ${field}: used in ${usage}/${count} documents (${usagePercent}%)`);
  }
}

// Get all collection names in the database
const collections = db.getCollectionNames();
print(`\n=== Jiujitsu Database Summary ===`);
print(`Total collections: ${collections.length}`);
print(`Collection names: ${collections.join(', ')}`);

// Explore each collection
for (const collection of collections) {
  exploreCollection(collection);
}

// Specific queries that might be interesting
print("\n=== Custom Queries ===");

// Get techniques by belt level
function getTechniquesByBelt(belt) {
  const techniques = [];
  
  for (const collection of collections) {
    if (collection === "Checkpoint") continue; // Skip checkpoint collection
    
    const beltTechniques = db[collection].find({ belt: belt }).toArray();
    
    for (const technique of beltTechniques) {
      techniques.push({
        name: technique.name,
        technique: technique.technique,
        category: collection
      });
    }
  }
  
  return techniques;
}

// Show white belt techniques (null or undefined belt level)
const whiteBeltTechniques = getTechniquesByBelt(null);
print(`\nWhite Belt Techniques (${whiteBeltTechniques.length}):`);
whiteBeltTechniques.slice(0, 5).forEach(technique => {
  print(`- ${technique.technique} (${technique.category})`);
});
if (whiteBeltTechniques.length > 5) print(`... and ${whiteBeltTechniques.length - 5} more`);

// Show Yellow belt techniques
const yellowBeltTechniques = getTechniquesByBelt("Yellow");
print(`\nYellow Belt Techniques (${yellowBeltTechniques.length}):`);
yellowBeltTechniques.forEach(technique => {
  print(`- ${technique.technique} (${technique.category})`);
});

// Show Grey belt techniques
const greyBeltTechniques = getTechniquesByBelt("Grey");
print(`\nGrey Belt Techniques (${greyBeltTechniques.length}):`);
greyBeltTechniques.forEach(technique => {
  print(`- ${technique.technique} (${technique.category})`);
});

// Check available positions/checkpoints
print("\nAvailable Positions/Checkpoints:");
try {
  db.Checkpoint.find().forEach(doc => {
    print(`- ${doc.position}: ${doc.description}`);
  });
} catch (e) {
  print("Checkpoint collection not found or empty");
}

print("\n=== End of Database Summary ===")