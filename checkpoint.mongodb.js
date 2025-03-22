// MongoDB script to create individual documents for each checkpoint position
// in the Jiujitsu database

// Switch to the Jiujitsu database (creates it if it doesn't exist)
use('Jiujitsu');

// Drop the collection if it already exists to avoid duplicates
db.Checkpoint.drop();

// Insert each position as a separate document using insertMany()
// Each document will get its own unique _id
db.Checkpoint.insertMany([
  {
    "position": "closed guard",
    "description": "Bottom player has legs wrapped around opponent's waist"
  },
  {
    "position": "half guard",
    "description": "Bottom player has one leg trapped between opponent's legs"
  },
  {
    "position": "open guard",
    "description": "Bottom player does not have a full enclosure on the opponents body"
  },
  {
    "position": "kneeling",
    "description": "One or both players on knees facing each other"
  },
  {
    "position": "turtle",
    "description": "Defensive position with hands and knees on ground, head tucked"
  },
  {
    "position": "mount",
    "description": "Top player sitting on bottom player's torso"
  },
  {
    "position": "side control",
    "description": "Top player controlling from side with chest pressure"
  },
  {
    "position": "north-south",
    "description": "Top player controlling with chest-to-chest pressure, inverted"
  },
  {
    "position": "back control",
    "description": "Controlling opponent from behind"
  }
]);

// Verify insertion by showing all documents with their IDs
print("Documents inserted with unique IDs:");
printjson(db.Checkpoint.find().toArray());