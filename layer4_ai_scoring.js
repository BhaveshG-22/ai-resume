const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Layer 4: AI Resume Scoring
 * Evaluates the generated resume using multiple AI providers (Gemini, Claude, OpenAI)
 * and returns scores out of 100 for each provider
 */

class ResumeScorer {
    constructor() {
        this.initializeClients();
    }

    /**
     * Initialize all AI clients
     */
    initializeClients() {
        // Claude (Anthropic)
        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (anthropicKey && anthropicKey !== 'your-anthropic-api-key-here') {
            this.claudeClient = new Anthropic({ apiKey: anthropicKey });
        }

        // OpenAI
        const openaiKey = process.env.OPENAI_API_KEY;
        if (openaiKey && openaiKey !== 'your-openai-api-key-here') {
            this.openaiClient = new OpenAI({ apiKey: openaiKey });
        }

        // Gemini
        const geminiKey = process.env.GEMINI_API_KEY;
        if (geminiKey && geminiKey !== 'your-gemini-api-key-here') {
            this.geminiClient = new GoogleGenerativeAI(geminiKey);
        }
    }

    /**
     * Create scoring prompt for AI evaluation
     */
    createScoringPrompt(resumeContent, jobDescription) {
        return `You are an expert resume evaluator and ATS (Applicant Tracking System) specialist with years of experience in recruitment.

Your task is to evaluate the following resume and provide a score out of 100.

# JOB DESCRIPTION
${jobDescription}

# RESUME TO EVALUATE
${typeof resumeContent === 'string' ? resumeContent : JSON.stringify(resumeContent, null, 2)}

# EVALUATION CRITERIA

Rate this resume out of 100 based on the following factors:

1. **Keyword Optimization (25 points)**
   - Presence of job description keywords
   - Industry-specific terminology
   - ATS-friendly language

2. **Content Quality (25 points)**
   - Clarity and conciseness
   - Achievement-focused bullet points
   - Quantifiable results and metrics
   - Professional language

3. **Relevance to Job (25 points)**
   - Skills match the job requirements
   - Experience aligns with role expectations
   - Demonstrates understanding of the position

4. **Format & Structure (15 points)**
   - Professional layout
   - Easy to read and scan
   - Proper sections and organization
   - ATS compatibility

5. **Impact & Differentiation (10 points)**
   - Stands out from typical resumes
   - Compelling professional summary
   - Unique value proposition

# OUTPUT FORMAT

You must respond with ONLY a JSON object in this exact format:
{
  "score": <number between 0-100>,
  "breakdown": {
    "keywordOptimization": <0-25>,
    "contentQuality": <0-25>,
    "relevance": <0-25>,
    "formatStructure": <0-15>,
    "impact": <0-10>
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "summary": "Brief 1-2 sentence overall assessment"
}

Do NOT include any markdown formatting, code blocks, or explanatory text. Return ONLY the JSON object.`;
    }

    /**
     * Score resume using Claude (Anthropic)
     */
    async scoreWithClaude(resumeContent, jobDescription) {
        if (!this.claudeClient) {
            return {
                provider: 'Claude',
                available: false,
                error: 'ANTHROPIC_API_KEY not configured'
            };
        }

        try {
            console.log('   🤖 Scoring with Claude...');

            const response = await this.claudeClient.messages.create({
                model: 'claude-sonnet-4-5-20250929',
                max_tokens: 2048,
                temperature: 0.3,
                messages: [{
                    role: 'user',
                    content: this.createScoringPrompt(resumeContent, jobDescription)
                }]
            });

            const result = this.parseScoreResponse(response.content[0].text);

            return {
                provider: 'Claude',
                available: true,
                ...result
            };
        } catch (error) {
            console.error('   ❌ Claude scoring error:', error.message);
            return {
                provider: 'Claude',
                available: true,
                error: error.message
            };
        }
    }

