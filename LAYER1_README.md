# Layer 1: AI Content Generation

This layer analyzes job descriptions and user experience to generate perfectly tailored resume content in structured JSON format, optimized for ATS (Applicant Tracking Systems).

## Architecture Flow

```
USER INPUT (Experience + Job Description)
            ↓
┌───────────────────────────────────────────────┐
│  LAYER 1: AI Content Generation               │
│  - Analyze job description                    │
│  - Optimize user experience                   │
│  - Generate tailored content                  │
│  - Output: Structured JSON                    │
└───────────────────────────────────────────────┘
            ↓
     tailored_content.json
```

## Features

- ✅ Analyzes job descriptions to extract key requirements and keywords
- ✅ Maps candidate experience to job requirements
- ✅ Generates ATS-optimized content with relevant keywords
- ✅ Rewrites achievement bullets with metrics and impact
- ✅ Creates compelling professional summaries
- ✅ Supports both Anthropic Claude and OpenAI GPT
- ✅ Outputs structured JSON following required format
- ✅ Includes metadata for tracking and optimization

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

Edit `.env` and add your AI provider API key:

**For Anthropic Claude (Recommended):**
```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
AI_PROVIDER=anthropic
```

**For OpenAI:**
```env
OPENAI_API_KEY=sk-xxxxx
AI_PROVIDER=openai
```

Get your API keys:
- Anthropic: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/api-keys

### 3. Prepare Input Files

Create two text files:

**`job_description.txt`** - Paste the full job posting
```text
Office Administrator
Location: Toronto, ON
...
```

**`user_experience.txt`** - Your complete work history and skills
```text
CURRENT ROLE:
Sales Consultant at Telus (June 2025 - Present)
- Achievement 1
- Achievement 2
...
```

## Usage

### Basic Usage

```bash
node layer1_ai_generation.js
```

This will:
1. Read `job_description.txt`
2. Read `user_experience.txt`
3. Generate tailored content with AI
4. Save to `tailored_content.json`

### Custom Paths (if you have different file names)

```bash
node layer1_ai_generation.js --job job_description.txt --experience user_experience.txt --output tailored_content.json
```

### Use Different AI Provider

```bash
# Use OpenAI instead of Anthropic
node layer1_ai_generation.js --provider openai

# Use specific model
node layer1_ai_generation.js --provider openai --model gpt-4
```

### Analyze Job Description Only (Testing)

```bash
node layer1_ai_generation.js --analyze-only
```

This quickly analyzes the job description and extracts:
- Key required skills
- ATS keywords
- Role level
- Top requirements

## Programmatic Usage

```javascript
const ResumeAIGenerator = require('./layer1_ai_generation');

// Initialize generator
const generator = new ResumeAIGenerator({
    provider: 'anthropic',  // or 'openai'
    model: 'claude-3-5-sonnet-20241022'  // optional
});

// Generate tailored content
async function generateResume() {
    try {
        const tailoredContent = await generator.generate(
            'job_description.txt',
            'user_experience.txt',
            'tailored_content.json'
        );

        console.log('Generated content:', tailoredContent);
        console.log('Keywords:', tailoredContent.metadata.keywords);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

generateResume();
```

## Output Format

The generated `tailored_content.json` includes:

```json
{
  "personalInfo": {
    "name": "Bhavesh Gavali",
    "title": "Tech-Savvy Office Administrator",
    "email": "bhaveshgavali2022@gmail.com",
    "phone": "(647) 975-5217"
  },
  "summary": {
    "text": "Detail-oriented Office Administrator with proven experience in..."
  },
  "skills": {
    "technical": ["Microsoft Excel", "VLOOKUP", "Pivot Tables"],
    "tools": ["Smartsheet", "Jira", "Google Workspace"],
    "soft": ["Organization", "Communication", "Multitasking"],
    "categories": [...]
  },
  "experience": [
    {
      "title": "Sales Consultant",
      "company": "Telus Bramalea City Centre",
      "duration": "June 2025 - Present",
      "current": true,
      "achievements": [
        "Optimized daily operations by creating Excel-based performance trackers using VLOOKUP and pivot tables, reducing reporting time by 40%",
        "...tailored to job description..."
      ]
    }
  ],
  "education": [...],
  "achievements": [...],
  "metadata": {
    "tailoredFor": "Office Administrator",
    "keywords": ["Excel", "Scheduling", "Documentation"],
    "atsScore": "High",
    "generatedDate": "2025-11-15T...",
    "aiProvider": "anthropic",
    "aiModel": "claude-3-5-sonnet-20241022"
  }
}
```

