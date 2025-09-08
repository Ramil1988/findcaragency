import React from "react";
import styled from "styled-components";

// Retained as a minimal component in case of imports elsewhere.
const Recommendations = ({ estimatedCost, setEstimatedCost }) => (
  <RecommendationsContainer>
    <InputWrapper>
      <label>Estimated Cost:</label>
      <input
        type="number"
        value={estimatedCost}
        onChange={(e) => setEstimatedCost(e.target.value)}
        placeholder="Enter estimated cost"
      />
    </InputWrapper>
  </RecommendationsContainer>
);

export default Recommendations;

// Styled Components
const RecommendationsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;

  label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }

  input,
  textarea {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 10px;
    font-size: 14px;

    &:focus {
      border-color: #007bff;
      outline: none;
    }
  }
`;
