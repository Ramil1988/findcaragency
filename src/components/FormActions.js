import React, { useState } from "react";
import styled from "styled-components";
import { OPENAI_API_KEY } from "../config.local";

const FormActions = ({
  inspectorName,
  carMake,
  carModel,
  year,
  mileage,
  relevantReport,
  onChatGptResponse,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatGptResponse, setChatGptResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const processChatGptResponse = (responseText) => {
      return responseText.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
    };

    const prompt = `You are a car inspection assistant. Based on the following diagnostic information, provide a summary and important information:
    Inspector's Name: ${inspectorName}
    Car Make: ${carMake}
    Car Model: ${carModel}
    Year: ${year}
    Mileage: ${mileage}
    Attached Report: ${relevantReport}

    Summary:`;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      let chatGptOutput = data.choices[0].message.content.trim();

      // Process response to replace ** with <b>
      chatGptOutput = processChatGptResponse(chatGptOutput);

      setChatGptResponse(chatGptOutput);

      onChatGptResponse(chatGptOutput);
    } catch (err) {
      console.error("Error fetching ChatGPT response:", err);
      setError("Failed to fetch ChatGPT response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormActionsContainer>
      <SubmitButton type="submit" onClick={handleSubmit}>
        Submit Inspection
      </SubmitButton>
      {loading && <LoadingMessage>Loading ChatGPT response...</LoadingMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {chatGptResponse && (
        <FancyResponseContainer>
          <ResponseTitle>Generated Response</ResponseTitle>
          <FancyResponseContent
            dangerouslySetInnerHTML={{ __html: chatGptResponse }}
          />
        </FancyResponseContainer>
      )}
    </FormActionsContainer>
  );
};

export default FormActions;

// Styled Components
const FormActionsContainer = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SubmitButton = styled.button`
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.p`
  font-size: 14px;
  color: #007bff;
`;

const ErrorMessage = styled.p`
  font-size: 14px;
  color: #ff4d4f;
`;

const FancyResponseContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(90deg, #f0f4ff, #dbe9fa);
  border-radius: 10px;
  border: 1px solid #ddd;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ResponseTitle = styled.h2`
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
`;

const FancyResponseContent = styled.div`
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 14px;
  color: #444;
  background: #ffffff;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  line-height: 1.5;
`;
