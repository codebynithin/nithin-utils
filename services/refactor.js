const { GoogleGenerativeAI } = require('@google/generative-ai');
const { openAIKey } = require('./utils.js');
const chalk = require('chalk');

const refactorText = async function (text) {
  try {
    const genAI = new GoogleGenerativeAI(openAIKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
  Refactor this text into a professional version.
  Provide exactly 3 different suggestions.
  Format the output as follows:
  1. [First suggestion]
  2. [Second suggestion]
  3. [Third suggestion]
  
  Make each suggestion clear, concise, and professional.
  Keep the core meaning but vary the tone and structure.

  Text: "${text}"
  `;
    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    console.log('Error during text refactoring:', error);
    throw error;
  }
};
const refactor = async (text) => {
  console.log(chalk.blue('🔄 Refactoring text...\n'));
  const suggestions = await refactorText(text);
  console.log(chalk.green('✅ Professional Suggestions:\n'));
  console.log(chalk.white(suggestions));
};

module.exports = { refactor };
