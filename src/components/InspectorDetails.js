import React from "react";
import styled from "styled-components";

const InspectorDetails = ({
  inspectorName,
  setInspectorName,
  inspectionDate,
  setInspectionDate,
}) => (
  <InspectorDetailsContainer>
    <InputWrapper>
      <label>Inspector's Name:</label>
      <input
        type="text"
        value={inspectorName}
        onChange={(e) => setInspectorName(e.target.value)}
        placeholder="Enter inspector's name"
      />
    </InputWrapper>
    <InputWrapper>
      <label>Inspection Date:</label>
      <input
        type="date"
        value={inspectionDate}
        onChange={(e) => setInspectionDate(e.target.value)}
      />
    </InputWrapper>
  </InspectorDetailsContainer>
);

export default InspectorDetails;

// Styled Components
const InspectorDetailsContainer = styled.div`
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
    color: #555;
    margin-bottom: 8px;
  }

  input {
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
