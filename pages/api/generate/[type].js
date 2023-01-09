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

const basePromptPrefix = `Write me a Freudian analysis in a statement form of the following dream in a casual tone spoken by a 23-year-old from Brooklyn, New York:

Dream: `;

const generateGPT3Res = async (prompt) => {
    return await openai.createCompletion({
        model: 'text-davinci-002',
        prompt,
        temperature: 0.8,
        max_tokens: 500,
    });
}

const handler = async (req, res) => {
    const { type } = req.query;

    switch (type){
        case 'dream':
            return generateDream(req, res);
        case 'image':
            return generateImage(req, res);
        default:
            res.status(404).json({output: 'Invalid request'})
    }
};

const generateDream = async (req, res) => {
    console.log(`API: ${basePromptPrefix}${req.body.userInput}`);

    const finalUserInput = addPeriod(req.body.userInput);
    const gpt3Prompt = `${basePromptPrefix}${finalUserInput}`
    ;
    console.log(`Final dream prompt: `, gpt3Prompt);
    const baseCompletion = await generateGPT3Res(gpt3Prompt);
    const basePromptOutput = baseCompletion.data.choices.pop();
    res.status(200).json({ output: basePromptOutput });
}

const generateImage = async (req, res) => {
    // input consist of the dream that we previously generated
    const userInput = req?.body?.userInput;
    if(!userInput) {
        res.status(403).json({
            output: 'Invalid user input.'
        })
    }

    const prompt = `Generate a DALE-2 image generation prompt for this text:
    Text: ${userInput}`
    console.log(`Final image gpt3 prompt: `, prompt)
    // generate a DALE 2 prompt
    const gpt3res = await generateGPT3Res(prompt)
    const dale2prompt = gpt3res.data.choices.pop();
    console.log(`Final DALE2 prompt: `, dale2prompt);
    res.status(200).json({
        output: dale2prompt
    });
}

export default handler;
