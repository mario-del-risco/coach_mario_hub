// Jiu-Jitsu Training Visibility Report Generator
// This script generates a PDF report of training visibility

// Requires PDFKit and fs modules
// Install with: npm install pdfkit fs

// Convert to ES modules syntax
import PDFDocument from 'pdfkit';
import fs from 'fs';
import { reportData } from './03262025.js';

// Create a document
const doc = new PDFDocument({
  size: 'A4',
  margin: 50,
  info: {
    Title: 'Jiu-Jitsu Training Visibility Report',
    Author: 'Jiu-Jitsu Academy',
  }
});

// Pipe the PDF to a file
doc.pipe(fs.createWriteStream('jiujitsu-visibility-report.pdf'));

// Reorganize data by belt
function reorganizeByBelt() {
  const beltReports = {};
  
  // Process bottom techniques
  reportData.bottom.belts.forEach(belt => {
    if (!beltReports[belt.name]) {
      beltReports[belt.name] = {
        name: belt.name,
        bottom: belt.techniques,
        checkpoint: null
      };
    } else {
      beltReports[belt.name].bottom = belt.techniques;
    }
  });
  
  // Process checkpoint positions
  reportData.checkpoint.belts.forEach(belt => {
    if (!beltReports[belt.name]) {
      beltReports[belt.name] = {
        name: belt.name,
        bottom: null,
        checkpoint: belt.positions
      };
    } else {
      beltReports[belt.name].checkpoint = belt.positions;
    }
  });
  
  return Object.values(beltReports);
}

// Colors - softer palette
const colors = {
  shownBg: '#EFF6FF',       // Very light blue
  shownText: '#2563EB',     // Softer blue
  notShownBg: '#FEF2F2',    // Very light red
  notShownText: '#DC2626',  // Softer red
  goodBadge: '#BFDBFE',     // Light blue
  badBadge: '#FCA5A5',      // Light red
  badgeText: '#1E3A8A',     // Dark blue text for all badges
  title: '#1F2937',         // Dark gray for titles
  text: '#4B5563',          // Medium gray for text
  lightText: '#9CA3AF',     // Light gray for subtle text
  divider: '#E5E7EB'        // Light gray for dividers
};

// Helper function to draw a colored badge
function drawBadge(text, isGood) {
  const currentY = doc.y;
  const badgeWidth = doc.widthOfString(text) + 20;
  const badgeHeight = 20;
  
  doc.roundedRect(doc.x, currentY, badgeWidth, badgeHeight, 5)
     .fill(isGood ? colors.goodBadge : colors.badBadge);
  
  doc.fillColor(colors.badgeText)
     .fontSize(10)
     .text(text, doc.x + 10, currentY + 5, {
       width: badgeWidth - 20,
       align: 'center'
     });
     
  doc.moveDown();
  return doc.y;
}

// Function to draw a two-column section with aligned items
function drawTwoColumnSection(leftTitle, rightTitle, leftItems, rightItems) {
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidth = pageWidth / 2 - 10;
  const leftColX = doc.page.margins.left;
  const rightColX = doc.page.margins.left + colWidth + 20;
  
  // Save starting Y position
  const startY = doc.y;
  
  // Draw column headers
  doc.x = leftColX;
  doc.font('Helvetica-Bold')
     .fontSize(12)
     .fillColor(colors.shownText)
     .text(leftTitle, { continued: false });

  doc.x = rightColX;
  doc.y = startY;
  doc.fillColor(colors.notShownText)
     .text(rightTitle, { continued: false });
  
  // Prepare arrays of item texts with their format info
  const leftTexts = leftItems.map(item => ({
    text: typeof item === 'string' ? item : `${item.name} (Last: ${item.lastShown})`,
    bg: colors.shownBg,
    color: colors.shownText
  }));
  
  const rightTexts = rightItems.map(item => ({
    text: typeof item === 'string' ? item : `${item.name} (Last: ${item.lastShown})`,
    bg: colors.notShownBg,
    color: colors.notShownText
  }));
  
  // Handle empty arrays
  if (leftTexts.length === 0) {
    leftTexts.push({
      text: 'No techniques shown',
      bg: null,
      color: colors.lightText,
      isItalic: true
    });
  }
  
  if (rightTexts.length === 0) {
    rightTexts.push({
      text: 'No techniques not shown',
      bg: null,
      color: colors.lightText,
      isItalic: true
    });
  }
  
  // Find the longer array to determine how many rows to draw
  const maxRows = Math.max(leftTexts.length, rightTexts.length);
  
  // Move past the headers
  doc.moveDown(0.5);
  const itemStartY = doc.y;
  
  // Draw items in rows to ensure alignment
  for (let i = 0; i < maxRows; i++) {
    const currentY = itemStartY + (i * 25); // 25 points per row
    
    // Draw left item if it exists
    if (i < leftTexts.length) {
      const item = leftTexts[i];
      doc.y = currentY;
      doc.x = leftColX;
      
      if (item.bg) {
        const textWidth = Math.min(colWidth, doc.widthOfString(item.text) + 20);
        doc.roundedRect(leftColX, currentY, textWidth, 20, 3)
           .fill(item.bg);
      }
      
      if (item.isItalic) {
        doc.font('Helvetica-Oblique');
      } else {
        doc.font('Helvetica');
      }
      
      doc.fillColor(item.color)
         .fontSize(10)
         .text(item.text, leftColX + 10, currentY + 5, {
           width: colWidth - 20
         });
    }
    
    // Draw right item if it exists
    if (i < rightTexts.length) {
      const item = rightTexts[i];
      doc.y = currentY;
      doc.x = rightColX;
      
      if (item.bg) {
        const textWidth = Math.min(colWidth, doc.widthOfString(item.text) + 20);
        doc.roundedRect(rightColX, currentY, textWidth, 20, 3)
           .fill(item.bg);
      }
      
      if (item.isItalic) {
        doc.font('Helvetica-Oblique');
      } else {
        doc.font('Helvetica');
      }
      
      doc.fillColor(item.color)
         .fontSize(10)
         .text(item.text, rightColX + 10, currentY + 5, {
           width: colWidth - 20
         });
    }
  }
  
  // Set position after drawing all items
  doc.x = leftColX;
  doc.y = itemStartY + (maxRows * 25) + 10;
}

