import React from "react";
import styled from "styled-components";

const TechnicalDetails = ({
  engineVolume,
  setEngineVolume,
  transmissionType,
  setTransmissionType,
  bodyType,
  setBodyType,
  secondWheelSet,
  setSecondWheelSet,
  numberOfKeys,
  setNumberOfKeys,
  registrationCertificate,
  setRegistrationCertificate,
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
  tireWear,
  setTireWear,
  brakeCondition,
  setBrakeCondition,
  airConditioningStatus,
  setAirConditioningStatus,
}) => (
  <TechnicalDetailsContainer>
    <Row>
      <Col>
        <InputWrapper>
          <label>Engine Volume:</label>
          <input
            type="text"
            value={engineVolume}
            onChange={(e) => setEngineVolume(e.target.value)}
            placeholder="Enter engine volume"
          />
        </InputWrapper>
      </Col>
      <Col>
        <InputWrapper>
          <label>Transmission Type:</label>
          <input
            type="text"
            value={transmissionType}
            onChange={(e) => setTransmissionType(e.target.value)}
            placeholder="Enter transmission type"
          />
        </InputWrapper>
      </Col>
      <Col>
        <InputWrapper>
          <label>Body Type:</label>
          <input
            type="text"
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value)}
            placeholder="Enter body type"
          />
        </InputWrapper>
      </Col>
      <Col>
        <InputWrapper>
          <label>Second Wheel Set:</label>
          <input
            type="text"
            value={secondWheelSet}
            onChange={(e) => setSecondWheelSet(e.target.value)}
            placeholder="Enter second wheel set details"
          />
        </InputWrapper>
      </Col>
    </Row>
    <Row>
      <Col>
        <InputWrapper>
          <label>Number of Keys:</label>
          <input
            type="number"
            value={numberOfKeys}
            onChange={(e) => setNumberOfKeys(e.target.value)}
            placeholder="Enter number of keys"
          />
        </InputWrapper>
      </Col>
      <Col>
        <InputWrapper>
          <label>Registration Certificate:</label>
          <input
            type="text"
            value={registrationCertificate}
            onChange={(e) => setRegistrationCertificate(e.target.value)}
            placeholder="Enter registration certificate details"
          />
        </InputWrapper>
      </Col>
    </Row>
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
      <label>Tire Wear (Summer/Winter):</label>
      <textarea
        value={tireWear}
        onChange={(e) => setTireWear(e.target.value)}
        placeholder="Enter tire wear details"
        rows="2"
      />
    </InputWrapper>
    <InputWrapper>
      <label>Brake Condition:</label>
      <textarea
        value={brakeCondition}
        onChange={(e) => setBrakeCondition(e.target.value)}
        placeholder="Enter brake condition"
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

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const Col = styled.div`
  flex: 1 1 100%;
  max-width: 100%;

  @media (min-width: 768px) {
    flex: 1 1 48%;
    max-width: 48%;
  }
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
