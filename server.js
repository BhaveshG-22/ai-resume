const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const ResumeAIGenerator = require('./layer1_ai_generation');
const HTMLGenerator = require('./layer2_html_generation');
const { generatePDF } = require('./generatePDF');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// Default template if not provided
const DEFAULT_TEMPLATE = `Typography

Font Family: Inter (sans-serif) for body text, maintaining a clean, modern look
Font Weights: Uses 400 (regular), 500 (medium), and 700 (bold) for hierarchy
Font Sizes: Small and compact (0.75rem base) for maximizing content on the page
Letter Spacing: Increased spacing on the name (2px) and section headers (1px) for emphasis

Color Scheme

Primary Text: Black (#000000) for maximum readability
Accent Color: Red (#D32F2F) for the tagline and section headers
Secondary Text: Gray (#555, #717885) for dates, descriptions, and footer
Borders: Black and light gray (#D7DCE4) for structure

Layout & Structure

Margins: Generous side margins (2.5rem) creating white space
Grid-based Skills: Clean alignment using CSS grid for skill categories
Flexbox Headers: Job titles and dates aligned using flex layout
Clear Hierarchy: Bold section headers with bottom borders separate content areas

Visual Elements

Heavy Border: 3px black border under the header for strong visual anchor
Section Dividers: 2px borders under section headers (red color)
Subtle Lines: 1px borders for footer separation
Minimal Decoration: Clean, professional aesthetic without excessive styling

Content Organization

Left-aligned: All text aligned left for easy reading
Bullet Points: Standard list formatting with appropriate spacing
Consistent Spacing: Uniform margins between sections and list items
Job Format: Title and duration on same line with space-between alignment

Overall Style

Minimalist: Focus on content over decoration
Professional: Corporate-appropriate color scheme and layout
Scannable: Clear headers and white space for quick reading
Compact: Efficient use of space to fit comprehensive information`;

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: '3-Layer AI Resume Generator API',
        layers: ['AI Content Generation', 'HTML Generation', 'PDF Conversion']
    });
});

