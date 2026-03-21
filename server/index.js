const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParseModule = require('pdf-parse');
const pdfParse = pdfParseModule.default || pdfParseModule;
require('dotenv').config();

const os = require('os');

const app = express();
const PORT = process.env.PORT || 5000;

// Multer config for file uploads (Vercel Serverless uses /tmp)
const uploadDir = path.join(os.tmpdir(), 'suraksha_uploads');
const upload = multer({ 
  dest: uploadDir,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

// Ensure uploads dir exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Prevent server crash on ANY error
process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Rejection:', reason?.message || reason);
});

// Database Connection (non-blocking — server runs even if DB fails)
mongoose.connection.on('error', (err) => {
  console.error('⚠️ MongoDB error:', err.message);
});
mongoose.connection.on('connected', () => {
  console.log('✅ Biometric Node Sync Complete (MongoDB Connected)');
});

mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'surakshaai',
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
}).catch(err => console.error('❌ MongoDB initial connect error:', err.message));

// Models
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    biometrics: {
        lastAssessment: Date,
        riskScore: Number,
        status: { type: String, default: 'Syncing' }
    },
    medications: [{
        name: String,
        dosage: String,
        frequency: String,
        time: String,
        duration: String,
        notes: String,
        isActive: { type: Boolean, default: true },
        takenToday: { type: Boolean, default: false },
        addedAt: { type: Date, default: Date.now }
    }],
    reports: [{
        fileName: String,
        fileType: String,
        analysis: String,
        scannedAt: { type: Date, default: Date.now }
    }],
    appointments: [{
        doctorName: String,
        specialty: String,
        date: String,
        status: { type: String, default: 'Confirmed' }
    }],
    emergencyContacts: [{
        name: String,
        phone: String,
        relation: String
    }]
});

const User = mongoose.model('User', UserSchema);

// ============ Shared AI Prompt ============
const MEDICATION_SYSTEM_PROMPT = `You are a clinical pharmacist AI. Given a medical report or prescription, do TWO things:

1. EXTRACT all medications and return them in a JSON array under "medications" key. Each object should have:
   - "name": medicine name
   - "dosage": dosage like "500mg"
   - "frequency": how often like "Once daily", "Twice daily"
   - "time": suggested time like "08:00 AM", "02:00 PM", "09:00 PM"
   - "duration": how long like "7 days", "30 days", "Ongoing"
   - "notes": special instructions like "Take after food"

2. ANALYZE the report and provide a brief clinical summary under "analysis" key. Include:
   - What condition/diagnosis is being treated
   - Key findings from the report
   - Any important warnings or interactions
   - Overall health assessment from this report

Return ONLY valid JSON with this structure:
{
  "medications": [...],
  "analysis": "Your clinical summary here..."
}

If multiple times per day, create separate entries for each time. If no duration mentioned, use "Ongoing".`;

// ============ USER API ============
app.get('/api/user/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (user) res.json(user);
        else res.status(404).json({ message: 'Patient not found' });
    } catch (err) { res.status(500).json(err); }
});

app.post('/api/user', async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) { user.name = req.body.name || user.name; await user.save(); }
        else { user = new User(req.body); await user.save(); }
        res.json(user);
    } catch (err) { res.status(500).json(err); }
});

app.post('/api/user/:email/appointment', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (user) { user.appointments.push(req.body); await user.save(); res.json(user); }
        else res.status(404).json({ message: 'Patient not found' });
    } catch (err) { res.status(500).json(err); }
});

