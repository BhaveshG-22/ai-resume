const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Layer 2: HTML Generation
 * Takes JSON data from Layer 1 and generates formatted HTML using AI
 */

class HTMLGenerator {
    constructor(options = {}) {
        this.provider = options.provider || process.env.AI_PROVIDER || 'anthropic';
        this.model = options.model || this.getDefaultModel();
        this.initializeClient();
    }

    getDefaultModel() {
        // Using latest available models
        return this.provider === 'anthropic' ? 'claude-sonnet-4-5-20250929' : 'gpt-4-turbo-preview';
    }

    initializeClient() {
        if (this.provider === 'anthropic') {
            const apiKey = process.env.ANTHROPIC_API_KEY;
            if (!apiKey || apiKey === 'your-anthropic-api-key-here') {
                throw new Error('ANTHROPIC_API_KEY not set in .env file');
            }
            this.client = new Anthropic({ apiKey });
        } else if (this.provider === 'openai') {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey || apiKey === 'your-openai-api-key-here') {
                throw new Error('OPENAI_API_KEY not set in .env file');
            }
            this.client = new OpenAI({ apiKey });
        } else {
            throw new Error(`Unknown AI provider: ${this.provider}`);
        }
    }

    /**
     * Generate HTML from JSON data
     */
    async generate(jsonPath, templatePath, outputPath) {
        console.log('\n🎨 LAYER 2: HTML Generation');
        console.log('═══════════════════════════════════════════════════\n');

        // Step 1: Read input files
        console.log('📖 Step 1: Reading input files...');
        const jsonData = this.readJSON(jsonPath);
        const templateGuidelines = this.readFile(templatePath);
        console.log('   ✓ JSON data loaded');
        console.log('   ✓ Template guidelines loaded\n');

        // Step 2: Create AI prompt
        console.log('🧠 Step 2: Generating HTML with AI...');
        const prompt = this.createPrompt(jsonData, templateGuidelines);
        console.log(`   Using: ${this.provider} (${this.model})`);

        // Step 3: Call AI API
        const htmlContent = await this.callAI(prompt);
        console.log('   ✓ HTML generated\n');

        // Step 4: Clean and validate HTML
        console.log('🔍 Step 3: Cleaning and validating HTML...');
        const cleanedHTML = this.cleanHTML(htmlContent);
        console.log('   ✓ HTML cleaned and validated\n');

        // Step 5: Save output
        console.log('💾 Step 4: Saving HTML file...');
        this.saveHTML(outputPath, cleanedHTML);
        console.log(`   ✓ Saved to: ${outputPath}\n`);

        console.log('═══════════════════════════════════════════════════');
        console.log('✅ Layer 2 Complete: HTML file ready!\n');

        return cleanedHTML;
    }

    /**
     * Read file with error handling
     */
    readFile(filePath) {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error.message}`);
        }
    }

    /**
     * Read JSON file
     */
    readJSON(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            throw new Error(`Failed to read JSON file ${filePath}: ${error.message}`);
        }
    }

    /**
     * Create comprehensive prompt for AI
     */
    createPrompt(jsonData, templateGuidelines) {
        return `You are an expert web developer and designer specializing in creating beautiful, professional, ATS-friendly resume HTML documents.

# YOUR TASK

Generate a complete, professional HTML resume document based on the provided JSON data and styling guidelines.

# INPUT DATA (JSON)

${JSON.stringify(jsonData, null, 2)}

# STYLING GUIDELINES

${templateGuidelines}

# REQUIREMENTS

1. **Generate Complete HTML Document**:
   - Valid HTML5 structure
   - Include <!DOCTYPE html>, <html>, <head>, and <body> tags
   - Set proper meta tags (charset, viewport)
   - Title should be "[Name] - Resume"

2. **Inline All CSS**:
   - All styles must be in a <style> tag in the <head>
   - NO external stylesheets
   - NO inline style attributes (use classes)
   - Follow the color scheme and typography from guidelines

3. **Structure and Layout**:
   - Header with name, title/tagline, and contact info
   - Professional summary section
   - Skills section (organized by categories)
   - Experience section (with company, role, duration, achievements)
   - Education section
   - Achievements section (if applicable)
   - Optional footer with name

