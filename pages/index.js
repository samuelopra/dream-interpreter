import Head from 'next/head';
import ChatMessage from '../components/ChatMessage';
import { useState, useEffect } from 'react';

const GenerateButton = ({ loading, onClick, title }) => {
  return (
    <div className='prompt-buttons'>
      <button
        className={loading ? 'generate-button loading' : 'generate-button'}
        onClick={onClick}
        disabled={loading} // disable button when loading
      >
        <span className='button-content'>{loading ? '...' : title}</span>
      </button>
    </div>
  );
};

const Home = () => {
  const [userInput, setUserInput] = useState('');

  const [apiOutput, setApiOutput] = useState({
    dream: ``,
    image: [],
  });

  const [isGenerating, setIsGenerating] = useState({
    dream: false,
    image: false,
  });

  const [chatHistory, setChatHistory] = useState([]);


  const callGenerateEndpoint = async () => {
    // Add loading message to chat history
    const newChatHistory = [
      ...chatHistory,
      { role: 'user', content: userInput },
      { role: 'assistant', content: 'Generating...' },
    ];
    setChatHistory(newChatHistory);

    // Remove the 'Generating...' from the button and disable it
    setIsGenerating({ ...isGenerating, dream: true });

    const response = await fetch('/api/generate/dream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatHistory: newChatHistory }),
    });

    const data = await response.json();
    const { output } = data;

    // Update chat history with the response from the API, removing the 'Generating...' message
    setChatHistory([...chatHistory, { role: 'user', content: userInput }, { role: 'assistant', content: output?.message?.content }]);
    setApiOutput({ ...apiOutput, dream: output?.message?.content });
    setIsGenerating({ ...isGenerating, dream: false });  // Set to false when done

    // Clear userInput after message is sent
    setUserInput('');
  };
  
  useEffect(() => {
    if (apiOutput.dream) {
      setIsGenerating((state) => ({
        ...state,
        dream: false, // set to false when dream is done
      }));
     //callGenerateImageEndpoint();
    }
  }, [apiOutput.dream]);

  const onUserChangedText = (event) => {
    setUserInput(event.target.value);
  };

  return (
    <div className='root'>
      <Head>
        <title>Dream Interperpeter AI</title>
      </Head>
      <div className='container'>
        <div className='header'>
          <div className='header-title'>
            <h1>Dream Interpreter</h1>
          </div>
          <div className='header-subtitle'>
            <h2>
              Dreams are often not literal. Write a message to Sam, the dream
              interpreting expert to find out what they really mean.
            </h2>
          </div>
        </div>
        <div className='chat-container'>
          {chatHistory.map((msg, index) => (
            <ChatMessage key={index} role={msg.role} content={msg.content} />
          ))}
          <textarea
            placeholder='Describe your dream here...'
            className='chat-input'
            value={userInput}
            onChange={onUserChangedText}
          />
        </div>
        <GenerateButton
          title='Send'
          loading={isGenerating.dream}
          onClick={callGenerateEndpoint}
        ></GenerateButton>
      </div>
    </div>
  );
};

export default Home;
