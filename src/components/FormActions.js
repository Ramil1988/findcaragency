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
  vinResponse,
  techDetailsData,
  expertRecommendations,
  estimatedCost,
  comments,
  engineVolume,
  bodyType,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatGptResponse, setChatGptResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const processChatGptResponse = (responseText) => {
      return responseText.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
    };

    // Build a compact data summary from the UI state for the model
    const labels = {
      intExt: {
        headlights: "Headlights (high/low)",
        taillights: "Taillights",
        turnSignals: "Turn signals",
        brakeLights: "Brake lights",
        hazardLights: "Hazard warning lights",
        instrumentWarnings: "Instrument panel warning lights",
        washersWipers: "Windshield washer spray / wiper operation and blades",
        windshieldCondition: "Windshield condition",
        hornOperation: "Horn operation",
      },
      underHood: {
        engineOil: "Engine oil level",
        coolant: "Coolant level",
        psFluid: "Power steering fluid level",
        washerFluid: "Windshield washer fluid level",
        transmissionFluid: "Transmission fluid level",
        beltsHoses: "External drive belts and radiator hoses",
        filters: "Air / Cabin / Dust & Pollen filter",
      },
      underVehicle: {
        brakeLinesHoses: "Brakes lines / hoses / Parking brake cable",
        shocksStrutsSuspension: "Shock absorbers / Struts / Suspension",
        exhaustSystem: "Exhaust system",
        leaks: "Engine oil and fluid leaks",
        driveShaftCV: "Drive shaft / Constant velocity boots and bands",
        steeringComponents: "Steering gearbox components",
      },
      brakePos: {
        leftFront: "Left Front",
        rightFront: "Right Front",
        leftRear: "Left Rear",
        rightRear: "Right Rear",
      },
    };

    const attention = [];
    const immediate = [];

    if (techDetailsData) {
      const pushFlags = (groupKey) => {
        const group = techDetailsData[groupKey] || {};
        Object.entries(group).forEach(([k, v]) => {
          if (v === "immediate") immediate.push(labels[groupKey][k]);
          else if (v === "attention") attention.push(labels[groupKey][k]);
        });
      };
      ["intExt", "underHood", "underVehicle"].forEach(pushFlags);

      // Brake pads mapping from select values
      const brakeMap = { ge5: ">= 5 mm", between3and4: "3-4 mm", le2: "<= 2 mm" };
      if (techDetailsData.brakeCondition) {
        Object.entries(techDetailsData.brakeCondition).forEach(([pos, key]) => {
          if (key === "le2") immediate.push(`${labels.brakePos[pos]} brake pads (${brakeMap[key]})`);
          else if (key === "between3and4") attention.push(`${labels.brakePos[pos]} brake pads (${brakeMap[key]})`);
        });
      }
    }

    const tires = techDetailsData?.tires || {};
    const tireNotes = [
      techDetailsData?.rotationSuggested ? "Rotation suggested" : null,
      techDetailsData?.alignmentSuggested ? "Alignment suggested" : null,
      techDetailsData?.replacementSuggested ? "Replacement suggested" : null,
      techDetailsData?.seasonalChangeoverSuggested ? "Seasonal changeover suggested" : null,
    ].filter(Boolean);

    const structured = {
      vehicle: {
        make: carMake,
        model: carModel,
        year,
        mileage,
        engineVolume,
        bodyType,
      },
      inspector: inspectorName,
      flags: { immediate, attention },
      brakes: techDetailsData?.brakeCondition || {},
      tires,
      tireNotes,
      recommendations: { expertRecommendations, estimatedCost },
      comments,
      vinResponse,
      extractedReportSnippet: (relevantReport || "").slice(0, 2000),
    };

    const prompt = `You are a vehicle inspection assistant. Create a concise, customer-friendly summary from the provided structured data.

Rules:
- Start with a 1–2 sentence overview.
- Then add sections whose titles end with a colon, e.g. "Immediate Concerns:", "Items to Monitor:", "Tires & Brakes:", "Recommendations:", "Notes:".
- Use bullet points starting with "- " under each section.
- Prioritize items in 'flags.immediate' first, then 'flags.attention'.
- Include any brake positions not at ">= 5 mm" and reflect severity.
- If 'tireNotes' is non-empty, include them as bullets.
- If 'recommendations' or 'comments' are provided, summarize them.
- Be factual and avoid duplication with the same wording.

Data:\n${JSON.stringify(structured, null, 2)}\n`;

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
