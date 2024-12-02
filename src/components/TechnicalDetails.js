import React from "react";

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
  <div>
    <h3>Technical Details</h3>

    <div>
      <label>Engine Volume:</label>
      <input
        type="text"
        value={engineVolume}
        onChange={(e) => setEngineVolume(e.target.value)}
      />
    </div>

    <div>
      <label>Transmission Type:</label>
      <input
        type="text"
        value={transmissionType}
        onChange={(e) => setTransmissionType(e.target.value)}
      />
    </div>

    <div>
      <label>Body Type:</label>
      <input
        type="text"
        value={bodyType}
        onChange={(e) => setBodyType(e.target.value)}
      />
    </div>

    <div>
      <label>Second Wheel Set:</label>
      <input
        type="text"
        value={secondWheelSet}
        onChange={(e) => setSecondWheelSet(e.target.value)}
      />
    </div>

    <div>
      <label>Number of Keys:</label>
      <input
        type="number"
        value={numberOfKeys}
        onChange={(e) => setNumberOfKeys(e.target.value)}
      />
    </div>

    <div>
      <label>Registration Certificate:</label>
      <input
        type="text"
        value={registrationCertificate}
        onChange={(e) => setRegistrationCertificate(e.target.value)}
      />
    </div>

    <div>
      <label>Paint Thickness (in μm):</label>
      <textarea
        value={paintThickness}
        onChange={(e) => setPaintThickness(e.target.value)}
        rows="2"
      />
    </div>

    <div>
      <label>Body Condition:</label>
      <textarea
        value={bodyCondition}
        onChange={(e) => setBodyCondition(e.target.value)}
        rows="4"
      />
    </div>

    <div>
      <label>Chassis Condition:</label>
      <textarea
        value={chassisCondition}
        onChange={(e) => setChassisCondition(e.target.value)}
        rows="4"
      />
    </div>

    <div>
      <label>Geometry Issues:</label>
      <textarea
        value={geometryIssues}
        onChange={(e) => setGeometryIssues(e.target.value)}
        rows="4"
      />
    </div>

    <div>
      <label>Electronics Status:</label>
      <textarea
        value={electronicsStatus}
        onChange={(e) => setElectronicsStatus(e.target.value)}
        rows="4"
      />
    </div>

    <div>
      <label>Tire Wear (Summer/Winter):</label>
      <textarea
        value={tireWear}
        onChange={(e) => setTireWear(e.target.value)}
        rows="2"
      />
    </div>

    <div>
      <label>Brake Condition:</label>
      <textarea
        value={brakeCondition}
        onChange={(e) => setBrakeCondition(e.target.value)}
        rows="4"
      />
    </div>

    <div>
      <label>Air Conditioning Status:</label>
      <textarea
        value={airConditioningStatus}
        onChange={(e) => setAirConditioningStatus(e.target.value)}
        rows="4"
      />
    </div>
  </div>
);

export default TechnicalDetails;
