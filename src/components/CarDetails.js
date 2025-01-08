import React, { useState } from "react";
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
  vinResponse,
  setVinResponse,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVinLookup = async () => {
    if (!vinCode) {
      alert("Please enter a VIN code.");
      return;
    }

    setLoading(true);
    setError(null);
    setVinResponse(null);

    try {
      const response = await fetch(
        `https://specifications.vinaudit.com/v3/specifications?key=F73GXOZHI5V84VR&format=json&include=attributes,equipment,colors,recalls,warranties,photos&vin=${vinCode}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setVinResponse(data);

      // Extract and set car details from the response
      const attributes = data.attributes;
      setCarMake(attributes.make);
      setCarModel(attributes.model);
      setYear(attributes.year);
      setMileage(attributes.mileage);
      setColor(attributes.color);
    } catch (err) {
      console.error("Error fetching VIN details:", err);
      setError("Failed to fetch VIN details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CarDetailsContainer>
        <InputWrapper>
          <label>Search VIN Number:</label>
          <input
            type="text"
            value={vinCode}
            onChange={(e) => setVinCode(e.target.value)}
            placeholder="Enter VIN code"
          />
          <Button onClick={handleVinLookup} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </InputWrapper>
        <InputWrapper>
          <label>Car Make:</label>
          <input
            type="text"
            value={carMake}
            onChange={(e) => setCarMake(e.target.value)}
            placeholder="Enter car make"
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

        {vinResponse && (
          <ResponseContainer>
            <h3>VIN Lookup Response:</h3>
            <pre>{JSON.stringify(vinResponse, null, 2)}</pre>
          </ResponseContainer>
        )}
      </CarDetailsContainer>
    </div>
  );
};

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

const Button = styled.button`
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  color: red;
  font-size: 12px;
  margin-top: 5px;
`;

const ResponseContainer = styled.div`
  margin-top: 20px;
  background: #f9f9f9;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;

  h3 {
    margin-bottom: 10px;
    color: #333;
  }

  pre {
    background: #eee;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 14px;
  }
`;
