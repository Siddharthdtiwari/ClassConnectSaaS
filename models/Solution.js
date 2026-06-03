const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    board: { type: String, trim: true }, // e.g., CBSE, ICSE, State Board
    classLevel: { type: String, trim: true }, // e.g., 10, 11, 12
    subject: { type: String, required: true, trim: true },
    chapter: { type: String, trim: true },
    youtubeLink: { type: String, trim: true },
    
    // Format Type
    formatType: { 
      type: String, 
      required: true, 
      enum: ["PDF", "DriveLink", "HTML"],
      default: "PDF"
    },
    
    // Storage Fields
    pdfUrl: { type: String }, // Direct path to the uploaded PDF file
    driveLink: { type: String },
    htmlContent: { type: String }, // For generated/typed solutions

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Indexes for faster searching on the frontend
// Compound index matches the actual public query shape (isActive + optional filters)
solutionSchema.index({ isActive: 1, board: 1, classLevel: 1, subject: 1 });
solutionSchema.index({ createdAt: -1 });
solutionSchema.index({ title: 'text' });

module.exports = mongoose.model('Solution', solutionSchema);