// Function to draw a subsection (techniques or positions)
function drawSubsection(title, data) {
  if (!data) return; // Skip if no data
  
  // Subsection title
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor(colors.title)
     .text(title);
  
  doc.moveDown(0.5);
  
  // Draw content in two columns
  const leftTitle = 'Shown';
  const rightTitle = 'Not Shown';
  
  drawTwoColumnSection(leftTitle, rightTitle, data.shown, data.notShown);
  
  // Coverage
  doc.fontSize(11)
     .font('Helvetica')
     .fillColor(colors.text)
     .text('Coverage:', { continued: true });
  
  doc.text('   ');
  
  // Draw the badge next to the text
  doc.x = doc.x + 10;
  drawBadge(`${data.coverage}%`, data.coverage >= 50);
  
  doc.moveDown(0.5);
}

// Function to draw a full belt section including both data types
function drawBeltSection(beltData) {
  // Check if we need a new page - give enough space for both subsections
  if (doc.y > 600) {
    doc.addPage();
  }
  
  // Belt title
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor(colors.title)
     .text(`${beltData.name} BELT REPORT`);
  
  doc.moveDown(0.5);

  // Draw horizontal divider
  doc.strokeColor(colors.divider)
     .lineWidth(1)
     .moveTo(doc.page.margins.left, doc.y)
     .lineTo(doc.page.width - doc.page.margins.right, doc.y)
     .stroke();
  
  doc.moveDown(1);
  
  // Techniques subsection
  drawSubsection('Bottom Techniques', beltData.bottom);
  
  doc.moveDown(1);
  
  // Positions subsection
  drawSubsection('Checkpoint Positions', beltData.checkpoint);
  
  doc.moveDown(1.5);
}

// Draw document title
doc.fontSize(20)
   .font('Helvetica-Bold')
   .fillColor(colors.title)
   .text('Jiu-Jitsu Training Visibility Report', {
     align: 'center'
   });

doc.moveDown(1);

// Draw document summary
doc.fontSize(12)
   .font('Helvetica')
   .fillColor(colors.text)
   .text(`Total techniques: ${reportData.bottom.total} | Total positions: ${reportData.checkpoint.total}`, {
     align: 'center'
   });

doc.moveDown(2);

// Reorganize data by belt
const beltReports = reorganizeByBelt();

// Draw each belt section
beltReports.forEach((beltData, index) => {
  drawBeltSection(beltData);
  
  // Add a page break after each belt except the last one
  if (index < beltReports.length - 1) {
    doc.addPage();
  }
});

// Add footer with date
const date = new Date().toLocaleDateString();
doc.fontSize(8)
   .font('Helvetica')
   .fillColor(colors.lightText)
   .text(`Generated on ${date}`, {
     align: 'center'
   });

// Finalize the PDF
doc.end();

console.log('PDF report has been generated: jiujitsu-visibility-report.pdf');