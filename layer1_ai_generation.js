const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Layer 1: AI Content Generation
 * Analyzes job description and user experience to generate tailored resume content
 */

class ResumeAIGenerator {
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
     * Generate tailored resume content using AI
     */
    async generate(jobDescriptionPath, userExperiencePath, outputPath) {
        console.log('\n🤖 LAYER 1: AI Content Generation');
        console.log('═══════════════════════════════════════════════════\n');

        // Step 1: Read input files
        console.log('📖 Step 1: Reading input files...');
        const jobDescription = this.readFile(jobDescriptionPath);
        const userExperience = this.readFile(userExperiencePath);
        const requiredFormat = this.readFile(path.join(__dirname, 'required_format.json'));
        console.log('   ✓ Job description loaded');
        console.log('   ✓ User experience loaded');
        console.log('   ✓ Required format loaded\n');

        // Step 2: Create AI prompt
        console.log('🧠 Step 2: Analyzing with AI...');
        const prompt = this.createPrompt(jobDescription, userExperience, requiredFormat);
        console.log(`   Using: ${this.provider} (${this.model})`);

        // Step 3: Call AI API
        const response = await this.callAI(prompt);
        console.log('   ✓ AI analysis complete\n');

        // Step 4: Parse and validate JSON
        console.log('🔍 Step 3: Parsing and validating output...');
        const tailoredContent = this.parseAndValidateJSON(response);
        console.log('   ✓ JSON validated successfully\n');

        // Step 5: Save output
        console.log('💾 Step 4: Saving tailored content...');
        this.saveJSON(outputPath, tailoredContent);
        console.log(`   ✓ Saved to: ${outputPath}\n`);

        console.log('═══════════════════════════════════════════════════');
        console.log('✅ Layer 1 Complete: Tailored content generated!\n');

        return tailoredContent;
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
     * Create comprehensive prompt for AI
     */
    createPrompt(jobDescription, userExperience, requiredFormatJSON) {
        return `You are an expert resume writer and career coach specializing in ATS (Applicant Tracking System) optimization. Your task is to analyze a job description and a candidate's experience, then generate a perfectly tailored resume in JSON format.

# INPUTS

## Job Description:
${jobDescription}

## Candidate's Experience:
${userExperience}

## Required Output Format:
${requiredFormatJSON}

# YOUR TASKS

1. **Analyze the Job Description**:
   - Identify key requirements, skills, and qualifications
   - Extract important keywords for ATS optimization
   - Understand the role's responsibilities and expectations
   - Note the company culture and values if mentioned

2. **Analyze Candidate's Experience**:
   - Map candidate's skills and experience to job requirements
   - Identify transferable skills and relevant achievements
   - Quantify accomplishments where possible
   - Highlight strengths that align with the role

3. **Generate Tailored Content**:
   - Write a compelling professional summary (2-4 sentences) that directly addresses the job requirements
   - Rewrite experience bullet points to emphasize relevant skills and achievements
   - Use action verbs and quantify results where possible
   - Incorporate keywords from the job description naturally
   - Highlight technical skills, tools, and competencies mentioned in the job posting
   - Ensure all content is truthful and based on the candidate's actual experience

4. **Optimize for ATS**:
   - Use keywords from the job description strategically
   - Structure content for easy parsing by ATS systems
   - Avoid graphics, tables, or complex formatting in the text
   - Use standard section headings

5. **Format as JSON**:
   - Follow the required_format.json structure exactly
   - Ensure all fields are properly filled
   - Add metadata about keywords and tailoring

# IMPORTANT GUIDELINES

- Be truthful: Only include information based on the candidate's actual experience
- Be specific: Use metrics, numbers, and concrete examples
- Be relevant: Prioritize information that matches the job description
- Be concise: Keep bullet points to 1-2 lines, avoid fluff
- Be strategic: Lead with the most relevant experiences and skills
- Use strong action verbs: Led, Managed, Developed, Implemented, Optimized, etc.
- Quantify achievements: Use percentages, numbers, dollar amounts when possible

# OUTPUT

Return ONLY valid JSON following the required format. Do not include any markdown formatting, code blocks, or explanatory text - just the raw JSON object.`;
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
                max_tokens: 4096,
                temperature: 0.7,
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
                    content: 'You are an expert resume writer and ATS optimization specialist. Always respond with valid JSON only.'
                }, {
                    role: 'user',
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 4096
            });