4. **Styling Requirements**:
   - Follow the template guidelines exactly
   - Use Inter font family (or similar web-safe fonts)
   - Red accent color (#D32F2F) for headers and title
   - Black text (#000000) for content
   - Professional spacing and margins
   - Clean, minimalist design

5. **ATS Compatibility**:
   - Use semantic HTML (header, section, h1-h3, ul, li)
   - NO tables for layout
   - NO images or graphics
   - Simple, clean structure
   - Standard fonts

6. **Content Presentation**:
   - Name: Large, bold, uppercase
   - Section headers: Bold, uppercase, red, with bottom border
   - Experience bullets: Clear, well-spaced
   - Skills: Grid or flex layout with categories
   - All information from JSON must be included

7. **Print-Ready**:
   - Optimized for printing to PDF
   - Proper page margins
   - Good contrast for readability
   - Fits on standard letter/A4 paper

# OUTPUT FORMAT

Return ONLY the complete HTML document. Do NOT include:
- Markdown code blocks (\`\`\`html)
- Explanatory text
- Comments outside the HTML

Just output the raw HTML starting with <!DOCTYPE html> and ending with </html>

# EXAMPLE STRUCTURE

Follow this general structure (but adapt to the JSON data):

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>[Name] - Resume</title>
    <style>
        /* All CSS here following guidelines */
    </style>
</head>
<body>
    <div id="header">
        <!-- Name, title, contact -->
    </div>
    <div class="page">
        <div class="summary">
            <!-- Professional summary -->
        </div>
        <h2>SKILLS</h2>
        <!-- Skills organized by category -->

        <h2>EXPERIENCE</h2>
        <!-- Job history with achievements -->

        <h2>ACHIEVEMENTS</h2>
        <!-- Notable achievements -->

        <h2>EDUCATION</h2>
        <!-- Education background -->
    </div>
    <div id="footer">
        <!-- Optional footer -->
    </div>
</body>
</html>

Now generate the complete HTML document based on the JSON data and guidelines.`;
    }

    /**
     * Call AI API based on provider
     */
    async callAI(prompt) {
        if (this.provider === 'anthropic') {
            return await this.callAnthropic(prompt);
        } else {
            return await this.callOpenAI(prompt);
        }
    }

    /**
     * Call Anthropic Claude API
     */
    async callAnthropic(prompt) {
        try {
            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: 8192,
                temperature: 0.5,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });

            return response.content[0].text;
        } catch (error) {
            throw new Error(`Anthropic API error: ${error.message}`);
        }
    }

    /**
     * Call OpenAI API
     */
    async callOpenAI(prompt) {
        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [{
                    role: 'system',
                    content: 'You are an expert web developer. Generate clean, valid HTML documents. Return ONLY the HTML code without markdown formatting.'
                }, {
                    role: 'user',
                    content: prompt
                }],
                temperature: 0.5,
                max_tokens: 8192
            });

            return response.choices[0].message.content;
        } catch (error) {
            throw new Error(`OpenAI API error: ${error.message}`);
        }
    }

    /**
     * Clean HTML response
     */
    cleanHTML(response) {
        let cleaned = response.trim();

        // Remove markdown code blocks if present
        if (cleaned.startsWith('```html')) {
            cleaned = cleaned.replace(/```html\n?/g, '').replace(/```\n?/g, '');
        } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/```\n?/g, '');
        }

        // Ensure it starts with DOCTYPE
        if (!cleaned.startsWith('<!DOCTYPE')) {
            if (cleaned.startsWith('<html')) {
                cleaned = '<!DOCTYPE html>\n' + cleaned;
            } else {
                throw new Error('Invalid HTML: Does not start with DOCTYPE or <html>');
            }
        }

        // Basic validation
        if (!cleaned.includes('</html>')) {
            throw new Error('Invalid HTML: Missing closing </html> tag');
        }

        return cleaned;
    }

    /**
     * Save HTML to file
     */
    saveHTML(outputPath, htmlContent) {
        try {
            fs.writeFileSync(outputPath, htmlContent, 'utf8');
        } catch (error) {
            throw new Error(`Failed to save HTML: ${error.message}`);
        }
    }
}

// CLI Usage
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
╔════════════════════════════════════════════════════════════════╗
║              LAYER 2: HTML Generation                         ║
╚════════════════════════════════════════════════════════════════╝

Usage: node layer2_html_generation.js [options]

Options:
  --json <path>             Path to JSON file from Layer 1 (default: tailored_content.json)
  --template <path>         Path to template guidelines (default: template.txt)
  --output <path>           Path to output HTML file (default: resume.html)
  --provider <name>         AI provider: anthropic or openai (default: from .env)
  --model <name>            AI model name (optional)

Examples:
  node layer2_html_generation.js
  node layer2_html_generation.js --json data.json --output custom.html
  node layer2_html_generation.js --provider openai --model gpt-4

Requirements:
  - Set ANTHROPIC_API_KEY or OPENAI_API_KEY in .env file
  - Have tailored_content.json from Layer 1
  - Have template.txt with styling guidelines
        `);
        process.exit(0);
    }

    // Parse arguments
    const options = {
        jsonPath: 'tailored_content.json',
        templatePath: 'template.txt',
        outputPath: 'resume.html',
        provider: process.env.AI_PROVIDER,
        model: null
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--json':
                options.jsonPath = args[++i];
                break;
            case '--template':
                options.templatePath = args[++i];
                break;
            case '--output':
                options.outputPath = args[++i];
                break;
            case '--provider':
                options.provider = args[++i];
                break;
            case '--model':
                options.model = args[++i];
                break;
        }
    }

    // Run generation
    const generator = new HTMLGenerator({
        provider: options.provider,
        model: options.model
    });

    (async () => {
        try {
            await generator.generate(
                options.jsonPath,
                options.templatePath,
                options.outputPath
            );
        } catch (error) {
            console.error('\n❌ Error:', error.message);
            console.error('\nTroubleshooting:');
            console.error('  1. Make sure your API key is set in .env');
            console.error('  2. Check that tailored_content.json exists (run Layer 1 first)');
            console.error('  3. Check that template.txt exists');
            console.error('  4. Verify you have internet connection\n');
            process.exit(1);
        }
    })();
}

module.exports = HTMLGenerator;
