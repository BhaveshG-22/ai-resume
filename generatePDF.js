const Api2Pdf = require('api2pdf');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Generate PDF from HTML file using Api2Pdf
 * @param {string} htmlFilePath - Path to the HTML file
 * @param {object} options - Options for PDF generation
 * @returns {Promise} - Result from Api2Pdf
 */
async function generatePDF(htmlFilePath, options = {}) {
    // Validate API key
    const apiKey = process.env.PORTAL_API_KEY;
    if (!apiKey) {
        throw new Error('API key not found. Please set PORTAL_API_KEY in .env file');
    }

    // Initialize Api2Pdf client
    const a2pClient = new Api2Pdf(apiKey);

    // Check if file exists
    if (!fs.existsSync(htmlFilePath)) {
        throw new Error(`HTML file not found: ${htmlFilePath}`);
    }

    // Read HTML content
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    console.log(`✓ Read HTML file: ${htmlFilePath}`);

    // Default options
    const defaultOptions = {
        engine: 'chrome', // 'chrome' or 'wkhtmltopdf'
        inline: false,
        filename: 'output.pdf',
        pdfOptions: {}
    };

    // Merge options
    const config = { ...defaultOptions, ...options };

    console.log(`\n🔄 Generating PDF using ${config.engine}...`);
    console.log(`   Filename: ${config.filename}`);

    try {
        let result;

        // Generate PDF based on engine choice
        if (config.engine === 'chrome') {
            result = await a2pClient.chromeHtmlToPdf(htmlContent, {
                inline: config.inline,
                filename: config.filename,
                options: config.pdfOptions
            });
        } else if (config.engine === 'wkhtmltopdf') {
            result = await a2pClient.wkHtmlToPdf(htmlContent, {
                inline: config.inline,
                filename: config.filename,
                options: config.pdfOptions
            });
        } else {
            throw new Error(`Unknown engine: ${config.engine}. Use 'chrome' or 'wkhtmltopdf'`);
        }

        // Check if successful
        if (result.Success) {
            console.log('\n✅ PDF generated successfully!');
            console.log(`   PDF URL: ${result.FileUrl}`);
            console.log(`   File Size: ${result.MbOut} MB`);
            console.log(`   Cost: $${result.Cost}`);
            console.log(`   Response ID: ${result.ResponseId}`);
            console.log('\n⚠️  Note: This URL will be available for 24 hours');
            return result;
        } else {
            throw new Error(`PDF generation failed: ${result.Error}`);
        }
    } catch (error) {
        console.error('\n❌ Error generating PDF:', error.message);
        throw error;
    }
}

/**
 * Delete a generated PDF from Api2Pdf
 * @param {string} responseId - Response ID from PDF generation
 */
async function deletePDF(responseId) {
    const apiKey = process.env.PORTAL_API_KEY;
    if (!apiKey) {
        throw new Error('API key not found. Please set PORTAL_API_KEY in .env file');
    }

    const a2pClient = new Api2Pdf(apiKey);

    try {
        await a2pClient.utilityDelete(responseId);
        console.log(`\n🗑️  PDF deleted successfully (Response ID: ${responseId})`);
    } catch (error) {
        console.error(`\n❌ Error deleting PDF:`, error.message);
        throw error;
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
Usage: node generatePDF.js <html-file-path> [options]

Options:
  --engine <chrome|wkhtmltopdf>  PDF generation engine (default: chrome)
  --filename <name>              Output filename (default: output.pdf)
  --inline <true|false>          Inline download (default: false)
  --landscape                    Landscape orientation (Chrome only)
  --pageSize <size>              Page size like A4, Letter (wkhtmltopdf only)

Examples:
  node generatePDF.js sample.html
  node generatePDF.js sample.html --engine chrome --filename resume.pdf
  node generatePDF.js sample.html --engine wkhtmltopdf --landscape
        `);
        process.exit(0);
    }

    const htmlFilePath = path.resolve(args[0]);
    const options = {
        engine: 'chrome',
        inline: false,
        filename: 'output.pdf',
        pdfOptions: {}
    };

    // Parse command line arguments
    for (let i = 1; i < args.length; i++) {
        switch (args[i]) {
            case '--engine':
                options.engine = args[++i];
                break;
            case '--filename':
                options.filename = args[++i];
                break;
            case '--inline':
                options.inline = args[++i] === 'true';
                break;
            case '--landscape':
                options.pdfOptions.landscape = true;
                break;
            case '--pageSize':
                options.pdfOptions.pageSize = args[++i];
                break;
        }
    }

    generatePDF(htmlFilePath, options)
        .then(result => {
            console.log('\n✨ Done!\n');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Failed to generate PDF\n');
            process.exit(1);
        });
}

module.exports = { generatePDF, deletePDF };