            return response.choices[0].message.content;
        } catch (error) {
            throw new Error(`OpenAI API error: ${error.message}`);
        }
    }

    /**
     * Parse and validate JSON response
     */
    parseAndValidateJSON(response) {
        try {
            // Remove markdown code blocks if present
            let cleanResponse = response.trim();
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.replace(/```\n?/g, '');
            }

            const parsed = JSON.parse(cleanResponse);

            // Basic validation
            if (!parsed.personalInfo || !parsed.summary || !parsed.experience) {
                throw new Error('Missing required fields in generated JSON');
            }

            // Add generation metadata
            if (!parsed.metadata) {
                parsed.metadata = {};
            }
            parsed.metadata.generatedDate = new Date().toISOString();
            parsed.metadata.aiProvider = this.provider;
            parsed.metadata.aiModel = this.model;

            return parsed;
        } catch (error) {
            console.error('\n❌ Error parsing AI response:');
            console.error('Response preview:', response.substring(0, 500));
            throw new Error(`JSON parsing failed: ${error.message}`);
        }
    }

    /**
     * Save JSON to file
     */
    saveJSON(outputPath, data) {
        try {
            fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            throw new Error(`Failed to save JSON: ${error.message}`);
        }
    }

    /**
     * Quick analysis without full generation (for testing)
     */
    async analyzeJob(jobDescriptionPath) {
        const jobDescription = this.readFile(jobDescriptionPath);

        const prompt = `Analyze this job description and extract:
1. Key required skills (list)
2. Important keywords for ATS (list)
3. Role level (entry/mid/senior)
4. Top 5 requirements

Job Description:
${jobDescription}

Return as JSON with keys: skills, keywords, level, topRequirements`;

        const response = await this.callAI(prompt);
        return this.parseAndValidateJSON(response);
    }
}

// CLI Usage
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
╔════════════════════════════════════════════════════════════════╗
║          LAYER 1: AI Resume Content Generation                ║
╚════════════════════════════════════════════════════════════════╝

Usage: node layer1_ai_generation.js [options]

Options:
  --job <path>              Path to job description file (default: job_description.txt)
  --experience <path>       Path to user experience file (default: user_experience.txt)
  --output <path>           Path to output JSON file (default: tailored_content.json)
  --provider <name>         AI provider: anthropic or openai (default: from .env)
  --model <name>            AI model name (default: claude-3-5-sonnet-20241022 or gpt-4-turbo-preview)
  --analyze-only            Only analyze job description (testing mode)

Examples:
  node layer1_ai_generation.js
  node layer1_ai_generation.js --job job.txt --experience exp.txt --output result.json
  node layer1_ai_generation.js --provider openai --model gpt-4
  node layer1_ai_generation.js --analyze-only

Requirements:
  - Set ANTHROPIC_API_KEY or OPENAI_API_KEY in .env file
  - Create job_description.txt with the target job posting
  - Create user_experience.txt with candidate's background
        `);
        process.exit(0);
    }

    // Parse arguments
    const options = {
        jobPath: 'job_description.txt',
        experiencePath: 'user_experience.txt',
        outputPath: 'tailored_content.json',
        provider: process.env.AI_PROVIDER,
        model: null,
        analyzeOnly: false
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--job':
                options.jobPath = args[++i];
                break;
            case '--experience':
                options.experiencePath = args[++i];
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
            case '--analyze-only':
                options.analyzeOnly = true;
                break;
        }
    }

    // Run generation
    const generator = new ResumeAIGenerator({
        provider: options.provider,
        model: options.model
    });

    (async () => {
        try {
            if (options.analyzeOnly) {
                console.log('\n🔍 Analyzing job description only...\n');
                const analysis = await generator.analyzeJob(options.jobPath);
                console.log(JSON.stringify(analysis, null, 2));
            } else {
                await generator.generate(
                    options.jobPath,
                    options.experiencePath,
                    options.outputPath
                );
            }
        } catch (error) {
            console.error('\n❌ Error:', error.message);
            console.error('\nTroubleshooting:');
            console.error('  1. Make sure your API key is set in .env');
            console.error('  2. Check that input files exist');
            console.error('  3. Verify you have internet connection');
            console.error('  4. Ensure your API key has sufficient credits\n');
            process.exit(1);
        }
    })();
}

module.exports = ResumeAIGenerator;