    /**
     * Score resume using OpenAI
     */
    async scoreWithOpenAI(resumeContent, jobDescription) {
        if (!this.openaiClient) {
            return {
                provider: 'OpenAI',
                available: false,
                error: 'OPENAI_API_KEY not configured'
            };
        }

        try {
            console.log('   🤖 Scoring with OpenAI...');

            // Try multiple models in order of preference (cheapest/most accessible first)
            const models = ['gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4o', 'gpt-4-turbo', 'gpt-4'];
            let lastError = null;

            for (const model of models) {
                try {
                    const response = await this.openaiClient.chat.completions.create({
                        model: model,
                        messages: [{
                            role: 'system',
                            content: 'You are an expert resume evaluator. Always respond with valid JSON only, no markdown formatting.'
                        }, {
                            role: 'user',
                            content: this.createScoringPrompt(resumeContent, jobDescription)
                        }],
                        temperature: 0.3,
                        max_tokens: 2048
                    });

                    const result = this.parseScoreResponse(response.choices[0].message.content);

                    console.log(`   ✓ Using OpenAI model: ${model}`);

                    return {
                        provider: 'OpenAI',
                        available: true,
                        model: model,
                        ...result
                    };
                } catch (modelError) {
                    lastError = modelError;
                    continue;
                }
            }

            throw lastError || new Error('No OpenAI models available');

        } catch (error) {
            console.error('   ❌ OpenAI scoring error:', error.message);
            return {
                provider: 'OpenAI',
                available: true,
                error: error.message
            };
        }
    }

    /**
     * Score resume using Gemini
     */
    async scoreWithGemini(resumeContent, jobDescription) {
        if (!this.geminiClient) {
            return {
                provider: 'Gemini',
                available: false,
                error: 'GEMINI_API_KEY not configured'
            };
        }

        try {
            console.log('   🤖 Scoring with Gemini...');

            // Try multiple models in order of preference (best available models)
            const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-2.0-flash-exp'];
            let lastError = null;

            for (const modelName of models) {
                try {
                    const model = this.geminiClient.getGenerativeModel({ model: modelName });

                    const result = await model.generateContent(this.createScoringPrompt(resumeContent, jobDescription));
                    const response = await result.response;
                    const text = response.text();

                    const parsedResult = this.parseScoreResponse(text);

                    console.log(`   ✓ Using Gemini model: ${modelName}`);

                    return {
                        provider: 'Gemini',
                        available: true,
                        model: modelName,
                        ...parsedResult
                    };
                } catch (modelError) {
                    lastError = modelError;
                    continue;
                }
            }

            throw lastError || new Error('No Gemini models available');

        } catch (error) {
            console.error('   ❌ Gemini scoring error:', error.message);
            return {
                provider: 'Gemini',
                available: true,
                error: error.message
            };
        }
    }

