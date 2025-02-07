import React from "react";
import styled from "styled-components";

const TechnicalDetails = ({
  paintThickness,
  setPaintThickness,
  bodyCondition,
  setBodyCondition,
  chassisCondition,
  setChassisCondition,
  geometryIssues,
  setGeometryIssues,
  electronicsStatus,
  setElectronicsStatus,
  airConditioningStatus,
  setAirConditioningStatus,
}) => (
  <TechnicalDetailsContainer>
    <InputWrapper>
      <label>Paint Thickness (in μm):</label>
      <textarea
        value={paintThickness}
        onChange={(e) => setPaintThickness(e.target.value)}
        placeholder="Enter paint thickness details"
        rows="2"
      />
    </InputWrapper>
    <InputWrapper>
      <label>Body Condition:</label>
      <textarea
        value={bodyCondition}
        onChange={(e) => setBodyCondition(e.target.value)}
        placeholder="Enter body condition details"
        rows="4"
      />
    </InputWrapper>
    <InputWrapper>
      <label>Chassis Condition:</label>
      <textarea
        value={chassisCondition}
        onChange={(e) => setChassisCondition(e.target.value)}
        placeholder="Enter chassis condition details"
        rows="4"
      />
    </InputWrapper>
    <InputWrapper>
      <label>Geometry Issues:</label>
      <textarea
        value={geometryIssues}
        onChange={(e) => setGeometryIssues(e.target.value)}
        placeholder="Enter geometry issues"
        rows="4"
      />
    </InputWrapper>
    <InputWrapper>
      <label>Electronics Status:</label>
      <textarea
        value={electronicsStatus}
        onChange={(e) => setElectronicsStatus(e.target.value)}
        placeholder="Enter electronics status"
        rows="4"
      />
    </InputWrapper>
    <InputWrapper>
      <label>Air Conditioning Status:</label>
      <textarea
        value={airConditioningStatus}
        onChange={(e) => setAirConditioningStatus(e.target.value)}
        placeholder="Enter air conditioning status"
        rows="4"
      />
    </InputWrapper>
  </TechnicalDetailsContainer>
);

export default TechnicalDetails;

// Styled Components
const TechnicalDetailsContainer = styled.div`
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
