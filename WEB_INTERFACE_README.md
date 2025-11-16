# Web Interface - AI Resume Generator

A stateless web interface for generating tailored resumes without needing local text files. Users can paste their job description and experience directly in the browser.

## 🚀 Quick Start

### 1. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### 2. Open in Browser

Navigate to: **http://localhost:3000**

### 3. Fill in the Form

- **Job Description** (Required): Paste the complete job posting
- **Your Experience** (Required): Enter your work history, skills, education
- **Template** (Optional): Customize styling (uses professional default if empty)
- **PDF Filename** (Optional): Default is `resume.pdf`

### 4. Generate Resume

Click **"Generate My Resume"** and wait 30-60 seconds for:
1. AI to analyze and tailor content
2. HTML to be generated
3. PDF to be created

### 5. Download

Click the **"Download Your Resume"** button in the success message.

## 🎯 Features

### Stateless Design
- ✅ No file storage on server
- ✅ No user accounts needed
- ✅ All inputs via web form
- ✅ Temporary files auto-deleted
- ✅ PDF hosted for 24 hours

### User-Friendly Interface
- ✅ Clean, modern design
- ✅ Mobile responsive
- ✅ Real-time status updates
- ✅ Example data loader
- ✅ Progress indicators
- ✅ Error handling with helpful messages

### 3-Layer Pipeline Visualization
Shows the processing flow:
1. **Layer 1**: AI Content Generation
2. **Layer 2**: HTML Formatting
3. **Layer 3**: PDF Conversion

## 📡 API Endpoints

### `POST /api/generate-resume`

Generate a complete resume from job description and experience.

**Request Body:**
```json
{
  "jobDescription": "Technology Analyst I\nLocation: Vancouver...",
  "userExperience": "John Doe\nSoftware Developer...",
  "template": "Optional styling guidelines...",
  "pdfFilename": "my-resume.pdf",
  "provider": "anthropic"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pdfUrl": "https://storage.googleapis.com/...",
    "pdfSize": 0.156,
    "cost": 0.0006,
    "responseId": "3d9f6c28-...",
    "duration": "45.23s",
    "tailoredContent": { ... }
  }
}
```

### `POST /api/layer1-only`

Test Layer 1 only (AI content generation without HTML/PDF).

**Request Body:**
```json
{
  "jobDescription": "...",
  "userExperience": "...",
  "provider": "anthropic"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "personalInfo": { ... },
    "summary": { ... },
    "experience": [ ... ]
  }
}
```

### `GET /api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "3-Layer AI Resume Generator API",
  "layers": [
    "AI Content Generation",
    "HTML Generation",
    "PDF Conversion"
  ]
}
```

## 💻 Using the API Programmatically

### cURL Example

```bash
curl -X POST http://localhost:3000/api/generate-resume \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "Software Developer\n- Python\n- React\n- AWS",
    "userExperience": "John Doe\nSenior Developer at Tech Corp\n..."
  }'
```

### JavaScript Fetch Example

```javascript
const response = await fetch('http://localhost:3000/api/generate-resume', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jobDescription: '...',
    userExperience: '...',
    pdfFilename: 'resume.pdf'
  })
});

const result = await response.json();
console.log('PDF URL:', result.data.pdfUrl);
```

### Python Example

```python
import requests

response = requests.post('http://localhost:3000/api/generate-resume', json={
    'jobDescription': '...',
    'userExperience': '...',
    'pdfFilename': 'resume.pdf'
})

data = response.json()
print(f"PDF URL: {data['data']['pdfUrl']}")
```

## 🔧 Configuration

### Environment Variables

Required in `.env`:
```env
# AI Provider (anthropic or openai)
AI_PROVIDER=anthropic

# Anthropic API Key
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Or OpenAI API Key
# OPENAI_API_KEY=sk-your-key-here

# Api2Pdf API Key (for PDF conversion)
PORTAL_API_KEY=your-api2pdf-key

