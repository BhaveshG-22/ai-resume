# AI Resume Generator

A powerful 3-layer AI-powered resume generator that creates tailored, ATS-optimized resumes from job descriptions. Available as both a **web interface** and **CLI tools**.

## 🚀 Quick Start

### Web Interface (Recommended)

```bash
npm install
npm start
```

Open **http://localhost:3000** in your browser and paste:
1. Job description
2. Your experience
3. Click "Generate My Resume"

Done! Download your tailored PDF resume in ~60 seconds.

### CLI Usage

```bash
# Full pipeline
node generate_resume.js

# Individual layers
npm run layer1  # AI content generation
npm run layer2  # HTML generation
npm run layer3  # PDF conversion
```

## ✨ Features

- 🤖 **AI-Powered**: Uses Claude or GPT to analyze and tailor content
- 🎯 **ATS-Optimized**: Keywords and formatting for applicant tracking systems
- 🎨 **Professional Design**: Clean, modern resume templates
- 📄 **PDF Export**: High-quality PDF via Api2Pdf
- 🌐 **Web Interface**: No file management, paste and generate
- ⚡ **Fast**: Generate resumes in ~60 seconds
- 🔐 **Stateless**: No data storage, privacy-focused
- 💰 **Affordable**: ~$0.02 per resume

## 🏗️ Architecture

```
USER INPUT (Job Description + Experience)
            ↓
┌───────────────────────────────────────────────┐
│  LAYER 1: AI Content Generation               │
│  - Analyzes job requirements                  │
│  - Tailors experience to match                │
│  - Generates structured JSON                  │
│  → Output: tailored_content.json              │
└───────────────────────────────────────────────┘
            ↓
┌───────────────────────────────────────────────┐
│  LAYER 2: HTML Generation                     │
│  - Applies professional styling               │
│  - Formats content beautifully                │
│  - Generates complete HTML document           │
│  → Output: resume.html                        │
└───────────────────────────────────────────────┘
            ↓
┌───────────────────────────────────────────────┐
│  LAYER 3: PDF Conversion                      │
│  - Renders HTML to PDF                        │
│  - Print-optimized output                     │
│  - Hosted for 24 hours                        │
│  → Output: resume.pdf                         │
└───────────────────────────────────────────────┘
```

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/yourusername/airesume.git
cd airesume

# Install dependencies
npm install

# Configure API keys in .env
cp .env.example .env
# Edit .env with your API keys
```

## ⚙️ Configuration

Create a `.env` file:

```env
# AI Provider (choose one)
AI_PROVIDER=anthropic

# Anthropic Claude API Key
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Or OpenAI API Key
# OPENAI_API_KEY=sk-your-key-here

# Api2Pdf API Key (for PDF generation)
PORTAL_API_KEY=your-api2pdf-key

# Server Port (optional, default: 3000)
PORT=3000
```

**Get API Keys:**
- Anthropic: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/api-keys
- Api2Pdf: https://portal.api2pdf.com/

## 🌐 Web Interface

### Start Server
```bash
npm start
```

### Features
- ✅ No file management needed
- ✅ Paste job description and experience
- ✅ Real-time progress tracking
- ✅ Download PDF directly
- ✅ Mobile responsive
- ✅ Example data loader

See [WEB_INTERFACE_README.md](WEB_INTERFACE_README.md) for details.

## 💻 CLI Usage

### Full Pipeline

```bash
# Generate resume from text files
node generate_resume.js

# Custom files
node generate_resume.js --job my_job.txt --experience my_exp.txt --output my-resume.pdf

