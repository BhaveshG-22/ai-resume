# HTML to PDF Generator

A Node.js script that converts HTML files to PDF using the [Api2Pdf](https://www.api2pdf.com/) service.

## Features

- Convert HTML files to PDF using Headless Chrome or wkhtmltopdf
- Support for custom PDF options (landscape, page size, etc.)
- Command-line interface for easy usage
- Programmatic API for integration into other projects
- Delete PDFs on-demand from Api2Pdf servers

## Prerequisites

- Node.js (v12 or higher)
- Api2Pdf API key (get one at [portal.api2pdf.com](https://portal.api2pdf.com))

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your API key in `.env`:
```env
PORTAL_API_KEY=your-api-key-here
```

## Usage

### Command Line

Basic usage:
```bash
node generatePDF.js sample.html
```

With custom filename:
```bash
node generatePDF.js sample.html --filename resume.pdf
```

Using wkhtmltopdf engine:
```bash
node generatePDF.js sample.html --engine wkhtmltopdf
```

Landscape orientation (Chrome):
```bash
node generatePDF.js sample.html --landscape --filename landscape.pdf
```

Custom page size (wkhtmltopdf):
```bash
node generatePDF.js sample.html --engine wkhtmltopdf --pageSize A4
```

### Available Options

- `--engine <chrome|wkhtmltopdf>` - PDF generation engine (default: chrome)
- `--filename <name>` - Output filename (default: output.pdf)
- `--inline <true|false>` - Inline download (default: false)
- `--landscape` - Landscape orientation (Chrome only)
- `--pageSize <size>` - Page size like A4, Letter (wkhtmltopdf only)

### Programmatic Usage

```javascript
const { generatePDF, deletePDF } = require('./generatePDF');

// Generate PDF with default options
generatePDF('./sample.html')
    .then(result => {
        console.log('PDF URL:', result.FileUrl);
        console.log('Response ID:', result.ResponseId);
    })
    .catch(error => {
        console.error('Error:', error);
    });

// Generate PDF with custom options
const options = {
    engine: 'chrome',
    filename: 'my-resume.pdf',
    inline: false,
    pdfOptions: {
        landscape: true
    }
};

generatePDF('./sample.html', options)
    .then(result => {
        console.log('PDF generated:', result.FileUrl);

        // Optionally delete the PDF after 1 hour
        setTimeout(() => {
            deletePDF(result.ResponseId);
        }, 3600000);
    });
```

## PDF Engine Options

### Chrome (Headless Chrome)

Supported options in `pdfOptions`:
- `landscape` - Boolean (default: false)
- `displayHeaderFooter` - Boolean
- `printBackground` - Boolean
- `scale` - Number (0.1 to 2)
- `paperWidth` - Number (in inches)
- `paperHeight` - Number (in inches)
- `marginTop` - Number (in inches)
- `marginBottom` - Number (in inches)
- `marginLeft` - Number (in inches)
- `marginRight` - Number (in inches)
- `pageRanges` - String (e.g., '1-5, 8, 11-13')

[Full list of Chrome options](https://www.api2pdf.com/documentation/advanced-options-headless-chrome/)

### wkhtmltopdf

Supported options in `pdfOptions`:
- `orientation` - 'landscape' or 'portrait'
- `pageSize` - 'A4', 'Letter', etc.
- `marginTop` - String (e.g., '10mm')
- `marginBottom` - String
- `marginLeft` - String
- `marginRight` - String

[Full list of wkhtmltopdf options](https://www.api2pdf.com/documentation/advanced-options-wkhtmltopdf/)

## Examples

### Example 1: Generate a Resume PDF
```javascript
const { generatePDF } = require('./generatePDF');

const options = {
    engine: 'chrome',
    filename: 'john-doe-resume.pdf',
    pdfOptions: {
        printBackground: true,
        marginTop: 0.4,
        marginBottom: 0.4,
        marginLeft: 0.4,
        marginRight: 0.4
    }
};

generatePDF('./resume.html', options);
```

### Example 2: Generate a Landscape Report
```javascript
const { generatePDF } = require('./generatePDF');

const options = {
    engine: 'chrome',
    filename: 'report.pdf',
    pdfOptions: {
        landscape: true,
        printBackground: true
    }
};

generatePDF('./report.html', options);
```

### Example 3: Using wkhtmltopdf with Custom Page Size
```javascript
const { generatePDF } = require('./generatePDF');

const options = {
    engine: 'wkhtmltopdf',
    filename: 'document.pdf',
    pdfOptions: {
        orientation: 'portrait',
        pageSize: 'A4',
        marginTop: '10mm',
        marginBottom: '10mm'
    }
};

generatePDF('./document.html', options);
```

## Important Notes

- Generated PDFs are hosted on Api2Pdf servers and available for 24 hours
- Each PDF generation incurs a small cost (check your Api2Pdf pricing)
- You can delete PDFs on-demand using the `deletePDF()` function
- The API key should be kept secure and never committed to version control

## Security

- The `.env` file is gitignored by default
- Never share your API key publicly
- Consider using environment variables in production

## Troubleshooting

### API Key Not Found
Make sure your `.env` file exists and contains:
```env
PORTAL_API_KEY=your-actual-api-key
```

### HTML File Not Found
Ensure you're providing the correct path to the HTML file. You can use absolute or relative paths.

### PDF Generation Failed
Check the error message for details. Common issues:
- Invalid API key
- Malformed HTML
- Network connectivity issues

## API Reference

### generatePDF(htmlFilePath, options)

Generates a PDF from an HTML file.

**Parameters:**
- `htmlFilePath` (string) - Path to the HTML file
- `options` (object) - Configuration options
  - `engine` (string) - 'chrome' or 'wkhtmltopdf' (default: 'chrome')
  - `filename` (string) - Output filename (default: 'output.pdf')
  - `inline` (boolean) - Inline download (default: false)
  - `pdfOptions` (object) - Engine-specific options

**Returns:** Promise<object>
- `Success` (boolean)
- `FileUrl` (string)
- `MbOut` (number)
- `Cost` (number)
- `ResponseId` (string)
- `Error` (string|null)

### deletePDF(responseId)

Deletes a PDF from Api2Pdf servers.

**Parameters:**
- `responseId` (string) - Response ID from PDF generation

**Returns:** Promise<void>

## License

ISC

## Resources

- [Api2Pdf Documentation](https://www.api2pdf.com/documentation/)
- [Api2Pdf Node.js Client](https://github.com/Api2Pdf/api2pdf.node)
- [Get API Key](https://portal.api2pdf.com/)
