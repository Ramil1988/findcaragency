import React, { useState } from "react";
import { OPENAI_API_KEY } from "../config.local";
import InspectorDetails from "./components/InspectorDetails";
import CarDetails from "./components/CarDetails";
import TechnicalDetails from "./components/TechnicalDetails";
import Recommendations from "./components/Recommendations";
import FormActions from "./components/FormActions";
import "./App.css";

function App() {
  // State variables for all fields
  const [inspectorName, setInspectorName] = useState("");
  const [inspectionDate, setInspectionDate] = useState("");
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [vinCode, setVinCode] = useState("");
  const [engineVolume, setEngineVolume] = useState("");
  const [color, setColor] = useState("");
  const [transmissionType, setTransmissionType] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [secondWheelSet, setSecondWheelSet] = useState("");
  const [numberOfKeys, setNumberOfKeys] = useState("");
  const [registrationCertificate, setRegistrationCertificate] = useState("");
  const [paintThickness, setPaintThickness] = useState("");
  const [bodyCondition, setBodyCondition] = useState("");
  const [chassisCondition, setChassisCondition] = useState("");
  const [geometryIssues, setGeometryIssues] = useState("");
  const [electronicsStatus, setElectronicsStatus] = useState("");
  const [interiorCondition, setInteriorCondition] = useState("");
  const [tireWear, setTireWear] = useState("");
  const [airConditioningStatus, setAirConditioningStatus] = useState("");
  const [brakeCondition, setBrakeCondition] = useState("");
  const [expertRecommendations, setExpertRecommendations] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [comments, setComments] = useState("");

  // State for ChatGPT response and loading/error states
  const [chatGptResponse, setChatGptResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const prompt = `You are a car inspection assistant. Based on the following diagnostic information, provide a summary:
Inspector's Name: ${inspectorName}
Inspection Date: ${inspectionDate}
Car Make: ${carMake}
Car Model: ${carModel}
Year: ${year}
Mileage: ${mileage}
VIN Code: ${vinCode}
Engine Volume: ${engineVolume}
Color: ${color}
Transmission Type: ${transmissionType}
Body Type: ${bodyType}
Second Wheel Set: ${secondWheelSet}
Number of Keys: ${numberOfKeys}
Registration Certificate: ${registrationCertificate}
Paint Thickness: ${paintThickness}
Body Condition: ${bodyCondition}
Chassis Condition: ${chassisCondition}
Geometry Issues: ${geometryIssues}
Electronics Status: ${electronicsStatus}
Interior Condition: ${interiorCondition}
Tire Wear: ${tireWear}
Air Conditioning Status: ${airConditioningStatus}
Brake Condition: ${brakeCondition}
Expert Recommendations: ${expertRecommendations}
Estimated Cost: ${estimatedCost}
Additional Comments: ${comments}

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
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const chatGptOutput = data.choices[0].message.content.trim();
      setChatGptResponse(chatGptOutput);
    } catch (err) {
      console.error("Error fetching ChatGPT response:", err);
      setError("Failed to fetch ChatGPT response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Car Inspection Report</h1>
      <form onSubmit={handleSubmit}>
        {/* Inspector Details Section */}
        <InspectorDetails
          inspectorName={inspectorName}
          setInspectorName={setInspectorName}
          inspectionDate={inspectionDate}
          setInspectionDate={setInspectionDate}
        />

        {/* Car Details Section */}
        <CarDetails
          carMake={carMake}
          setCarMake={setCarMake}
          carModel={carModel}
          setCarModel={setCarModel}
          year={year}
          setYear={setYear}
          mileage={mileage}
          setMileage={setMileage}
          vinCode={vinCode}
          setVinCode={setVinCode}
          color={color}
          setColor={setColor}
        />

        {/* Technical Details Section */}
        <TechnicalDetails
          engineVolume={engineVolume}
          setEngineVolume={setEngineVolume}
          transmissionType={transmissionType}
          setTransmissionType={setTransmissionType}
          bodyType={bodyType}
          setBodyType={setBodyType}
          secondWheelSet={secondWheelSet}
          setSecondWheelSet={setSecondWheelSet}
          numberOfKeys={numberOfKeys}
          setNumberOfKeys={setNumberOfKeys}
          registrationCertificate={registrationCertificate}
          setRegistrationCertificate={setRegistrationCertificate}
          paintThickness={paintThickness}
          setPaintThickness={setPaintThickness}
          bodyCondition={bodyCondition}
          setBodyCondition={setBodyCondition}
          chassisCondition={chassisCondition}
          setChassisCondition={setChassisCondition}
          geometryIssues={geometryIssues}
          setGeometryIssues={setGeometryIssues}
          electronicsStatus={electronicsStatus}
          setElectronicsStatus={setElectronicsStatus}
          interiorCondition={interiorCondition}
          setInteriorCondition={setInteriorCondition}
          tireWear={tireWear}
          setTireWear={setTireWear}
          airConditioningStatus={airConditioningStatus}
          setAirConditioningStatus={setAirConditioningStatus}
          brakeCondition={brakeCondition}
          setBrakeCondition={setBrakeCondition}
        />

        {/* Recommendations Section */}
        <Recommendations
          expertRecommendations={expertRecommendations}
          setExpertRecommendations={setExpertRecommendations}
          estimatedCost={estimatedCost}
          setEstimatedCost={setEstimatedCost}
          comments={comments}
          setComments={setComments}
        />

        {/* Form Actions Section */}
        <FormActions
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          chatGptResponse={chatGptResponse}
        />
      </form>

      {loading && <p>Loading ChatGPT response...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {chatGptResponse && (
        <div>
          <h2>ChatGPT Response:</h2>
          <textarea
            value={chatGptResponse}
            readOnly
            rows="6"
            style={{ width: "100%" }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