// ============ MEDICATION API ============
app.get('/api/meds/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        res.json(user ? (user.medications || []) : []);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/meds/:email', async (req, res) => {
    try {
        let user = await User.findOne({ email: req.params.email });
        if (!user) user = new User({ email: req.params.email, name: 'Patient' });
        const newMeds = req.body.medications || [];
        user.medications.push(...newMeds);
        await user.save();
        res.json(user.medications);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/meds/:email/:medId', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (user) {
            const med = user.medications.id(req.params.medId);
            if (med) { med.takenToday = !med.takenToday; await user.save(); res.json(med); }
            else res.status(404).json({ message: 'Medication not found' });
        } else res.status(404).json({ message: 'Patient not found' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/meds/:email/:medId', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (user) { user.medications.pull({ _id: req.params.medId }); await user.save(); res.json({ success: true }); }
        else res.status(404).json({ message: 'Patient not found' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ AI REPORT SCAN (Text) ============
app.post('/api/scan-report', async (req, res) => {
    try {
        const { reportText } = req.body;
        if (!reportText || reportText.trim().length < 10) {
            return res.status(400).json({ error: 'Report text is too short.' });
        }
        const result = await scanWithGroqText(reportText);
        res.json(result);
    } catch (err) {
        console.error('Scan error:', err);
        res.status(500).json({ error: 'Failed to scan report. ' + err.message });
    }
});

// ============ AI REPORT SCAN (File: Image/PDF) ============
app.post('/api/scan-file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

        const filePath = req.file.path;
        const mimeType = req.file.mimetype;
        const originalName = req.file.originalname;

        let result;

        if (mimeType === 'application/pdf') {
            // PDF → Extract text → Send to Groq text model
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);
            const pdfText = pdfData.text;

            if (!pdfText || pdfText.trim().length < 5) {
                // PDF might be image-based, try as image
                result = { medications: [], analysis: 'This PDF appears to be image-based. Please upload it as an image instead, or paste the text manually.' };
            } else {
                result = await scanWithGroqText(pdfText);
            }
        } else if (mimeType.startsWith('image/')) {
            // Image → Convert to base64 → Send to Groq Vision
            const imageBuffer = fs.readFileSync(filePath);
            const base64Image = imageBuffer.toString('base64');
            const dataUrl = `data:${mimeType};base64,${base64Image}`;

            result = await scanWithGroqVision(dataUrl);
        } else {
            // Plain text file
            const textContent = fs.readFileSync(filePath, 'utf-8');
            result = await scanWithGroqText(textContent);
        }

        // Cleanup uploaded file
        fs.unlinkSync(filePath);

        // Save report analysis to user if email provided
        const email = req.body.email;
        if (email && result.analysis) {
            const user = await User.findOne({ email });
            if (user) {
                user.reports.push({
                    fileName: originalName,
                    fileType: mimeType,
                    analysis: result.analysis
                });
                await user.save();
            }
        }

        res.json(result);
    } catch (err) {
        console.error('File scan error:', err);
        // Cleanup on error
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Failed to scan file. ' + err.message });
    }
});

// ============ REPORTS API ============
app.get('/api/reports/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        res.json(user ? (user.reports || []) : []);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ Groq AI Functions ============
async function scanWithGroqText(text) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: MEDICATION_SYSTEM_PROMPT },
                { role: 'user', content: `Extract medications and analyze this medical report:\n\n${text}` }
            ],
            temperature: 0.1,
            max_tokens: 3000
        })
    });
    const data = await response.json();
    return parseAIResponse(data);
}

async function scanWithGroqVision(dataUrl) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.2-90b-vision-preview',
            messages: [
                { role: 'system', content: MEDICATION_SYSTEM_PROMPT },
                { 
                    role: 'user', 
                    content: [
                        { type: 'text', text: 'This is a medical prescription or report image. Extract all medications and provide a clinical analysis.' },
                        { type: 'image_url', image_url: { url: dataUrl } }
                    ]
                }
            ],
            temperature: 0.1,
            max_tokens: 3000
        })
    });
    const data = await response.json();
    return parseAIResponse(data);
}

function parseAIResponse(data) {
    const content = data.choices?.[0]?.message?.content || '{}';
    let medications = [];
    let analysis = '';

    try {
        // Try parsing as full JSON object
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            medications = parsed.medications || [];
            analysis = parsed.analysis || '';
        }
    } catch (e) {
        // Fallback: try to find just the array
        try {
            const arrMatch = content.match(/\[[\s\S]*\]/);
            if (arrMatch) medications = JSON.parse(arrMatch[0]);
        } catch (e2) { /* silent */ }
        analysis = content;
    }

    return { medications, analysis, rawResponse: content };
}

// ============ EMERGENCY CONTACTS API ============
app.get('/api/emergency/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        res.json(user ? (user.emergencyContacts || []) : []);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/emergency/:email', async (req, res) => {
    try {
        let user = await User.findOne({ email: req.params.email });
        if (!user) user = new User({ email: req.params.email, name: 'Patient' });
        
        const contacts = req.body.contacts || [];
        if (contacts.length > 2) {
            return res.status(400).json({ error: 'Maximum 2 emergency contacts allowed.' });
        }
        user.emergencyContacts = contacts;
        await user.save();
        res.json(user.emergencyContacts);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/emergency/:email/:contactId', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (user) {
            user.emergencyContacts.pull({ _id: req.params.contactId });
            await user.save();
            res.json(user.emergencyContacts);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 SurakshaAI Clinical Server Active on Port ${PORT}`);
    });
}

module.exports = app;
