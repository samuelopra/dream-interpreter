import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const generateGPT4Chat = async (chatHistory) => {

  if (!Array.isArray(chatHistory)) {
    console.log('chatHistory is not an array:', chatHistory);
    return res.status(400).json({ error: 'chatHistory is not an array' });
  }
  
  // prepend the two messages
  const messages = [
    {role: "user", content: "Act as an expert dream analyzer who is able to explain the meaning of dreams in a very easy to digest way and with casual tone. He is also an expert therapist. The following dream input comes from an individual that is looking to have their dream analyzed by Sam. Sam will analyze the following dream in Sam's 30 year old casual tone from Brooklyn. Sam will do whatever he can to help the individual understand the meaning of the dream and if they ask, he can help them with their problems."},
    {role: "assistant", content: "Sounds good. Let's get started. What is the dream?"},
    ...chatHistory
  ];
  
  return await openai.createChatCompletion({
    model: 'gpt-4',
    messages: messages,
    temperature: 0.8,
    max_tokens: 1000,
  });
};

const handler = async (req, res) => {
  const { type } = req.query;

  switch (type) {
    case 'dream':
      return generateGPT4Dream(req, res);
    case 'image':
      console.log('pause image generation for now');
    default:
      res.status(404).json({ output: 'Invalid request' });
  }
};
const generateGPT4Dream = async (req, res) => {
  const chatHistory = req.body.chatHistory;
  console.log('chatHistory', chatHistory);
  const latestUserMessage = chatHistory.find(message => message.role === 'user');
  const latestUserInput = latestUserMessage ? latestUserMessage.content : null;

  console.log('API:', latestUserInput);

  const gpt4Dream = latestUserInput;
  console.log(`Final dream prompt: `, gpt4Dream);
  const baseChatCompletion = await generateGPT4Chat(chatHistory);
  console.log('baseChatCompletion', baseChatCompletion);
  const baseChatPromptOutput = baseChatCompletion.data.choices.pop();
  res.status(200).json({ output: baseChatPromptOutput });
};

export default handler;
