// MongoDB script to generate technique coverage report
// Connect to the Jiujitsu database
use('Jiujitsu');

// Define belt levels
const beltLevels = ['WHITE 1', 'WHITE 2', 'WHITE 3', 'GRAY 1', 'GRAY 2', 'GRAY 3'];

// Create a function to generate report for a specific collection
function generateCollectionReport(collectionName, techniqueField) {
  const collection = db.getCollection(collectionName);
  const totalTechniques = collection.countDocuments();
  
  // Get all techniques
  const allTechniques = collection.find({}, { [techniqueField]: 1, _id: 0 }).toArray()
    .map(item => item[techniqueField]);
  
  // Create a mock "shown" log (simulating data that would come from real tracking)
  // In a real scenario, this would come from a separate collection tracking when techniques were shown
  const mockShownLog = {
    'WHITE 1': ['closed guard'],
    'WHITE 2': ['Guard Recovery', 'Lapelle Sleeve Pull To Closed Guard'],
    'WHITE 3': ['Pendulum Sweep', 'Sit Up Sweep'],
    'GRAY 1': ['Armbar from Guard'],
    'GRAY 2': ['Pendulum Sweep'],
    'GRAY 3': ['Scissor Sweep', 'Sit Up Sweep']
  };
  
  // Create report structure for each belt
  const belts = beltLevels.map(belt => {
    const shownTechniques = mockShownLog[belt] || [];
    
    // Create "shown" array with additional details
    const shown = shownTechniques
      .filter(technique => allTechniques.includes(technique))
      .map(technique => ({
        name: technique,
        lastShown: '2025-03-24',  // Mock date
        timesShown: 1             // Mock count
      }));
    
    // Create "notShown" array with techniques that haven't been shown
    const notShown = allTechniques.filter(technique => !shownTechniques.includes(technique));
    
    // Calculate coverage percentage
    const coverage = totalTechniques > 0 
      ? parseFloat(((shown.length / totalTechniques) * 100).toFixed(1))
      : 0.0;
    
    // Return report object for this belt
    return {
      name: belt,
      [collectionName === 'Checkpoint' ? 'positions' : 'techniques']: {
        shown,
        notShown,
        coverage
      }
    };
  });
  
  // Return full report for this collection
  return {
    total: totalTechniques,
    belts
  };
}

// Generate reports for both collections
const reportData = {
  bottom: generateCollectionReport('Bottom', 'name'),
  checkpoint: generateCollectionReport('Checkpoint', 'position')
};

// Output the report in the exact format requested
print("const reportData = {");
print("  bottom: {");
print(`    total: ${reportData.bottom.total},`);
print("    belts: [");

// Format bottom belts
reportData.bottom.belts.forEach((belt, beltIndex) => {
  print("      {");
  print(`        name: '${belt.name}',`);
  print("        techniques: {");
  
  // Format shown techniques
  print("          shown: [");
  belt.techniques.shown.forEach((tech, techIndex) => {
    const comma = techIndex < belt.techniques.shown.length - 1 ? "," : "";
    print(`            { name: '${tech.name}', lastShown: '${tech.lastShown}', timesShown: ${tech.timesShown} }${comma}`);
  });
  print("          ],");
  
  // Format not shown techniques
  print("          notShown: [");
  belt.techniques.notShown.forEach((tech, techIndex) => {
    const comma = techIndex < belt.techniques.notShown.length - 1 ? "," : "";
    print(`            '${tech}'${comma}`);
  });
  print("          ],");
  
  print(`          coverage: ${belt.techniques.coverage}`);
  print("        }");
  
  const comma = beltIndex < reportData.bottom.belts.length - 1 ? "," : "";
  print(`      }${comma}`);
});

print("    ]");
print("  },");

// Checkpoint section
print("  checkpoint: {");
print(`    total: ${reportData.checkpoint.total},`);
print("    belts: [");

// Format checkpoint belts
reportData.checkpoint.belts.forEach((belt, beltIndex) => {
  print("      {");
  print(`        name: '${belt.name}',`);
  print("        positions: {");
  
  // Format shown positions
  print("          shown: [");
  belt.positions.shown.forEach((pos, posIndex) => {
    const comma = posIndex < belt.positions.shown.length - 1 ? "," : "";
    print(`            { name: '${pos.name}', lastShown: '${pos.lastShown}', timesShown: ${pos.timesShown} }${comma}`);
  });
  print("          ],");
  
  // Format not shown positions
  print("          notShown: [");
  if (belt.positions.notShown.length > 0) {
    // Group notShown positions in sets of 4-5 for readability
    const groups = [];
    for (let i = 0; i < belt.positions.notShown.length; i += 4) {
      groups.push(belt.positions.notShown.slice(i, i + 4));
    }
    
    groups.forEach((group, groupIndex) => {
      const groupStr = group.map(p => `'${p}'`).join(', ');
      const comma = groupIndex < groups.length - 1 ? "," : "";
      print(`            ${groupStr}${comma}`);
    });
  }
  print("          ],");
  
  print(`          coverage: ${belt.positions.coverage}`);
  print("        }");
  
  const comma = beltIndex < reportData.checkpoint.belts.length - 1 ? "," : "";
  print(`      }${comma}`);
});

print("    ]");
print("  }");
print("};");