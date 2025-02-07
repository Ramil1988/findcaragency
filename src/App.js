import React, { useState } from "react";
import styled from "styled-components";
import InspectorDetails from "./components/InspectorDetails";
import CarDetails from "./components/CarDetails";
import TechnicalDetails from "./components/TechnicalDetails";
import SafetyInspectionChecklist from "./components/SafetyInspectionChecklist";
import Recommendations from "./components/Recommendations";
import FormActions from "./components/FormActions";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { jsPDF } from "jspdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.mjs`;

function App() {
  const [inspectorName, setInspectorName] = useState("");
  const [inspectionDate, setInspectionDate] = useState("");
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [vinCode, setVinCode] = useState("");
  const [engineVolume, setEngineVolume] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [paintThickness, setPaintThickness] = useState("");
  const [bodyCondition, setBodyCondition] = useState("");
  const [chassisCondition, setChassisCondition] = useState("");
  const [geometryIssues, setGeometryIssues] = useState("");
  const [electronicsStatus, setElectronicsStatus] = useState("");
  const [interiorCondition, setInteriorCondition] = useState("");
  const [airConditioningStatus, setAirConditioningStatus] = useState("");
  const [inspectionItems, setInspectionItems] = useState({
    brakes: false,
    steering: false,
    tires: false,
    lights: false,
    windshield: false,
    exhaust: false,
    fuel: false,
    frame: false,
    seatbelts: false,
    battery: false,
  });
  const [expertRecommendations, setExpertRecommendations] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [comments, setComments] = useState("");
  const [relevantReport, setRelevantReport] = useState("");

  const [inspectorDetailsVisible, setInspectorDetailsVisible] = useState(true);
  const [carDetailsVisible, setCarDetailsVisible] = useState(true);
  const [technicalDetailsVisible, setTechnicalDetailsVisible] = useState(true);
  const [recommendationsVisible, setRecommendationsVisible] = useState(true);
  const [
    safetyInspectionChecklistVisible,
    setSafetyInspectionChecklistVisible,
  ] = useState(true);
  const [chatGptResponse, setChatGptResponse] = useState("");

  const [vinResponse, setVinResponse] = useState(null);

  const parsePdf = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const fileReader = new FileReader();

      fileReader.onload = async (event) => {
        const typedArray = new Uint8Array(event.target.result);

        try {
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          const numPages = pdf.numPages;
          let extractedText = "";

          for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item) => item.str)
              .join(" ");
            extractedText += `Page ${i}:\n${pageText}\n\n`;
          }

          setRelevantReport(extractedText);
        } catch (error) {
          console.error("Error parsing PDF:", error);
          setRelevantReport("An error occurred while processing the PDF.");
        }
      };

      fileReader.readAsArrayBuffer(file);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const handleChecklistChange = (updatedItems) => {
    setInspectionItems(updatedItems);
  };

  const processChatGptResponse = (responseText) => {
    // Strip HTML tags and format bold text properly for the PDF
    const strippedText = responseText.replace(/<\/?b>/g, ""); // Remove <b> tags
    const lines = strippedText.split("\n");

    return lines.map((line) => {
      if (line.trim().startsWith("-")) {
        // Handle bullet points
        return { text: line.trim(), bold: false };
      } else if (line.trim().endsWith(":")) {
        // Handle bold headings (lines ending with ":")
        return { text: line.trim(), bold: true };
      } else {
        return { text: line.trim(), bold: false }; // Regular text
      }
    });
  };

  const generatePdf = () => {
    console.log("Inspection Items:", inspectionItems);
    const doc = new jsPDF();

    // Embed a font that supports emojis (Noto Color Emoji or equivalent)
    const notoEmojiFont = "data:font/ttf;base64,<BASE64_ENCODED_FONT>"; // Replace with actual Base64-encoded font
    doc.addFileToVFS("NotoEmoji-Regular.ttf", notoEmojiFont);
    doc.addFont("NotoEmoji-Regular.ttf", "NotoEmoji", "normal");
    doc.setFont("NotoEmoji");

    // Set initial positions and constants
    let y = 20; // Initial Y position, leaving space for the logo
    const lineHeight = 10;
    const margin = 10; // Left margin
    const pageWidth = 210; // A4 page width in mm
    const usableWidth = pageWidth - margin * 2;

    // Helper function to add text with bold styling
    const addText = (text, isBold = false) => {
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, usableWidth);
      lines.forEach((line) => {
        if (y + lineHeight > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });
    };

    // Add space above sections
    const addSpace = (space = 10) => {
      y += space;
    };

    // Add logo to the PDF
    const img = new Image();
    img.src = "/FindCarAgencyLogo.png"; // Path to the logo image
    img.onload = () => {
      // Draw logo
      doc.addImage(img, "PNG", 10, 10, 50, 50); // Logo size: width 50mm, height 50mm

      // Draw header details
      const headerStartX = pageWidth - 40;
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Car Inspection Report", headerStartX, 20, { align: "right" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Inspector Name: ${inspectorName}`, headerStartX, 30, {
        align: "right",
      });
      doc.text(`Inspection Date: ${inspectionDate}`, headerStartX, 40, {
        align: "right",
      });

      // Move the Y position below the logo and header
      y = 50;

      // Add Car Details section
      addSpace(15);
      doc.setFontSize(16);
      addText("Car Details", true);
      doc.setFontSize(12);
      addText(`Make: ${carMake}`);
      addText(`Model: ${carModel}`);
      addText(`Year: ${year}`);
      addText(`Mileage: ${mileage}`);
      addText(`VIN Code: ${vinCode}`);

      // Add Technical Details section
      addSpace(15);
      doc.setFontSize(16);
      addText("Technical Details", true);
      doc.setFontSize(12);
      addText(`Engine Volume: ${engineVolume}`);
      addText(`Body Type: ${bodyType}`);

      // Add Safety Inspection Checklist section
      addSpace(15);
      doc.setFontSize(16);
      addText("Safety Inspection Checklist", true);
      doc.setFontSize(12);

      Object.entries(inspectionItems).forEach(([key, value]) => {
        const status = value ? "Passed" : "Failed";
        const description =
          key === "brakes"
            ? "No leaks, pads meet thickness standards."
            : key === "steering"
            ? "No excessive play, power steering working."
            : key === "tires"
            ? "Minimum tread depth 1.6mm, no visible damage."
            : key === "lights"
            ? "Headlights, turn signals, brake lights work."
            : key === "windshield"
            ? "No cracks obstructing driver's view."
            : key === "exhaust"
            ? "No leaks, no excessive smoke."
            : key === "fuel"
            ? "No visible leaks."
            : key === "frame"
            ? "No excessive rust or structural damage."
            : key === "seatbelts"
            ? "Must retract and latch properly."
            : key === "battery"
            ? "Secure, no corrosion on terminals."
            : "";

        addText(
          `${key.charAt(0).toUpperCase() + key.slice(1)}: ${description}`
        );
        addText(`Status: ${status}`);
      });

      doc.setFontSize(16);
      const allChecked = Object.values(inspectionItems).every((val) => val);
      addText(
        allChecked ? "Vehicle Passed Inspection" : "Inspection Incomplete",
        true
      );

      // Add Recommendations section
      addSpace(15);
      doc.setFontSize(16);
      addText("Recommendations", true);
      doc.setFontSize(12);
      addText(`Expert Recommendations: ${expertRecommendations}`);
      addText(`Estimated Cost: ${estimatedCost}`);

      // Add Comments section
      addSpace(15);
      doc.setFontSize(16);
      addText("Comments", true);
      doc.setFontSize(12);
      addText(`${comments}`);

      // Add Generated AI Response section
      addSpace(15);
      doc.setFontSize(16);
      addText("Generated AI Response", true);
      doc.setFontSize(12);

      const processedResponse = processChatGptResponse(chatGptResponse);
      processedResponse.forEach(({ text, bold }) => {
        addText(text, bold);
      });

      // Save the PDF
      doc.save("Car_Inspection_Report.pdf");
    };

    img.onerror = () => {
      console.error("Failed to load the logo image.");
      alert("Failed to load the logo image. Please check the path.");
    };
  };

  return (
    <AppContainer>
      <HeaderLogoContainer>
        <Logo src="/FindCarAgencyLogo.png" alt="FindCarAgency Logo" />
        <DownloadButtonContainer>
          <DownloadButton onClick={generatePdf}>
            <span>📥</span> Download Report
          </DownloadButton>
        </DownloadButtonContainer>
      </HeaderLogoContainer>
      <Header>Car Inspection Report</Header>
      <Form>
        <Section>
          <SectionHeader>
            <SectionTitle>Car Details</SectionTitle>
            <CollapseButton
              onClick={() => setCarDetailsVisible(!carDetailsVisible)}
            >
              {carDetailsVisible ? "Collapse" : "Expand"}
            </CollapseButton>
          </SectionHeader>
          {carDetailsVisible && (
            <CarDetails
              vinCode={vinCode}
              setVinCode={setVinCode}
              carMake={carMake}
              setCarMake={setCarMake}
              carModel={carModel}
              setCarModel={setCarModel}
              year={year}
              setYear={setYear}
              mileage={mileage}
              setMileage={setMileage}
              engineVolume={engineVolume}
              setEngineVolume={setEngineVolume}
              bodyType={bodyType}
              setBodyType={setBodyType}
              vinResponse={vinResponse}
              setVinResponse={setVinResponse}
            />
          )}
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Technical Details</SectionTitle>
            <CollapseButton
              onClick={() =>
                setTechnicalDetailsVisible(!technicalDetailsVisible)
              }
            >
              {technicalDetailsVisible ? "Collapse" : "Expand"}
            </CollapseButton>
          </SectionHeader>
          {technicalDetailsVisible && (
            <TechnicalDetails
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
              airConditioningStatus={airConditioningStatus}
              setAirConditioningStatus={setAirConditioningStatus}
            />
          )}
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Safety Inspection Checklist</SectionTitle>
            <CollapseButton
              onClick={() =>
                setSafetyInspectionChecklistVisible(
                  !safetyInspectionChecklistVisible
                )
              }
            >
              {safetyInspectionChecklistVisible ? "Collapse" : "Expand"}
            </CollapseButton>
          </SectionHeader>
          {safetyInspectionChecklistVisible && (
            <SafetyInspectionChecklist
              onChecklistChange={handleChecklistChange}
            />
          )}
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Recommendations</SectionTitle>
            <CollapseButton
              onClick={() => setRecommendationsVisible(!recommendationsVisible)}
            >
              {recommendationsVisible ? "Collapse" : "Expand"}
            </CollapseButton>
          </SectionHeader>
          {recommendationsVisible && (
            <Recommendations
              expertRecommendations={expertRecommendations}
              setExpertRecommendations={setExpertRecommendations}
              estimatedCost={estimatedCost}
              setEstimatedCost={setEstimatedCost}
              comments={comments}
              setComments={setComments}
            />
          )}
        </Section>

        <Section>
          <SectionTitle>Report</SectionTitle>
          <Label>
            Attach PDF File
            <InputForPdf onChange={parsePdf} />
          </Label>
          <TextareaFieldSecond
            value={relevantReport}
            onChange={(e) => setRelevantReport(e.target.value)}
          />
        </Section>
        <Section>
          <SectionHeader>
            <SectionTitle>Inspector Details</SectionTitle>
            <CollapseButton
              onClick={() =>
                setInspectorDetailsVisible(!inspectorDetailsVisible)
              }
            >
              {inspectorDetailsVisible ? "Collapse" : "Expand"}
            </CollapseButton>
          </SectionHeader>
          {inspectorDetailsVisible && (
            <InspectorDetails
              inspectorName={inspectorName}
              setInspectorName={setInspectorName}
              inspectionDate={inspectionDate}
              setInspectionDate={setInspectionDate}
            />
          )}
        </Section>
        <FormActions
          inspectorName={inspectorName}
          carMake={carMake}
          carModel={carModel}
          year={year}
          mileage={mileage}
          relevantReport={relevantReport}
          onChatGptResponse={setChatGptResponse}
          vinResponse={vinResponse}
        />
      </Form>
    </AppContainer>
  );
}

