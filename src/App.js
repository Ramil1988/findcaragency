import React, { useState } from "react";
import styled from "styled-components";
import InspectorDetails from "./components/InspectorDetails";
import CarDetails from "./components/CarDetails";
import TechnicalDetails from "./components/TechnicalDetails";
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
  // TechnicalDetails now manages its own state internally
  const [expertRecommendations, setExpertRecommendations] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [comments, setComments] = useState("");
  const [relevantReport, setRelevantReport] = useState("");

  const [inspectorDetailsVisible, setInspectorDetailsVisible] = useState(true);
  const [carDetailsVisible, setCarDetailsVisible] = useState(true);
  const [technicalDetailsVisible, setTechnicalDetailsVisible] = useState(true);
  const [recommendationsVisible, setRecommendationsVisible] = useState(true);
  const [techDetailsData, setTechDetailsData] = useState(null);
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

  // Safety Inspection Checklist has been removed from the app UI.

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

      // Render new Technical Details data from the UI
      if (techDetailsData) {
        const green = [46, 125, 50];
        const yellow = [241, 176, 0];
        const red = [198, 40, 40];

        const drawCircle = (x, y, color, selected) => {
          doc.setDrawColor(...color);
          doc.setLineWidth(selected ? 0.7 : 0.45);
          doc.circle(x, y, 2.0, "S");
          if (selected) {
            doc.setLineWidth(0.8);
            doc.setDrawColor(...color);
            doc.line(x - 0.8, y + 0.2, x - 0.1, y + 1.4);
            doc.line(x - 0.1, y + 1.4, x + 1.6, y - 1.1);
          }
        };

        const drawThree = (x, y, status, gap = 6.5) => {
          const order = ["ok", "attention", "immediate"];
          const colors = { ok: green, attention: yellow, immediate: red };
          order.forEach((k, idx) => drawCircle(x + idx * gap, y, colors[k], status === k));
        };

        // Single-column stacked layout: large checklist table, then Tire Condition below
        const boxX = margin;
        const boxW = usableWidth; // full width for table
        let yTop = y;

        const ensureSpace = (needed) => {
          const limit = 280;
          if (yTop + needed > limit) {
            doc.addPage();
            yTop = 20;
          }
        };

        // Legend – compact stacked inside full-width box
        const legendItems = [
          ["Satisfactory", "ok"],
          ["Needs Attention", "attention"],
          ["Immediate", "immediate"],
        ];
        const legendRowH = 5.5;
        const legendBoxH = legendItems.length * legendRowH + 3;
        ensureSpace(legendBoxH + 3);
        doc.setDrawColor(180);
        doc.setFillColor(245);
        doc.rect(boxX, yTop, boxW, legendBoxH, "DF");
        doc.setFont("helvetica", "normal");
        let ly = yTop + 3.5;
        legendItems.forEach(([label, key]) => {
          drawThree(boxX + 6, ly - 1, key);
          doc.text(label, boxX + 28, ly);
          ly += legendRowH;
        });
        // Slightly larger gap between legend and first header
        yTop += legendBoxH + 3;

        // Table metrics
        const labelPad = 2;
        const iconBlockWidth = 24; // allow comfortable icon fit
        // Make rows exactly the same total width as headers (no side margin)
        const labelWidth = boxW - iconBlockWidth;
        const rowGap = 0; // no extra gap between rows

        const sectionHeader = (title, minNext = 16) => {
          const headerH = 7;
          // ensure enough space for header plus at least one upcoming row/content
          ensureSpace(headerH + minNext);
          doc.setDrawColor(160);
          doc.setFillColor(230);
          doc.rect(boxX, yTop, boxW, headerH, "F");
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0);
          // place text near the bottom of the header area for consistent baseline
          doc.text(title, boxX + 2, yTop + headerH - 2);
          // draw a separator line at the bottom of the header
          doc.setDrawColor(190);
          doc.line(boxX, yTop + headerH, boxX + boxW, yTop + headerH);
          yTop += headerH; // next row starts exactly under the header underline
        };

        const drawRow = (label, status) => {
          const lines = doc.splitTextToSize(label, labelWidth - labelPad * 2);
          const rowHeight = Math.max(6, lines.length * 4.5 + 3);
          ensureSpace(rowHeight + rowGap);
          const top = yTop; // top edge of the row
          // Cells
          doc.setDrawColor(190);
          doc.setFillColor(252);
          doc.rect(boxX, top, labelWidth, rowHeight, "DF");
          doc.setFillColor(255);
          doc.rect(boxX + labelWidth, top, iconBlockWidth, rowHeight, "S");
          // Text
          doc.setFont("helvetica", "normal");
          let ty = top + 4; // baseline inside the cell
          lines.forEach((ln) => {
            doc.text(ln, boxX + labelPad, ty);
            ty += 4.5;
          });
          // Icons centered within icon cell
          const iconCellLeft = boxX + labelWidth;
          const cx = iconCellLeft + 3.5;
          const cy = top + rowHeight / 2; // true vertical center
          drawThree(cx, cy, status, 6);
          yTop += rowHeight + rowGap;
        };

        // Interior / Exterior
        sectionHeader("Interior / Exterior");
        doc.setFont("helvetica", "normal");
        [
          ["Headlights (high/low)", "headlights"],
          ["Taillights", "taillights"],
          ["Turn signals", "turnSignals"],
          ["Brake lights", "brakeLights"],
          ["Hazard warning lights", "hazardLights"],
          ["Instrument panel warning lights", "instrumentWarnings"],
          [
            "Windshield washer spray / wiper operation and blades",
            "washersWipers",
          ],
          ["Windshield condition", "windshieldCondition"],
          ["Horn operation", "hornOperation"],
        ].forEach(([label, key]) => drawRow(label, techDetailsData.intExt[key]));

        // Battery performance (simple two rows)
        sectionHeader("Battery Performance (see printout)");
        doc.setFont("helvetica", "normal");
        drawRow(
          `Result: ${techDetailsData.battery.result === "good" ? "Good" : "Replace"}`,
          techDetailsData.battery.result === "good" ? "ok" : "immediate"
        );
        if (techDetailsData.battery.dom) {
          drawRow(`Date of Manufacture: ${techDetailsData.battery.dom}`, "ok");
        }

        // Under Hood
        sectionHeader("Under Hood");
        doc.setFont("helvetica", "normal");
        [
          ["Engine oil level", "engineOil"],
          ["Coolant level", "coolant"],
          ["Power steering fluid level", "psFluid"],
          ["Windshield washer fluid level", "washerFluid"],
          ["Transmission fluid level", "transmissionFluid"],
          ["External drive belts and radiator hoses", "beltsHoses"],
          ["Air / Cabin / Dust & Pollen filter", "filters"],
        ].forEach(([label, key]) => drawRow(label, techDetailsData.underHood[key]));

        // Under Vehicle
        sectionHeader("Under Vehicle");
        doc.setFont("helvetica", "normal");
        [
          ["Brakes lines / hoses / Parking brake cable", "brakeLinesHoses"],
          ["Shock absorbers / Struts / Suspension", "shocksStrutsSuspension"],
          ["Exhaust system", "exhaustSystem"],
          ["Engine oil and fluid leaks", "leaks"],
          ["Drive shaft / Constant velocity boots and bands", "driveShaftCV"],
          ["Steering gearbox components", "steeringComponents"],
        ].forEach(([label, key]) => drawRow(label, techDetailsData.underVehicle[key]));

        // Floor mats
        sectionHeader("Genuine Floor Mats");
        const checkBox = (x, y, checked) => {
          doc.setDrawColor(120);
          doc.rect(x, y - 3, 3.5, 3.5);
          if (checked) {
            doc.setDrawColor(0);
            doc.setLineWidth(0.6);
            doc.line(x + 0.5, y - 1, x + 1.4, y + 0.8);
            doc.line(x + 1.4, y + 0.8, x + 3, y - 2);
          }
        };
        checkBox(boxX, yTop, techDetailsData.floorMatsInstalled);
        doc.text("Genuine floor mats installed", boxX + 6, yTop);
        yTop += 5.5;
        checkBox(boxX, yTop, techDetailsData.floorMatsAnchored);
        doc.text("Anchored properly and only 1 mat at driver's position", boxX + 6, yTop);
        yTop += 8;

        // Tire Condition (stacked under checklist)
        sectionHeader("Tire Condition");
        doc.setFont("helvetica", "normal");
        const tireOrder = [
          ["Left Front", "leftFront"],
          ["Right Front", "rightFront"],
          ["Left Rear", "leftRear"],
          ["Right Rear", "rightRear"],
          ["Spare", "spare"],
        ];
        const printTire = (label, t) => {
          const rowH = 14;
          ensureSpace(rowH + 2);
          const top = yTop;
          doc.setDrawColor(180);
          doc.setFillColor(255);
          doc.rect(boxX, top, boxW, rowH, "S");
          doc.setFont("helvetica", "bold");
          doc.text(label, boxX + 2, top + 4);
          doc.setFont("helvetica", "normal");
          doc.text(`Wear pattern: ${t.wearPattern || "--"}`, boxX + 2, top + 9);
          doc.text(`Tire tread (32nds): ${t.tread32nds || ""}`, boxX + 60, top + 9);
          doc.text(`Tire pressure (psi): ${t.pressurePsi || ""}`, boxX + 130, top + 9);
          yTop += rowH + 2;
        };
        tireOrder.forEach(([lbl, key]) => printTire(lbl, techDetailsData.tires[key]));

        // Tire suggestions
        ensureSpace(6);
        doc.text(`Rotation suggested: ${techDetailsData.rotationSuggested ? "Yes" : "No"}`, boxX, yTop);
        yTop += 5;
        ensureSpace(6);
        doc.text(`Alignment suggested: ${techDetailsData.alignmentSuggested ? "Yes" : "No"}`, boxX, yTop);
        yTop += 5;
        ensureSpace(6);
        doc.text(`Replacement suggested: ${techDetailsData.replacementSuggested ? "Yes" : "No"}`, boxX, yTop);
        yTop += 5;
        ensureSpace(6);
        doc.text(`Seasonal changeover suggested: ${techDetailsData.seasonalChangeoverSuggested ? "Yes" : "No"}`, boxX, yTop);
        yTop += 8;

        // Brake Condition
        sectionHeader("Brake Condition");
        const brakeMap = { ge5: "≥ 5 mm", between3and4: "3–4 mm", le2: "≤ 2 mm" };
        [
          ["Left Front", "leftFront"],
          ["Right Front", "rightFront"],
          ["Left Rear", "leftRear"],
          ["Right Rear", "rightRear"],
        ].forEach(([lbl, key]) => {
          ensureSpace(6);
          doc.text(`${lbl}: ${brakeMap[techDetailsData.brakeCondition[key]]}`, boxX + 2, yTop);
          yTop += 5;
        });
        yTop += 4;

        // Maintenance / Recalls
        sectionHeader("Maintenance / Recalls");
        doc.setFont("helvetica", "normal");
        ensureSpace(6);
        doc.text(`Maintenance indicator light reset: ${techDetailsData.maintResetYes ? "YES" : "NO"}`, boxX + 2, yTop);
        yTop += 5;
        ensureSpace(6);
        doc.text(`Any outstanding recalls / PUD: ${techDetailsData.recallsYes ? "YES" : "NO"}`, boxX + 2, yTop);
        yTop += 8;

        // Comments
        sectionHeader("Comments");
        const commentLines = doc.splitTextToSize(techDetailsData.comments || "", boxW - 4);
        commentLines.forEach((line) => {
          ensureSpace(6);
          doc.text(line, boxX + 2, yTop);
          yTop += 5;
        });

        // Continue from bottom
        y = yTop + 6;
      }

      // Safety Inspection Checklist section removed

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
            <TechnicalDetails onStateChange={setTechDetailsData} />
          )}
        </Section>

        {/* Safety Inspection Checklist removed from UI */}

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
  max-width: 1100px;
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