## How It Works

### Step 1: Input Analysis
The AI analyzes:
- **Job Description**: Extracts requirements, keywords, skills, company culture
- **User Experience**: Maps skills, identifies transferable abilities, quantifies achievements

### Step 2: Content Tailoring
The AI:
- Rewrites experience bullets to highlight relevant skills
- Incorporates job description keywords naturally
- Quantifies achievements with metrics
- Creates compelling summary targeting the role

### Step 3: ATS Optimization
- Uses strategic keyword placement
- Avoids formatting that confuses ATS
- Structures content for easy parsing
- Includes standard section headings

### Step 4: JSON Output
- Validates against required format
- Adds metadata for tracking
- Ensures all fields are populated

## AI Providers Comparison

| Feature | Anthropic Claude | OpenAI GPT |
|---------|-----------------|------------|
| Quality | Excellent, more detailed | Excellent |
| Speed | Fast | Fast |
| Cost | ~$0.01-0.03/resume | ~$0.02-0.05/resume |
| Context | 200K tokens | 128K tokens |
| Best For | Detailed analysis | General use |

**Recommendation**: Use Anthropic Claude for best results with resume tailoring.

## Cost Estimates

- **Per resume**: $0.01 - $0.05 (depending on provider and length)
- **100 resumes/month**: $1 - $5
- Both providers offer free trial credits

## Tips for Best Results

### Job Description File
- Include the complete job posting
- Keep original formatting
- Include company info if available
- Add any relevant context

### User Experience File
- Be comprehensive - include all relevant experience
- Use bullet points for achievements
- Include metrics and numbers where possible
- Mention all technical skills and tools
- Include education, certifications, awards

### Writing Style
The AI will:
- Start bullets with strong action verbs
- Quantify achievements (percentages, numbers, dollars)
- Use industry-standard terminology
- Match the tone of the job description
- Prioritize most relevant experience

## Troubleshooting

### API Key Errors
```
Error: ANTHROPIC_API_KEY not set in .env file
```
**Solution**: Add your API key to `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### File Not Found
```
Error: Failed to read file job_description.txt
```
**Solution**: Ensure files exist in the project directory:
```bash
ls -la job_description.txt user_experience.txt
```

### Invalid JSON Response
```
Error: JSON parsing failed
```
**Solution**:
- Check your API credits/quota
- Try using a different model
- Ensure stable internet connection

### Rate Limits
If you hit rate limits, wait a few seconds and retry, or upgrade your API plan.

## Advanced Configuration

### Custom Models

```javascript
const generator = new ResumeAIGenerator({
    provider: 'anthropic',
    model: 'claude-3-opus-20240229'  // More powerful but slower
});
```

### Custom Prompts

You can modify the prompt in `layer1_ai_generation.js` line 109 to adjust:
- Writing style
- Content focus
- Keyword density
- Output structure

## Next Steps

After generating `tailored_content.json`:

1. **Review the output** - Ensure accuracy and relevance
2. **Proceed to Layer 2** - Generate HTML from JSON
3. **Proceed to Layer 3** - Convert HTML to PDF

## Integration with Full Pipeline

```javascript
const ResumeAIGenerator = require('./layer1_ai_generation');
const HTMLGenerator = require('./layer2_html_generation');  // Coming next
const PDFGenerator = require('./generatePDF');

async function fullPipeline() {
    // Layer 1: AI Generation
    const aiGen = new ResumeAIGenerator();
    const content = await aiGen.generate(
        'job_description.txt',
        'user_experience.txt',
        'tailored_content.json'
    );

    // Layer 2: HTML Generation (next step)
    const htmlGen = new HTMLGenerator();
    await htmlGen.generate('tailored_content.json', 'resume.html');

    // Layer 3: PDF Generation
    const { generatePDF } = require('./generatePDF');
    await generatePDF('resume.html', { filename: 'resume.pdf' });
}
```

## Security & Privacy

- API keys are stored locally in `.env` (never commit to git)
- Your resume data is sent to the AI provider's API
- Generated content is saved locally only
- Consider using environment variables in production

## Examples

See the included sample files:
- `job_description.txt` - Example job posting
- `user_experience.txt` - Example candidate background
- `required_format.json` - Expected output structure

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the console error messages
3. Verify API key and file paths
4. Check AI provider status pages

## License

ISC
