import React from "react";
import styled from "styled-components";

const CarDetails = ({
  vinCode,
  setVinCode,
  carMake,
  setCarMake,
  carModel,
  setCarModel,
  year,
  setYear,
  mileage,
  setMileage,
  color,
  setColor,
}) => (
  <CarDetailsContainer>
    <InputWrapper>
      <label>VIN Code:</label>
      <input
        type="text"
        value={vinCode}
        onChange={(e) => setVinCode(e.target.value)}
        placeholder="Enter VIN code"
      />
    </InputWrapper>
    <InputWrapper>
      <label>Car Make:</label>
      <input
        type="text"
        value={carMake}
        onChange={(e) => setCarMake(e.target.value)}
        placeholder="Enter car make"
        required
      />
    </InputWrapper>
    <InputWrapper>
      <label>Car Model:</label>
      <input
        type="text"
        value={carModel}
        onChange={(e) => setCarModel(e.target.value)}
        placeholder="Enter car model"
      />
    </InputWrapper>
    <InputWrapper>
      <label>Year:</label>
      <input
        type="number"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        placeholder="Enter year"
      />
    </InputWrapper>
    <InputWrapper>
      <label>Mileage:</label>
      <input
        type="number"
        value={mileage}
        onChange={(e) => setMileage(e.target.value)}
        placeholder="Enter mileage"
        required
      />
    </InputWrapper>
    <InputWrapper>
      <label>Color:</label>
      <input
        type="text"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        placeholder="Enter car color"
      />
    </InputWrapper>
  </CarDetailsContainer>
);

export default CarDetails;

// Styled Components
const CarDetailsContainer = styled.div`
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
