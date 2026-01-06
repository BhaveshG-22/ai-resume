const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║              API KEY TESTING SCRIPT                           ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Test prompt
const testPrompt = "Say 'Hello! API key is working.' in 5 words or less.";

// Test Claude (Anthropic)
async function testClaude() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Testing Claude (Anthropic) API Key...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'your-anthropic-api-key-here') {
        console.log('❌ ANTHROPIC_API_KEY not configured in .env\n');
        return false;
    }

    console.log(`Key preview: ${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 10)}`);

    try {
        const client = new Anthropic({ apiKey });

        const response = await client.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 100,
            messages: [{
                role: 'user',
                content: testPrompt
            }]
        });

        console.log(`✅ SUCCESS: ${response.content[0].text}`);
        console.log(`   Model: ${response.model}`);
        console.log(`   Tokens used: ${response.usage.input_tokens} in, ${response.usage.output_tokens} out\n`);
        return true;
    } catch (error) {
        console.log(`❌ FAILED: ${error.message}\n`);
        return false;
    }
}

// Test OpenAI
async function testOpenAI() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Testing OpenAI API Key...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === 'your-openai-api-key-here') {
        console.log('❌ OPENAI_API_KEY not configured in .env\n');
        return false;
    }

    console.log(`Key preview: ${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 10)}`);

    const client = new OpenAI({ apiKey });

    // Try multiple models (cheapest/most accessible first)
    const modelsToTry = ['gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4o', 'gpt-4-turbo', 'gpt-4'];

    for (const model of modelsToTry) {
        try {
            console.log(`   Trying model: ${model}...`);

            const response = await client.chat.completions.create({
                model: model,
                messages: [{
                    role: 'user',
                    content: testPrompt
                }],
                max_tokens: 50
            });

            console.log(`✅ SUCCESS with ${model}: ${response.choices[0].message.content}`);
            console.log(`   Tokens used: ${response.usage.prompt_tokens} in, ${response.usage.completion_tokens} out\n`);
            return true;
        } catch (error) {
            console.log(`   ❌ ${model} failed: ${error.message}`);
        }
    }

    console.log('❌ FAILED: No OpenAI models accessible\n');
    return false;
}

// Test Gemini
async function testGemini() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Testing Gemini (Google) API Key...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
        console.log('❌ GEMINI_API_KEY not configured in .env\n');
        return false;
    }

    console.log(`Key preview: ${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 10)}`);

    const client = new GoogleGenerativeAI(apiKey);

    // Try multiple models
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-2.0-flash-exp'];

    for (const modelName of modelsToTry) {
        try {
            console.log(`   Trying model: ${modelName}...`);

            const model = client.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(testPrompt);
            const response = await result.response;
            const text = response.text();

            console.log(`✅ SUCCESS with ${modelName}: ${text}`);
            console.log(`   Response received successfully\n`);
            return true;
        } catch (error) {
            console.log(`   ❌ ${modelName} failed: ${error.message}`);
        }
    }

    console.log('❌ FAILED: No Gemini models accessible');
    console.log('   Note: Your API key might be suspended or invalid.');
    console.log('   Get a new key at: https://aistudio.google.com/app/apikey\n');
    return false;
}

// Run all tests
async function runAllTests() {
    const results = {
        claude: false,
        openai: false,
        gemini: false
    };

    results.claude = await testClaude();
    results.openai = await testOpenAI();
    results.gemini = await testGemini();

    // Summary
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                       TEST SUMMARY                            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`Claude (Anthropic):  ${results.claude ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`OpenAI:              ${results.openai ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`Gemini (Google):     ${results.gemini ? '✅ WORKING' : '❌ FAILED'}`);

    const workingCount = Object.values(results).filter(r => r).length;

    console.log('\n─────────────────────────────────────────────────────────────────');
    console.log(`Total: ${workingCount}/3 API keys working`);
    console.log('─────────────────────────────────────────────────────────────────\n');

    if (workingCount === 3) {
        console.log('🎉 All API keys are working! Your resume scoring will use all 3 providers.\n');
    } else if (workingCount >= 1) {
        console.log('⚠️  Some API keys are not working. Resume scoring will use available providers only.\n');
    } else {
        console.log('❌ No API keys are working. Please check your .env configuration.\n');
    }

    if (!results.gemini) {
        console.log('💡 To fix Gemini:');
        console.log('   1. Visit: https://aistudio.google.com/app/apikey');
        console.log('   2. Create a new API key');
        console.log('   3. Update GEMINI_API_KEY in your .env file\n');
    }

    if (!results.openai) {
        console.log('💡 To fix OpenAI:');
        console.log('   1. Check your API key has billing enabled');
        console.log('   2. Verify you have access to at least gpt-3.5-turbo');
        console.log('   3. Visit: https://platform.openai.com/api-keys\n');
    }
}

// Run tests
runAllTests().catch(console.error);