    /**
     * Parse score response from AI
     */
    parseScoreResponse(response) {
        try {
            // Remove markdown code blocks if present
            let cleanResponse = response.trim();
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.replace(/```\n?/g, '');
            }

            const parsed = JSON.parse(cleanResponse);

            // Validate structure
            if (typeof parsed.score !== 'number' || parsed.score < 0 || parsed.score > 100) {
                throw new Error('Invalid score value');
            }

            return parsed;
        } catch (error) {
            console.error('   ⚠ Error parsing score response:', error.message);
            return {
                score: 0,
                error: `Failed to parse response: ${error.message}`,
                rawResponse: response.substring(0, 200)
            };
        }
    }

    /**
     * Score resume with all available AI providers
     */
    async scoreResume(resumeContent, jobDescription) {
        console.log('\n📊 LAYER 4: AI Resume Scoring');
        console.log('═══════════════════════════════════════════════════\n');

        console.log('🔍 Evaluating resume with multiple AI providers...\n');

        // Run all scoring in parallel for efficiency
        const [claudeScore, openaiScore, geminiScore] = await Promise.all([
            this.scoreWithClaude(resumeContent, jobDescription),
            this.scoreWithOpenAI(resumeContent, jobDescription),
            this.scoreWithGemini(resumeContent, jobDescription)
        ]);

        const scores = {
            claude: claudeScore,
            openai: openaiScore,
            gemini: geminiScore
        };

        // Calculate average score from available providers
        const availableScores = [claudeScore, openaiScore, geminiScore]
            .filter(s => s.available && !s.error && s.score)
            .map(s => s.score);

        const averageScore = availableScores.length > 0
            ? Math.round(availableScores.reduce((a, b) => a + b, 0) / availableScores.length)
            : 0;

        scores.average = averageScore;
        scores.timestamp = new Date().toISOString();

        console.log('\n📊 Scoring Results:');
        console.log('─────────────────────────────────────────────────');

        if (claudeScore.available && !claudeScore.error) {
            console.log(`   Claude:  ${claudeScore.score}/100`);
        }
        if (openaiScore.available && !openaiScore.error) {
            console.log(`   OpenAI:  ${openaiScore.score}/100`);
        }
        if (geminiScore.available && !geminiScore.error) {
            console.log(`   Gemini:  ${geminiScore.score}/100`);
        }
        console.log(`   Average: ${averageScore}/100`);
        console.log('─────────────────────────────────────────────────\n');

        console.log('═══════════════════════════════════════════════════');
        console.log('✅ Layer 4 Complete: Resume scored by AI!\n');

        return scores;
    }

    /**
     * Score resume from file
     */
    async scoreResumeFromFile(resumePath, jobDescriptionPath, outputPath) {
        // Read files
        const resumeContent = this.readFile(resumePath);
        const jobDescription = this.readFile(jobDescriptionPath);

        // Score resume
        const scores = await this.scoreResume(resumeContent, jobDescription);

        // Save results
        if (outputPath) {
            fs.writeFileSync(outputPath, JSON.stringify(scores, null, 2), 'utf8');
            console.log(`💾 Scores saved to: ${outputPath}\n`);
        }

        return scores;
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
}

// CLI Usage
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
╔════════════════════════════════════════════════════════════════╗
║              LAYER 4: AI Resume Scoring                       ║
╚════════════════════════════════════════════════════════════════╝

Usage: node layer4_ai_scoring.js [options]

Options:
  --resume <path>           Path to resume file (JSON, HTML, or TXT)
  --job <path>              Path to job description file
  --output <path>           Path to save scores JSON (optional)

Examples:
  node layer4_ai_scoring.js --resume tailored_content.json --job job_description.txt
  node layer4_ai_scoring.js --resume resume.html --job job_description.txt --output scores.json

Requirements:
  - Set at least one of: ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY in .env
  - Have the resume file (from Layer 1, 2, or 3)
  - Have the job description file

Note: Scores are more accurate when using JSON or text format resumes.
        `);
        process.exit(0);
    }

    // Parse arguments
    const options = {
        resumePath: null,
        jobPath: null,
        outputPath: null
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--resume':
                options.resumePath = args[++i];
                break;
            case '--job':
                options.jobPath = args[++i];
                break;
            case '--output':
                options.outputPath = args[++i];
                break;
        }
    }

    if (!options.resumePath || !options.jobPath) {
        console.error('\n❌ Error: --resume and --job arguments are required\n');
        process.exit(1);
    }

    // Run scoring
    const scorer = new ResumeScorer();

    (async () => {
        try {
            await scorer.scoreResumeFromFile(
                options.resumePath,
                options.jobPath,
                options.outputPath
            );
        } catch (error) {
            console.error('\n❌ Error:', error.message);
            console.error('\nTroubleshooting:');
            console.error('  1. Make sure at least one API key is set in .env');
            console.error('  2. Check that input files exist');
            console.error('  3. Verify you have internet connection');
            console.error('  4. Ensure your API keys have sufficient credits\n');
            process.exit(1);
        }
    })();
}

module.exports = ResumeScorer;
