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

const basePromptPrefix = `Sam is an expert dream analyzer who is able to explain the meaning of dreams in a very easy to digest way and with casual tone. The following dream input comes from an indivudal that is looking to have their dream analyzed by Sam. Sam will analyze the following dream in Sam's 23 year old casual tone from Brooklyn.
Dream: `;

const generateGPT3Res = async (prompt) => {
  return await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    temperature: 0.8,
    max_tokens: 500,
  });
};

const generateDalle2Image = async (prompt) => {
  return await openai.createImage({
    prompt,
    n: 5,
    size: '1024x1024',
  });
};

const handler = async (req, res) => {
  const { type } = req.query;

  switch (type) {
    case 'dream':
      return generateDream(req, res);
    case 'image':
      return generateImage(req, res);
    default:
      res.status(404).json({ output: 'Invalid request' });
  }
};

const generateDream = async (req, res) => {
  console.log(`API: ${basePromptPrefix}${req.body.userInput}`);
  //const finalUserInput = addPeriod(req.body.userInput);
  const gpt3Prompt = `${basePromptPrefix}${req.body.userInput}
  
  Sam's Analysis:`;
  console.log(`Final dream prompt: `, gpt3Prompt);
  const baseCompletion = await generateGPT3Res(gpt3Prompt);
  const basePromptOutput = baseCompletion.data.choices.pop();
  res.status(200).json({ output: basePromptOutput });
};

const generateImage = async (req, res) => {
  // input consist of the dream that we previously generated
  const userInput = req?.body?.userInput;
  if (!userInput) {
    res.status(403).json({
      output: 'Invalid user input.',
    });
  }

  const basePromptPrefix = `Dream: ${userInput}`;
  const promptEng =
    'Given a dream, generate a DALLE-2 image generation prompt that depicts the scenery of the following dream in 300 characters or less. The prompt should recreate the situation in the dream and use each noun. Use the format: DALLE-2 Prompt: ${answer}';
  const gpt3Prompt = `${basePromptPrefix}
    ${promptEng}`;

  // generate a DALL-E 2 prompt
  const gpt3res = await generateGPT3Res(gpt3Prompt);
  const dalle2prompt = gpt3res.data.choices.pop();

  if (!dalle2prompt) {
    res.status(500).json({
      output: 'Failed to generate prompt for DALLE-2',
    });
  }

  console.log(`Generated DALLE-2 prompt: `, dalle2prompt.text);
  // split it from 'Prompt:' and take the first array element
  const dalle2ImagePrompt = dalle2prompt.text.split('DALLE-2 Prompt: ')[1];

  console.log(dalle2ImagePrompt);
  const response = await generateDalle2Image(` ${dalle2ImagePrompt}, painting`);

  const imgSrc = response?.data?.data;

  // check for error
  if (!imgSrc) {
    res.status(500).json({
      output: 'Failed to generate image',
    });
  }

  res.status(200).json({ output: imgSrc });
};

export default handler;