# Server Port (optional, default: 3000)
PORT=3000
```

## 📂 Project Structure

```
airesume/
├── server.js                  # Express server
├── public/
│   └── index.html            # Frontend interface
├── layer1_ai_generation.js   # AI content generation
├── layer2_html_generation.js # HTML generation
├── generatePDF.js            # PDF conversion
├── required_format.json      # JSON schema
└── temp/                     # Auto-deleted temp files
```

## 🎨 Frontend Features

### Load Example Data
Click "Load Sample Resume Data" to populate form with example:
- Technology Analyst job description
- Sample candidate experience
- Demonstrates proper formatting

### Advanced Options
Toggle to reveal:
- Custom styling template input
- PDF filename customization

### Status Messages

**Loading:**
- Shows spinner
- Lists current processing steps
- Estimated time: 30-60 seconds

**Success:**
- Shows completion message
- Displays processing time, file size, cost
- Download button with PDF URL
- 24-hour availability notice

**Error:**
- Clear error message
- Troubleshooting checklist
- Retry button

## 🔐 Security & Privacy

### Data Handling
- ✅ No data stored on server
- ✅ Temp files deleted after generation
- ✅ API keys stored in `.env` (not exposed to frontend)
- ✅ CORS enabled (configure as needed)

### Privacy Considerations
- User data sent to AI provider (Anthropic/OpenAI)
- PDFs hosted on Api2Pdf servers for 24 hours
- No user tracking or analytics
- Stateless - no session management

### Production Recommendations
1. Add rate limiting
2. Configure CORS properly
3. Add authentication if needed
4. Use HTTPS
5. Monitor API usage and costs
6. Add input validation and sanitization

## 🚀 Deployment

### Local Development
```bash
npm start
```
Server runs on http://localhost:3000

### Production (Heroku)
```bash
# Install Heroku CLI and login
heroku create your-app-name
git push heroku main
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
heroku config:set PORTAL_API_KEY=...
```

### Production (Docker)
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t ai-resume-generator .
docker run -p 3000:3000 --env-file .env ai-resume-generator
```

### Production (VPS/Cloud)
```bash
# Install Node.js
# Clone repository
# Install dependencies
npm install

# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start server.js --name ai-resume

# Configure nginx reverse proxy
# Set up SSL with Let's Encrypt
```

## ⚡ Performance

### Processing Time
- **Layer 1** (AI): 15-30 seconds
- **Layer 2** (HTML): 10-20 seconds
- **Layer 3** (PDF): 3-5 seconds
- **Total**: ~30-60 seconds

### Cost per Resume
- **Layer 1 AI**: $0.01 - $0.05
- **Layer 2 AI**: $0.005 - $0.01
- **Layer 3 PDF**: $0.0005 - $0.001
- **Total**: ~$0.015 - $0.06 per resume

### Optimization Tips
1. Cache common templates
2. Use faster AI models for testing
3. Implement request queuing for high traffic
4. Add caching for similar job descriptions

## 🐛 Troubleshooting

### Server Won't Start
```
Error: Cannot find module 'express'
```
**Solution**: Run `npm install`

### API Errors
```
Error: ANTHROPIC_API_KEY not set
```
**Solution**: Check `.env` file has valid API key

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Kill process on port 3000 or change PORT in .env

### PDF Generation Fails
```
Error: Failed to generate PDF
```
**Solution**: Check PORTAL_API_KEY is valid and has credits

## 📊 Monitoring

### Logs
Server logs show:
- Incoming requests
- Processing stages
- Errors and warnings
- PDF URLs

### Health Check
```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "3-Layer AI Resume Generator API"
}
```

## 🎯 Next Steps

### Enhancements to Consider
1. **User Accounts** - Save generated resumes
2. **Templates** - Multiple design templates
3. **Preview** - Show HTML before PDF
4. **Analytics** - Track usage and success rates
5. **Batch Processing** - Multiple resumes at once
6. **Email Delivery** - Send PDF via email
7. **Version History** - Track resume iterations
8. **A/B Testing** - Compare different versions

## 📚 Related Documentation

- [LAYER1_README.md](LAYER1_README.md) - AI Content Generation
- [LAYER2_README.md](LAYER2_README.md) - HTML Generation
- [README.md](README.md) - Main documentation

## 🤝 Support

For issues:
1. Check server logs
2. Verify API keys in `.env`
3. Test with example data
4. Check API provider status pages

## License

ISC
