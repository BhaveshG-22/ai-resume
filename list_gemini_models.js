const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listGeminiModels() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.log('❌ GEMINI_API_KEY not found in .env');
        return;
    }

    console.log('\n📋 Listing available Gemini models...\n');
    console.log(`Using API key: ${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 10)}\n`);

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Try to list models via API
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
        const data = await response.json();

        if (data.models) {
            console.log(`✅ Found ${data.models.length} models:\n`);
            data.models.forEach((model, index) => {
                console.log(`${index + 1}. ${model.name}`);
                console.log(`   Display name: ${model.displayName}`);
                console.log(`   Supported methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
                console.log('');
            });

            // Filter models that support generateContent
            const contentGenModels = data.models.filter(m =>
                m.supportedGenerationMethods?.includes('generateContent')
            );

            console.log(`\n✨ Models supporting generateContent (${contentGenModels.length}):`);
            contentGenModels.forEach(m => {
                const modelId = m.name.replace('models/', '');
                console.log(`   - ${modelId}`);
            });

        } else if (data.error) {
            console.log('❌ Error from API:');
            console.log(JSON.stringify(data.error, null, 2));
        } else {
            console.log('⚠️  Unexpected response:');
            console.log(JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.log('❌ Failed to list models:');
        console.log(error.message);
    }
}

listGeminiModels();