// Main endpoint: Generate resume with SSE progress
app.post('/api/generate-resume', async (req, res) => {
    console.log('\n🚀 New resume generation request received');

    const startTime = Date.now();

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendProgress = (stage, message, progress) => {
        res.write(`data: ${JSON.stringify({ stage, message, progress })}\n\n`);
    };

    try {
        const {
            jobDescription,
            userExperience,
            template,
            provider,
            pdfFilename
        } = req.body;

        // Validation
        if (!jobDescription || !userExperience) {
            sendProgress('error', 'Missing required fields', 0);
            res.write(`data: ${JSON.stringify({ success: false, error: 'Missing required fields' })}\n\n`);
            return res.end();
        }

        const templateText = template || DEFAULT_TEMPLATE;
        const aiProvider = provider || process.env.AI_PROVIDER || 'anthropic';
        const filename = pdfFilename || 'resume.pdf';

        console.log(`   Provider: ${aiProvider}`);
        console.log(`   Job description length: ${jobDescription.length} chars`);
        console.log(`   Experience length: ${userExperience.length} chars`);

        sendProgress('init', 'Initializing resume generation...', 0);

        // Generate unique session ID for temp files
        const sessionId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const tempDir = path.join(__dirname, 'temp', sessionId);
        await fs.mkdir(tempDir, { recursive: true });

        // LAYER 1: AI Content Generation
        sendProgress('layer1', '🤖 Layer 1: Analyzing job description and tailoring content...', 10);
        console.log('\n🤖 Layer 1: AI Content Generation');
        const aiGenerator = new ResumeAIGenerator({ provider: aiProvider });

        // Create prompt directly instead of using files
        sendProgress('layer1', 'Reading job requirements and extracting keywords...', 15);
        const layer1Prompt = aiGenerator.createPrompt(
            jobDescription,
            userExperience,
            await fs.readFile(path.join(__dirname, 'required_format.json'), 'utf8')
        );

        sendProgress('layer1', 'Sending to AI for content generation (this may take 20-30 seconds)...', 20);
        const aiResponse = await aiGenerator.callAI(layer1Prompt);

        sendProgress('layer1', 'Parsing and validating AI response...', 45);
        const tailoredContent = aiGenerator.parseAndValidateJSON(aiResponse);

        // Save to temp file for reference
        const jsonPath = path.join(tempDir, 'tailored_content.json');
        await fs.writeFile(jsonPath, JSON.stringify(tailoredContent, null, 2));
        console.log('   ✓ Content generated and tailored');
        sendProgress('layer1', '✓ Content tailored successfully!', 50);

        // LAYER 2: HTML Generation
        sendProgress('layer2', '🎨 Layer 2: Generating HTML with professional styling...', 55);
        console.log('\n🎨 Layer 2: HTML Generation');
        const htmlGenerator = new HTMLGenerator({ provider: aiProvider });

        sendProgress('layer2', 'Applying template and formatting rules...', 60);
        const layer2Prompt = htmlGenerator.createPrompt(tailoredContent, templateText);

        sendProgress('layer2', 'Sending to AI for HTML generation (this may take 15-20 seconds)...', 65);
        const htmlResponse = await htmlGenerator.callAI(layer2Prompt);

        sendProgress('layer2', 'Cleaning and validating HTML...', 80);
        const cleanedHTML = htmlGenerator.cleanHTML(htmlResponse);

        // Save to temp file
        const htmlPath = path.join(tempDir, 'resume.html');
        await fs.writeFile(htmlPath, cleanedHTML);
        console.log('   ✓ HTML generated');
        sendProgress('layer2', '✓ HTML formatted successfully!', 85);

        // LAYER 3: PDF Generation
        sendProgress('layer3', '📄 Layer 3: Converting HTML to PDF...', 90);
        console.log('\n📄 Layer 3: PDF Conversion');

        sendProgress('layer3', 'Rendering HTML with Chrome engine...', 92);
        const pdfResult = await generatePDF(htmlPath, {
            filename: filename,
            inline: false,
            options: {
                printBackground: true
            }
        });
        console.log('   ✓ PDF generated');
        sendProgress('layer3', '✓ PDF generated successfully!', 95);

        // Clean up temp files
        sendProgress('cleanup', 'Cleaning up temporary files...', 97);
        try {
            await fs.rm(tempDir, { recursive: true });
            console.log('   ✓ Temp files cleaned');
        } catch (cleanupError) {
            console.warn('   ⚠ Failed to clean temp files:', cleanupError.message);
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        // Success response
        sendProgress('complete', '✅ Resume generation complete!', 100);

        const response = {
            success: true,
            data: {
                pdfUrl: pdfResult.FileUrl,
                pdfSize: pdfResult.MbOut,
                cost: pdfResult.Cost,
                responseId: pdfResult.ResponseId,
                duration: `${duration}s`,
                filename: filename,
                tailoredContent: tailoredContent
            }
        };

        console.log(`\n✅ Resume generated successfully in ${duration}s`);
        console.log(`   PDF URL: ${pdfResult.FileUrl}\n`);

        // Send final result
        res.write(`data: ${JSON.stringify(response)}\n\n`);
        res.end();

    } catch (error) {
        console.error('\n❌ Error generating resume:', error.message);

        sendProgress('error', `Error: ${error.message}`, 0);
        res.write(`data: ${JSON.stringify({
            success: false,
            error: error.message,
            details: 'Failed to generate resume. Please check your inputs and API keys.'
        })}\n\n`);
        res.end();
    }
});

// Endpoint: Layer 1 only (for testing)
app.post('/api/layer1-only', async (req, res) => {
    try {
        const { jobDescription, userExperience, provider } = req.body;

        if (!jobDescription || !userExperience) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const aiProvider = provider || process.env.AI_PROVIDER || 'anthropic';
        const aiGenerator = new ResumeAIGenerator({ provider: aiProvider });

        const prompt = aiGenerator.createPrompt(
            jobDescription,
            userExperience,
            await fs.readFile(path.join(__dirname, 'required_format.json'), 'utf8')
        );

        const aiResponse = await aiGenerator.callAI(prompt);
        const tailoredContent = aiGenerator.parseAndValidateJSON(aiResponse);

        res.json({
            success: true,
            data: tailoredContent
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// PDF Download Proxy - Serves PDF with correct filename
app.get('/api/download-pdf/:responseId/:filename', async (req, res) => {
    try {
        const { responseId, filename } = req.params;
        const pdfUrl = `https://storage.googleapis.com/a2p-v2-storage/${responseId}`;

        console.log(`\n📥 Proxying PDF download: ${filename}`);
        console.log(`   Source: ${pdfUrl}`);

        // Fetch PDF from Google Cloud Storage
        const https = require('https');
        const http = require('http');
        const urlModule = require('url');

        const parsedUrl = urlModule.parse(pdfUrl);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        protocol.get(pdfUrl, (pdfResponse) => {
            if (pdfResponse.statusCode !== 200) {
                return res.status(404).json({ error: 'PDF not found or expired' });
            }

            // Set headers for download with custom filename
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            // Pipe PDF data to response
            pdfResponse.pipe(res);

            console.log(`   ✓ PDF download started: ${filename}`);
        }).on('error', (err) => {
            console.error(`   ✗ PDF download error:`, err.message);
            res.status(500).json({ error: 'Failed to download PDF' });
        });

    } catch (error) {
        console.error('PDF proxy error:', error.message);
        res.status(500).json({ error: 'Failed to proxy PDF download' });
    }
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║        AI Resume Generator - Web Server                       ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/api/generate-resume`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log('\n✨ Ready to generate resumes!\n');
});

module.exports = app;
