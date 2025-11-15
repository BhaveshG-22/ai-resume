# Layer 2: HTML Generation

This layer takes the JSON data from Layer 1 and generates a beautifully formatted HTML resume using AI, following your styling guidelines.

## Architecture Flow

```
tailored_content.json (from Layer 1)
            ↓
┌───────────────────────────────────────────────┐
│  LAYER 2: HTML Generation                     │
│  - Take JSON data                             │
│  - Apply template/styling                     │
│  - Generate formatted HTML                    │
│  - Output: Complete HTML string               │
└───────────────────────────────────────────────┘
            ↓
        resume.html
```

## Features

- ✅ Converts JSON resume data to professional HTML
- ✅ Applies styling guidelines from template.txt
- ✅ AI-generated clean, modern design
- ✅ ATS-friendly structure
- ✅ Print-optimized for PDF conversion
- ✅ Inline CSS (no external dependencies)
- ✅ Supports Anthropic Claude and OpenAI GPT

## How It Works

Layer 2 sends the JSON data and styling guidelines to an AI model (Claude or GPT), which generates a complete HTML document following professional resume design principles.

## Usage

### Basic Usage

```bash
node layer2_html_generation.js --json tailored_content.json
```

This will:
1. Read `tailored_content.json` (from Layer 1)
2. Read `template.txt` (styling guidelines)
3. Generate HTML with AI
4. Save to `resume.html`

### Custom Paths

```bash
node layer2_html_generation.js \
  --json tailored_content.json \
  --template template.txt \
  --output my-resume.html
```

### Use Different AI Provider

```bash
# Use OpenAI instead of Anthropic
node layer2_html_generation.js --provider openai

# Use specific model
node layer2_html_generation.js --provider anthropic --model claude-sonnet-4-5-20250929
```

## Programmatic Usage

```javascript
const HTMLGenerator = require('./layer2_html_generation');

const generator = new HTMLGenerator({
    provider: 'anthropic',
    model: 'claude-sonnet-4-5-20250929'
});

async function generateHTML() {
    try {
        const html = await generator.generate(
            'tailored_content.json',
            'template.txt',
            'resume.html'
        );

        console.log('HTML generated successfully!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

generateHTML();
```

## Input Files

### 1. tailored_content.json (from Layer 1)

Contains structured resume data:
```json
{
  "personalInfo": { "name": "...", "email": "..." },
  "summary": { "text": "..." },
  "skills": { ... },
  "experience": [ ... ],
  "education": [ ... ]
}
```

### 2. template.txt (styling guidelines)

Contains design specifications:
- Color scheme
- Typography
- Layout structure
- Spacing guidelines
- CSS requirements

## Output

### resume.html

A complete, professional HTML resume document with:
- Valid HTML5 structure
- Inline CSS styling
- Professional design
- ATS-compatible structure
- Print-ready format

Example structure:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Bhavesh Gavali - Resume</title>
    <style>
        /* All CSS inlined here */
    </style>
</head>
<body>
    <div id="header">
        <!-- Name, title, contact -->
    </div>
    <div class="page">
        <!-- Summary, skills, experience -->
    </div>
</body>
</html>
```

## Styling Guidelines

The generated HTML follows these design principles:

### Color Scheme
- Primary Accent: `#D32F2F` (Red)
- Text: `#000000` (Black)
- Secondary: `#555555` (Gray)

### Typography
- Font: Inter, Arial, sans-serif
- Base size: 0.75rem (12pt)
- Headers: Bold, uppercase

### Layout
- Clean, single-column
- Generous margins (2.5rem)
- Clear section hierarchy
- Professional spacing

## Cost

- **Per HTML generation**: $0.005 - $0.01
- Uses AI to ensure perfect formatting every time

## Next Steps

After generating `resume.html`:

1. **Review the HTML** - Open in browser to check
2. **Proceed to Layer 3** - Convert to PDF

## Full Pipeline Example

```bash
# Layer 1: Generate tailored content from job description
node layer1_ai_generation.js

# Layer 2: Generate HTML from JSON
node layer2_html_generation.js

# Layer 3: Generate PDF from HTML
node generatePDF.js resume.html --filename my-resume.pdf
```

## Troubleshooting

### Missing tailored_content.json
```
Error: Failed to read JSON file tailored_content.json
```
**Solution**: Run Layer 1 first:
```bash
node layer1_ai_generation.js
```

### API Key Error
```
Error: ANTHROPIC_API_KEY not set in .env file
```
**Solution**: Add your API key to `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Invalid HTML Output
If the HTML is malformed:
- Try regenerating with same command
- Check your API credits
- Try a different model

## Customization

### Modify Styling Guidelines

Edit `template.txt` to change:
- Colors
- Fonts
- Layout structure
- Spacing
- Section order

The AI will adapt to your guidelines!

### Add Custom Sections

Modify the prompt in `layer2_html_generation.js` to include additional sections like:
- Certifications
- Projects
- Publications
- Languages

## License

ISC
