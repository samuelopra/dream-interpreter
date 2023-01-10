import Head from 'next/head';
import Image from 'next/image';
import paramintLogo from '../assets/paramint-leaf.png';
import { useState } from 'react';


const GenerateButton = ({ loading, onClick, title }) => {
  return (<div className='prompt-buttons'>
    <a
      className={
        loading ? 'generate-button loading' : 'generate-button'
      }
      onClick={onClick}
    >
      <div className='generate'>
          <p>{loading? 'Generating ...' : title}</p>
      </div>
    </a></div>)
}

// render image using Image component
const GeneratedImage = ({ imageBlob }) => {
  return (<Image src={imageBlob} width="200" height="200" />)
}

const Home = () => {
  const [userInput, setUserInput] = useState('');

  const [apiOutput, setApiOutput] = useState({
    dream: '',
    image: ''
  });

  const [isGenerating, setIsGenerating] = useState({
    dream: false,
    image: false
  });

  const callGenerateEndpoint = async () => {
    setIsGenerating({
      ...isGenerating,
      dream: true
    });

    console.log('Calling OpenAI...');
    const response = await fetch('/api/generate/dream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput }),
    });

    const data = await response.json();
    const { output } = data;
    console.log('OpenAI replied...', output.text);

    setApiOutput({
      ...apiOutput,
      dream: `${output.text}`
    });
    setIsGenerating({
      ...isGenerating,
      dream: false
    });
  };


  const callGenerateImageEndpoint = async () => {
    setIsGenerating({
      ...isGenerating,
      image: true
    });

    console.log('Calling OpenAI...');
    const response = await fetch('/api/generate/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput: apiOutput.dream }),
    });

    const data = await response.json();
    const { output } = data;
    console.log('OpenAI replied...', output);
    setApiOutput({
      ...apiOutput,
      image: `${output}`
    });
    setIsGenerating({
      ...isGenerating,
      image: false,
    });
  };


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
              Dreams are often not literal. Write a message to Freud, the dream
              interpreter to find out what they really mean
            </h2>
          </div>
        </div>
        <div className='prompt-container'>
          <textarea
            placeholder='start typing here'
            className='prompt-box'
            value={userInput}
            onChange={onUserChangedText}
          />
        </div>
        <GenerateButton title="Generate" loading={isGenerating.dream} onClick={callGenerateEndpoint}></GenerateButton>
      </div>
      {apiOutput.dream && (
        <div className='output'>
          <div className='output-header-container'>
            <div className='output-header'>
              <h3>Output</h3>
            </div>
          </div>
          <div className='output-content'>
            <p>{apiOutput.dream}</p>
          </div>
        </div>
      )}
      {apiOutput.dream && (<GenerateButton title="Generate an image of Your dream" loading={isGenerating.image} onClick={callGenerateImageEndpoint}></GenerateButton>)}
      {apiOutput.image && !isGenerating.image && !isGenerating.dream && (
        <GeneratedImage imageBlob={apiOutput.image}></GeneratedImage>
      )}

      {/* <div className='badge-container grow'>
        <a href='https://paramint.digital' target='_blank' rel='noreferrer'>
          <div className='badge'>
            <Image src={paramintLogo} alt='paramint logo' />
            <p>dream interpreter by Paramint</p>
          </div>
        </a>
      </div> */}

    </div>
  );
};

export default Home;
