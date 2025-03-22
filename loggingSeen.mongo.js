// 📝 Technique Tracking Function
// This script adds a function to record when techniques are seen in class

// Connect to Jiujitsu database
use('Jiujitsu');

// 🔍 Function to find technique across all collections
function findTechnique(techniqueName) {
  const collections = db.getCollectionNames();
  
  for (const collection of collections) {
    // Skip system collections
    if (collection.startsWith('system.')) continue;
    
    // Look for the technique by name or technique field
    const technique = db[collection].findOne({
      $or: [
        { name: { $regex: techniqueName, $options: 'i' } },
        { technique: { $regex: techniqueName, $options: 'i' } }
      ]
    });
    
    if (technique) {
      return { 
        collection: collection,
        technique: technique 
      };
    }
  }
  
  return null;
}

// 📅 Record technique appearance in class
function recordTechniqueSeen(techniqueName, dateString) {
  // Find the technique
  const result = findTechnique(techniqueName);
  
  if (!result) {
    print(`❌ Technique "${techniqueName}" not found in any collection!`);
    return false;
  }
  
  const { collection, technique } = result;
  
  // Parse date or use current date if not provided
  let seenDate;
  if (dateString) {
    seenDate = new Date(dateString);
    if (isNaN(seenDate.getTime())) {
      print(`⚠️ Invalid date format! Using today's date instead.`);
      seenDate = new Date();
    }
  } else {
    seenDate = new Date();
  }
  
  // Initialize seen_dates array if it doesn't exist
  if (!technique.seen_dates) {
    db[collection].updateOne(
      { _id: technique._id },
      { $set: { seen_dates: [] } }
    );
  }
  
  // Add the new date to the seen_dates array
  db[collection].updateOne(
    { _id: technique._id },
    { $push: { seen_dates: seenDate } }
  );
  
  print(`✅ Recorded "${technique.technique || technique.name}" as seen on ${seenDate.toLocaleDateString()}!`);
  
  // Show updated technique with dates
  const updated = db[collection].findOne({ _id: technique._id });
  print(`📊 This technique has been seen ${updated.seen_dates.length} times in class`);
  
  return true;
}

// 📊 Get practice history for a technique
function getTechniqueHistory(techniqueName) {
  const result = findTechnique(techniqueName);
  
  if (!result) {
    print(`❌ Technique "${techniqueName}" not found in any collection!`);
    return false;
  }
  
  const { collection, technique } = result;
  
  print(`\n🥋 History for: ${technique.technique || technique.name}`);
  if (!technique.seen_dates || technique.seen_dates.length === 0) {
    print(`👀 This technique has never been recorded in class!`);
  } else {
    print(`📆 Seen ${technique.seen_dates.length} times in class:`);
    technique.seen_dates.forEach((date, index) => {
      print(`   ${index + 1}. ${new Date(date).toLocaleDateString()}`);
    });
  }
  
  return true;
}


// CHECK WHATS UP HERE 


// 💡 Example usage:
recordTechniqueSeen("Panda Roll", "3/22/2025");
getTechniqueHistory("Panda Roll");

print(`🚀 Technique tracking functions loaded!`);
print(`📋 Available commands:`);
print(`   - recordTechniqueSeen("Technique Name", "MM/DD/YYYY")`);
print(`   - getTechniqueHistory("Technique Name")`);33