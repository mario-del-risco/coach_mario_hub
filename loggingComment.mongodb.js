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

// Create new Comments collection if it doesn't exist
if (!db.getCollectionNames().includes("Comments")) {
  db.createCollection("Comments");
  print("Created new Comments collection");
}

// CUSTOMIZE THESE VALUES FOR YOUR NEW COMMENT
const commentData = {
  // Add any fields you want here
  tinyWarriors: "IronMan, ClosedGuard with cone and Diamond Game",
  littleWarriors: {
    "white": "collar, sleeve, pull to close guard and bikiniline, situp sweep, GET TO CLOSED GUARD FROM OPEN",
    "gray": "scissor sweep, armbar from guard(drill), armbar from mount LITTLE GRAPPLING"
  },
  workout: "4 bear 2 duck 2 crab. (10 squats, 10 pushups, 10 situps)x2",
  bigWarriors: {
    "white": "collar, sleeve, pull to close guard and bikiniline(LESS BIKINI LINE EMPHASIS), situp sweep, GET TO CLOSED GUARD FROM OPEN",
    "gray": "scissor sweep, armbar from guard(drill), armbar from mount LITTLE GRAPPLING"
  },
};

// Add yesterday's date to the comment data
commentData.date = yesterdayDate;

// Insert the new comment
const insertResult = db.Comments.insertOne(commentData);

// Print result
if (insertResult.acknowledged) {
  print(`✅ Successfully created new comment with ID: ${insertResult.insertedId}`);
  
  // Display the inserted document
  const insertedDoc = db.Comments.findOne({ _id: insertResult.insertedId });
  print("\nInserted comment:");
  printjson(insertedDoc);
  
  // Count total comments
  const totalComments = db.Comments.countDocuments({});
  print(`\nTotal comments in collection: ${totalComments}`);
} else {
  print("❌ Failed to insert comment");
}