# Use different AI provider
node generate_resume.js --provider openai --model gpt-4
```

### Individual Layers

**Layer 1: AI Content Generation**
```bash
npm run layer1
# or
node layer1_ai_generation.js --job job_description.txt --experience user_experience.txt
```

Input: `job_description.txt`, `user_experience.txt`
Output: `tailored_content.json`

**Layer 2: HTML Generation**
```bash
npm run layer2
# or
node layer2_html_generation.js --json tailored_content.json --output resume.html
```

Input: `tailored_content.json`, `template.txt`
Output: `resume.html`

**Layer 3: PDF Conversion**
```bash
npm run layer3
# or
node generatePDF.js resume.html --filename my-resume.pdf
```

Input: `resume.html`
Output: PDF URL (valid 24 hours)

## 📚 Documentation

- [LAYER1_README.md](LAYER1_README.md) - AI Content Generation details
- [LAYER2_README.md](LAYER2_README.md) - HTML Generation details
- [WEB_INTERFACE_README.md](WEB_INTERFACE_README.md) - Web API documentation

## 🎯 Use Cases

### Individual Job Seekers
1. Paste job description from LinkedIn/Indeed
2. Enter your experience and skills
3. Get tailored resume instantly
4. Download and apply

### Recruiters
- Generate multiple resumes for different positions
- Tailor candidate profiles to specific roles
- Fast turnaround for client submissions

### Career Services
- Help students create professional resumes
- Tailor resumes for different industries
- Teach ATS optimization

### Developers
- API integration for resume services
- Batch processing via CLI
- Custom styling and templates

## 💰 Costs

Per resume generation:
- **Layer 1 (AI)**: $0.01 - $0.05
- **Layer 2 (AI)**: $0.005 - $0.01
- **Layer 3 (PDF)**: ~$0.0006
- **Total**: ~$0.015 - $0.06 per resume

Both AI providers offer free trial credits.

## 🔐 Security & Privacy

- ✅ API keys stored in `.env` (gitignored)
- ✅ No user data stored on server
- ✅ Temporary files auto-deleted
- ✅ PDFs hosted for 24 hours only
- ✅ Stateless architecture
- ⚠️ Data sent to AI provider APIs

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **AI**: Anthropic Claude / OpenAI GPT
- **PDF**: Api2Pdf (Chrome/wkhtmltopdf)
- **Frontend**: HTML, CSS, JavaScript (Vanilla)

## 📊 Performance

- **Processing Time**: 30-60 seconds
- **Layer 1**: 15-30s (AI content generation)
- **Layer 2**: 10-20s (HTML generation)
- **Layer 3**: 3-5s (PDF conversion)

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test Layer 1 only
node layer1_ai_generation.js --analyze-only

# Test with example data
# Click "Load Example Data" in web interface
```

## 🚢 Deployment

### Heroku
```bash
heroku create your-app-name
git push heroku main
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
heroku config:set PORTAL_API_KEY=...
heroku open
```

### Docker
```bash
docker build -t ai-resume-generator .
docker run -p 3000:3000 --env-file .env ai-resume-generator
```

### VPS/Cloud
```bash
npm install -g pm2
pm2 start server.js --name ai-resume
pm2 save
pm2 startup
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 Example Workflow

### Web Interface
1. Visit http://localhost:3000
2. Click "Load Sample Resume Data"
3. Click "Generate My Resume"
4. Wait ~60 seconds
5. Download PDF

### CLI
1. Create `job_description.txt` with job posting
2. Create `user_experience.txt` with your background
3. Run `node generate_resume.js`
4. Download PDF from URL

## 🐛 Troubleshooting

### API Errors
- Check `.env` has valid API keys
- Verify API credits/quota
- Check internet connection

### Server Issues
- Port 3000 in use? Change PORT in `.env`
- Missing dependencies? Run `npm install`

### PDF Generation Fails
- Check PORTAL_API_KEY is valid
- Verify Api2Pdf account has credits

## 📖 How It Works

### Layer 1: AI Content Generation
1. Reads job description and user experience
2. Analyzes job requirements and keywords
3. Maps user's experience to job needs
4. Rewrites content with ATS optimization
5. Outputs structured JSON

### Layer 2: HTML Generation
1. Takes JSON from Layer 1
2. Applies professional styling template
3. Generates complete HTML document
4. Optimized for PDF conversion

### Layer 3: PDF Conversion
1. Takes HTML from Layer 2
2. Renders to PDF via Api2Pdf
3. Returns download URL
4. PDF available for 24 hours

## 🎓 Learning Resources

- [Anthropic Claude Documentation](https://docs.anthropic.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Api2Pdf Documentation](https://www.api2pdf.com/documentation/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

## 📄 License

ISC

## 🙏 Acknowledgments

- Anthropic Claude for AI content generation
- OpenAI GPT for alternative AI provider
- Api2Pdf for PDF conversion service
- Express.js for web framework

## 📧 Support

For issues, questions, or feature requests:
1. Check documentation in `/docs`
2. Review troubleshooting sections
3. Open an issue on GitHub

---

**Made with ❤️ by developers, for job seekers**
