import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const addPeriod = (input) => {
  if (!input.match(/[.!?]$/)) {
    input += '.';
  }
  return input;
};

const basePromptPrefix = `
Write me a Freudian analysis of the following dream in a casual tone spoken by a 23-year-old from Brooklyn, New York:

Dream: `;

const generateAction = async (req, res) => {
  // Run first prompt
  console.log(`API: ${basePromptPrefix}${req.body.userInput}`);

  const finalUserInput = addPeriod(req.body.userInput);

  const baseCompletion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `${basePromptPrefix}${finalUserInput}`,
    temperature: 0.8,
    max_tokens: 500,
  });

  const basePromptOutput = baseCompletion.data.choices.pop();

  res.status(200).json({ output: basePromptOutput });
};

export default generateAction;