export default App;

// Styled Components
const AppContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Arial", sans-serif;
  background: #f8f9fa;
`;

const Header = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 20px;
`;

const HeaderLogoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
`;

const Logo = styled.img`
  height: 250px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Section = styled.div`
  background: #fff;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const InputForPdf = styled.input.attrs({
  type: "file",
  accept: ".pdf",
})`
  margin: 5px;
  cursor: pointer;
`;

const Label = styled.label`
  color: grey;
  font-weight: bold;
  font-size: 15px;
  display: block;
  margin-bottom: 10px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  color: #555;
`;

const TextareaField = styled.textarea`
  padding: 10px 15px;
  width: 95%;

  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  height: 100px;
  resize: vertical;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    border-color: #3498db;
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
    outline: none;
  }

  &::placeholder {
    color: #b3b3b3;
  }

  &:hover {
    border-color: #b3b3b3;
  }

  @media (max-width: 768px) {
    width: 90%;
  }
`;

const TextareaFieldSecond = styled(TextareaField)`
  height: 200px;
`;

const DownloadButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(90deg, #3498db, #8e44ad);
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, #8e44ad, #3498db);
    transform: translateY(-2px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  span {
    font-size: 20px;
  }
`;

const CollapseButton = styled.button.attrs({
  type: "button",
})`
  background: none;
  border: none;
  color: #007bff;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #0056b3;
  }
`;
