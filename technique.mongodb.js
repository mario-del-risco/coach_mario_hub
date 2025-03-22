use('Jiujitsu')

db.Technique.drop()

let model = {
    "name": "Here we will put the name",
    "description": "Description of the Technique",
    "keyPoints": ["keypoint1", "keypoint2", "keypoint3", "keypoint4"],
    "commonMistakes": ["commonMistake4", "commonMistake2", "commonMistake3", "commonMistake4"],
    "MeFromCheckpoint" : "The checkpoint where the player starts",
    "MeToCheckpoint": "The checkpoint where the player ends",
    "OpFromCheckpoint" : "The checkpoint where the player's opponent starts",
    "OpToCheckpoint": "The checkpoint where the player's opponent ends",
}

db.Technique.insertMany([
    model
]);