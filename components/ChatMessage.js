const ChatMessage = ({ role, content }) => {
  return (
    <div className={`chat-message ${role}`}>
      <p>{content}</p>
    </div>
  );
};

export default ChatMessage;