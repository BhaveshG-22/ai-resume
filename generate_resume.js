#!/usr/bin/env node

/**
 * Complete 3-Layer Resume Generation Pipeline
 *
 * Layer 1: AI Content Generation (Job Description + Experience → JSON)
 * Layer 2: HTML Generation (JSON + Template → HTML)
 * Layer 3: PDF Conversion (HTML → PDF)
 */

const ResumeAIGenerator = require('./layer1_ai_generation');
const HTMLGenerator = require('./layer2_html_generation');
const { generatePDF } = require('./generatePDF');
const fs = require('fs');
const path = require('path');

async function generateResume(options = {}) {
    // Default options
    const config = {
        jobDescriptionPath: 'job_description.txt',
        experiencePath: 'user_experience.txt',
        templatePath: 'template.txt',
        jsonOutputPath: 'tailored_content.json',
        htmlOutputPath: 'resume.html',
        pdfFilename: 'resume.pdf',
        provider: process.env.AI_PROVIDER || 'anthropic',
        model: null,
        skipLayer1: false,
        skipLayer2: false,
        skipLayer3: false,
        ...options
    };

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║        3-LAYER AI RESUME GENERATOR PIPELINE                   ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const startTime = Date.now();
    let layer1Result, layer2Result, layer3Result;

    try {
        // LAYER 1: AI Content Generation
        if (!config.skipLayer1) {
            console.log('🔹 Starting Layer 1: AI Content Generation\n');

            const aiGenerator = new ResumeAIGenerator({
                provider: config.provider,
                model: config.model
            });

            layer1Result = await aiGenerator.generate(
                config.jobDescriptionPath,
                config.experiencePath,
                config.jsonOutputPath
            );
        } else {
            console.log('⏭️  Skipping Layer 1 (using existing JSON)\n');
        }

        // LAYER 2: HTML Generation
        if (!config.skipLayer2) {
            console.log('🔹 Starting Layer 2: HTML Generation\n');

            const htmlGenerator = new HTMLGenerator({
                provider: config.provider,
                model: config.model
            });

            layer2Result = await htmlGenerator.generate(
                config.jsonOutputPath,
                config.templatePath,
                config.htmlOutputPath
            );
        } else {
            console.log('⏭️  Skipping Layer 2 (using existing HTML)\n');
        }

        // LAYER 3: PDF Conversion
        if (!config.skipLayer3) {
            console.log('🔹 Starting Layer 3: PDF Generation\n');

            layer3Result = await generatePDF(
                path.resolve(config.htmlOutputPath),
                {
                    filename: config.pdfFilename,
                    inline: false,
                    options: {
                        printBackground: true
                    }
                }
            );
        } else {
            console.log('⏭️  Skipping Layer 3 (HTML only)\n');
        }

        // Summary
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║                    ✅ PIPELINE COMPLETE                        ║');
        console.log('╚════════════════════════════════════════════════════════════════╝\n');

        console.log('📊 Summary:');
        console.log(`   ⏱️  Total Time: ${duration}s`);

        if (!config.skipLayer1) {
            console.log(`   📄 JSON: ${config.jsonOutputPath}`);
        }
        if (!config.skipLayer2) {
            console.log(`   🌐 HTML: ${config.htmlOutputPath}`);
        }
        if (!config.skipLayer3 && layer3Result) {
            console.log(`   📑 PDF: ${layer3Result.FileUrl}`);
            console.log(`   💰 Cost: $${layer3Result.Cost.toFixed(4)}`);
        }

        console.log('\n🎉 Your tailored resume is ready!\n');

        return {
            json: layer1Result,
            html: layer2Result,
            pdf: layer3Result,
            duration
        };

    } catch (error) {
        console.error('\n❌ Pipeline Error:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Check your API keys in .env');
        console.error('   2. Ensure input files exist (job_description.txt, user_experience.txt)');
        console.error('   3. Verify internet connection');
        console.error('   4. Check API credits/quota\n');
        throw error;
    }
}

// CLI Usage
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
╔════════════════════════════════════════════════════════════════╗
║        3-LAYER AI RESUME GENERATOR PIPELINE                   ║
╚════════════════════════════════════════════════════════════════╝

Complete pipeline to generate a tailored resume from job description.

Usage: node generate_resume.js [options]

Options:
  --job <path>              Job description file (default: job_description.txt)
  --experience <path>       User experience file (default: user_experience.txt)
  --template <path>         Template guidelines (default: template.txt)
  --output <filename>       PDF output filename (default: resume.pdf)
  --provider <name>         AI provider: anthropic or openai
  --model <name>            AI model name (optional)

  --skip-layer1             Skip Layer 1 (use existing JSON)
  --skip-layer2             Skip Layer 2 (use existing HTML)
  --skip-layer3             Skip Layer 3 (HTML only, no PDF)

  --help, -h                Show this help message

Examples:
  # Full pipeline (all 3 layers)
  node generate_resume.js

  # Custom files
  node generate_resume.js --job my_job.txt --experience my_exp.txt --output my-resume.pdf

  # Skip Layer 1 (use existing tailored_content.json)
  node generate_resume.js --skip-layer1

  # Generate HTML only (no PDF)
  node generate_resume.js --skip-layer3

  # Use different AI provider
  node generate_resume.js --provider openai --model gpt-4

Pipeline Flow:

  USER INPUT (job_description.txt + user_experience.txt)
              ↓
  ┌─────────────────────────────────────────────┐
  │  LAYER 1: AI Content Generation             │
  │  → tailored_content.json                    │
  └─────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────┐
  │  LAYER 2: HTML Generation                   │
  │  → resume.html                              │
  └─────────────────────────────────────────────┘
              ↓
  ┌─────────────────────────────────────────────┐
  │  LAYER 3: PDF Conversion                    │
  │  → resume.pdf                               │
  └─────────────────────────────────────────────┘

Requirements:
  1. Set ANTHROPIC_API_KEY or OPENAI_API_KEY in .env
  2. Set PORTAL_API_KEY in .env (for PDF generation)
  3. Create job_description.txt with target job posting
  4. Create user_experience.txt with your background
        `);
        process.exit(0);
    }

    // Parse arguments
    const options = {
        skipLayer1: false,
        skipLayer2: false,
        skipLayer3: false
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--job':
                options.jobDescriptionPath = args[++i];
                break;
            case '--experience':
                options.experiencePath = args[++i];
                break;
            case '--template':
                options.templatePath = args[++i];
                break;
            case '--output':
                options.pdfFilename = args[++i];
                break;
            case '--provider':
                options.provider = args[++i];
                break;
            case '--model':
                options.model = args[++i];
                break;
            case '--skip-layer1':
                options.skipLayer1 = true;
                break;
            case '--skip-layer2':
                options.skipLayer2 = true;
                break;
            case '--skip-layer3':
                options.skipLayer3 = true;
                break;
        }
    }

    // Run pipeline
    generateResume(options)
        .then(() => {
            process.exit(0);
        })
        .catch(error => {
            process.exit(1);
        });
}

module.exports = generateResume;
