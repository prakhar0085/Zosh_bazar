import React from "react";
import ReactMarkdown from "react-markdown";

interface ResponseMessageProps {
  message: string;
}

const ResponseMessage: React.FC<ResponseMessageProps> = ({ message }) => {
  return (
    <div className="response-message">
      <ReactMarkdown>{message}</ReactMarkdown>
    </div>
  );
};

export default ResponseMessage;
