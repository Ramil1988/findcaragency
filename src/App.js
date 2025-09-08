import React, { useState, useMemo } from "react";
import styled from "styled-components";
import InspectorDetails from "./components/InspectorDetails";
import CarDetails from "./components/CarDetails";
import TechnicalDetails from "./components/TechnicalDetails";
// Recommendations section removed; keep only Estimated Cost input
import FormActions from "./components/FormActions";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { jsPDF } from "jspdf";
import { extractReport } from "./utils/reportExtractor";

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
  const [estimatedCost, setEstimatedCost] = useState("");
  const [relevantReport, setRelevantReport] = useState("");

  const [inspectorDetailsVisible, setInspectorDetailsVisible] = useState(true);
  const [carDetailsVisible, setCarDetailsVisible] = useState(true);
  const [technicalDetailsVisible, setTechnicalDetailsVisible] = useState(true);
  // Recommendations section removed
  const [techDetailsData, setTechDetailsData] = useState(null);
  const [chatGptResponse, setChatGptResponse] = useState("");

  const [vinResponse, setVinResponse] = useState(null);
  // Parse report text for quick preview chips
  const parsedReport = useMemo(
    () => extractReport(relevantReport || ""),
    [relevantReport]
  );

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

    // Set initial positions and constants
    let currentY = 20; // Single Y position tracker
    const lineHeight = 10;
    const margin = 10;
    const pageWidth = 210;
    const usableWidth = pageWidth - margin * 2;
    const pageHeight = 280; // Usable page height

    // Helper function to check if we need a new page
    const ensureSpace = (requiredSpace) => {
      if (currentY + requiredSpace > pageHeight) {
        doc.addPage();
        currentY = 20; // Reset to top of new page
      }
    };

    // Helper function to add text with proper spacing
    const addText = (text, isBold = false, fontSize = 12) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, usableWidth);

      // Ensure space for all lines
      ensureSpace(lines.length * lineHeight + 5);

      lines.forEach((line) => {
        doc.text(line, margin, currentY);
        currentY += lineHeight;
      });
    };

    // Add space between sections
    const addSpace = (space = 10) => {
      currentY += space;
    };

    // Add logo and header
    const img = new Image();
    img.src = "/FindCarAgencyLogo.png";

    img.onload = () => {
      // Reserve space for logo and header
      const logoHeight = 50;
      const headerHeight = 30;
      const totalHeaderSpace = Math.max(logoHeight, headerHeight) + 10;

      // Draw logo
      doc.addImage(img, "PNG", 10, 10, 50, 50);

      // Draw header details on the right
      const headerStartX = pageWidth - 40;
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("Car Inspection Report", headerStartX, 20, { align: "right" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      doc.text(`Inspector Name: ${inspectorName}`, headerStartX, 30, {
        align: "right",
      });
      doc.text(`Inspection Date: ${inspectionDate}`, headerStartX, 40, {
        align: "right",
      });

      // Set starting position after header
      currentY = totalHeaderSpace;

      // Car Details section
      addSpace(15);
      addText("Car Details", true, 16);
      addText(`Make: ${carMake}`);
      addText(`Model: ${carModel}`);
      addText(`Year: ${year}`);
      addText(`Mileage: ${mileage}`);
      addText(`VIN Code: ${vinCode}`);

      // Technical Details section
      addSpace(15);
      addText("Technical Details", true, 16);
      addText(`Engine Volume: ${engineVolume}`);
      addText(`Body Type: ${bodyType}`);

      // Render Technical Details data if available
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
          order.forEach((k, idx) =>
            drawCircle(x + idx * gap, y, colors[k], status === k)
          );
        };

        // Legend (single line with three items)
        addSpace(10);
        const legendHeight = 14; // Single row height
        ensureSpace(legendHeight);

        const legendY = currentY;
        doc.setDrawColor(180);
        doc.setFillColor(245);
        doc.rect(margin, legendY, usableWidth, legendHeight, "DF");

        const legendItems = [
          ["Satisfactory", green, false],
          ["May Require Further Attention", yellow, false],
          ["Requires Immediate Attention", red, false],
        ];

        const itemWidth = usableWidth / legendItems.length;
        const iconY = legendY + 7; // vertically centered
        legendItems.forEach(([label, color, selected], idx) => {
          const xStart = margin + 8 + idx * itemWidth; // add a bit more left padding
          drawCircle(xStart, iconY, color, selected);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10); // smaller text to avoid overlap
          doc.text(label, xStart + 8, iconY + 1);
        });
        doc.setFontSize(12); // restore default size

        currentY += legendHeight + 5;

        // Helper function for section headers
        const addSectionHeader = (title) => {
          const headerHeight = 8;
          ensureSpace(headerHeight + 10); // Ensure space for header + some content

          doc.setDrawColor(160);
          doc.setFillColor(230);
          doc.rect(margin, currentY, usableWidth, headerHeight, "F");
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0);
          doc.text(title, margin + 2, currentY + headerHeight - 2);

          // Draw separator line
          doc.setDrawColor(190);
          doc.line(
            margin,
            currentY + headerHeight,
            margin + usableWidth,
            currentY + headerHeight
          );

          currentY += headerHeight;

          // Reset font to normal so following rows aren't bold
          doc.setFont("helvetica", "normal");
        };

        // Helper function for table rows
        const addTableRow = (label, status) => {
          const labelWidth = usableWidth - 24; // Reserve space for status icons
          const iconBlockWidth = 24;

          doc.setFont("helvetica", "normal");
          const lines = doc.splitTextToSize(label, labelWidth - 4);
          const rowHeight = Math.max(8, lines.length * 4.5 + 3);

          ensureSpace(rowHeight);

          // Draw cells
          doc.setDrawColor(190);
          doc.setFillColor(252);
          doc.rect(margin, currentY, labelWidth, rowHeight, "DF");
          doc.setFillColor(255);
          doc.rect(
            margin + labelWidth,
            currentY,
            iconBlockWidth,
            rowHeight,
            "S"
          );

          // Add text
          let textY = currentY + 5;
          lines.forEach((line) => {
            doc.text(line, margin + 2, textY);
            textY += 4.5;
          });

          // Add status icons
          const iconX = margin + labelWidth + 3.5;
          const iconY = currentY + rowHeight / 2;
          drawThree(iconX, iconY, status, 6);

          // Remove extra spacing between rows for a tighter table
          currentY += rowHeight;
        };

        // Interior/Exterior section
        addSectionHeader("Interior / Exterior");
        const intExtItems = [
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
        ];

        intExtItems.forEach(([label, key]) => {
          addTableRow(label, techDetailsData.intExt[key]);
        });

        // Battery Performance section
        addSpace(5);
        addSectionHeader("Battery Performance (see printout)");
        addTableRow(
          `Result: ${
            techDetailsData.battery.result === "good" ? "Good" : "Replace"
          }`,
          techDetailsData.battery.result === "good" ? "ok" : "immediate"
        );
        if (techDetailsData.battery.dom) {
          addTableRow(
            `Date of Manufacture: ${techDetailsData.battery.dom}`,
            "ok"
          );
        }

        // Under Hood section
        addSpace(5);
        addSectionHeader("Under Hood");
        const underHoodItems = [
          ["Engine oil level", "engineOil"],
          ["Coolant level", "coolant"],
          ["Power steering fluid level", "psFluid"],
          ["Windshield washer fluid level", "washerFluid"],
          ["Transmission fluid level", "transmissionFluid"],
          ["External drive belts and radiator hoses", "beltsHoses"],
          ["Air / Cabin / Dust & Pollen filter", "filters"],
        ];

        underHoodItems.forEach(([label, key]) => {
          addTableRow(label, techDetailsData.underHood[key]);
        });

        // Under Vehicle section
        addSpace(5);
        addSectionHeader("Under Vehicle");
        const underVehicleItems = [
          ["Brakes lines / hoses / Parking brake cable", "brakeLinesHoses"],
          ["Shock absorbers / Struts / Suspension", "shocksStrutsSuspension"],
          ["Exhaust system", "exhaustSystem"],
          ["Engine oil and fluid leaks", "leaks"],
          ["Drive shaft / Constant velocity boots and bands", "driveShaftCV"],
          ["Steering gearbox components", "steeringComponents"],
        ];

        underVehicleItems.forEach(([label, key]) => {
          addTableRow(label, techDetailsData.underVehicle[key]);
        });

        // Floor Mats section removed per requirement

        // Tire Condition section
        addSpace(8); // add visual gap between sections
        addSectionHeader("Tire Condition");
        const tireOrder = [
          ["Left Front", "leftFront"],
          ["Right Front", "rightFront"],
          ["Left Rear", "leftRear"],
          ["Right Rear", "rightRear"],
          ["Spare", "spare"],
        ];

        tireOrder.forEach(([label, key]) => {
          const tireData = techDetailsData.tires[key];
          const rowHeight = 16;
          ensureSpace(rowHeight);

          doc.setDrawColor(180);
          doc.setFillColor(255);
          doc.rect(margin, currentY, usableWidth, rowHeight, "S");

          doc.setFont("helvetica", "bold");
          doc.text(label, margin + 2, currentY + 6);
          doc.setFont("helvetica", "normal");
          doc.text(
            `Wear pattern: ${tireData.wearPattern || "--"}`,
            margin + 2,
            currentY + 12
          );
          doc.text(
            `Tire tread (32nds): ${tireData.tread32nds || ""}`,
            margin + 60,
            currentY + 12
          );
          doc.text(
            `Tire pressure (psi): ${tireData.pressurePsi || ""}`,
            margin + 130,
            currentY + 12
          );

          // Make tire rows contiguous like a table (no extra spacing)
          currentY += rowHeight;
        });

        // Tire suggestions
        addSpace(5);
        ensureSpace(25);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Rotation suggested: ${
            techDetailsData.rotationSuggested ? "Yes" : "No"
          }`,
          margin,
          currentY
        );
        currentY += 6;
        doc.text(
          `Alignment suggested: ${
            techDetailsData.alignmentSuggested ? "Yes" : "No"
          }`,
          margin,
          currentY
        );
        currentY += 6;
        doc.text(
          `Replacement suggested: ${
            techDetailsData.replacementSuggested ? "Yes" : "No"
          }`,
          margin,
          currentY
        );
        currentY += 6;
        doc.text(
          `Seasonal changeover suggested: ${
            techDetailsData.seasonalChangeoverSuggested ? "Yes" : "No"
          }`,
          margin,
          currentY
        );
        currentY += 10;

        // Brake Condition section
        addSectionHeader("Brake Condition");
        const brakeMap = {
          // Use ASCII-safe symbols for PDF to avoid encoding glitches
          ge5: ">= 5 mm",
          between3and4: "3-4 mm",
          le2: "<= 2 mm",
        };
        const brakePositions = [
          ["Left Front", "leftFront"],
          ["Right Front", "rightFront"],
          ["Left Rear", "leftRear"],
          ["Right Rear", "rightRear"],
        ];

        // Add space after the header
        currentY += 5;
        ensureSpace(brakePositions.length * 8 + 5);
        brakePositions.forEach(([label, key]) => {
          doc.text(
            `${label}: ${brakeMap[techDetailsData.brakeCondition[key]]}`,
            margin + 2,
            currentY
          );
          currentY += 8; // Increased spacing between items
        });

        // Maintenance/Recalls section
        addSpace(10); // Increased space before section
        addSectionHeader("Maintenance / Recalls");
        currentY += 5; // Add space after header
        ensureSpace(20);
        doc.text(
          `Maintenance indicator light reset: ${
            techDetailsData.maintResetYes ? "YES" : "NO"
          }`,
          margin + 2,
          currentY
        );
        currentY += 8; // Increased spacing
        doc.text(
          `Any outstanding recalls / PUD: ${
            techDetailsData.recallsYes ? "YES" : "NO"
          }`,
          margin + 2,
          currentY
        );
        currentY += 12; // Increased spacing after section

        // Comments section for technical details
        addSpace(8);
        addSectionHeader("Comments");
        if (techDetailsData.comments) {
          const commentLines = doc.splitTextToSize(
            techDetailsData.comments,
            usableWidth - 4
          );
          ensureSpace(commentLines.length * 6 + 5);
          commentLines.forEach((line) => {
            doc.text(line, margin + 2, currentY);
            currentY += 6;
          });
        }
        currentY += 5;
      }

      // Estimated Cost (kept)
      addSpace(15);
      addText("Estimated Cost", true, 16);
      if (estimatedCost) {
        addText(`Estimated Cost: ${estimatedCost}`);
      }

      // Generated AI Response section
      addSpace(15);
      addText("Generated AI Response", true, 16);

      const processedResponse = processChatGptResponse(chatGptResponse);
      processedResponse.forEach(({ text, bold }) => {
        if (text.trim()) {
          // Only add non-empty text
          addText(text, bold);
        }
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
            <SectionTitle>Estimated Cost</SectionTitle>
          </SectionHeader>
          <Label>Estimated Cost:</Label>
          <input
            type="number"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            placeholder="Enter estimated cost"
            style={{
              border: "1px solid #ccc",
              borderRadius: 4,
              padding: 10,
              fontSize: 14,
              maxWidth: 300,
            }}
          />
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
          <ReportPreviewContainer>
            <PreviewTitle>Report Insights (parsed)</PreviewTitle>
            <Chips>
              {parsedReport.accidentsMentioned === false && (
                <Chip positive>No police-reported accidents</Chip>
              )}
              {parsedReport.accidentsMentioned === true && (
                <Chip warning>Accident/Damage keywords present</Chip>
              )}
              {parsedReport.highestOdometer && (
                <Chip>
                  Highest odometer: {parsedReport.highestOdometer.toLocaleString()}
                </Chip>
              )}
              {parsedReport.branding.slice(0, 3).map((b, i) => (
                <Chip key={`brand-${i}`}>{b}</Chip>
              ))}
              {parsedReport.recalls.length > 0 && (
                <Chip warning>Recalls mentioned</Chip>
              )}
            </Chips>
            {(parsedReport.damageRecords.length > 0 || parsedReport.registrations.length > 0 || parsedReport.serviceEvents.length > 0) && (
              <SmallLists>
                {parsedReport.damageRecords.length > 0 && (
                  <div>
                    <SmallHeading>Damage Records</SmallHeading>
                    {parsedReport.damageRecords.slice(0, 3).map((r, idx) => (
                      <SmallItem key={`dm-${idx}`}>
                        {r.date ? `${r.date}: ` : ""}
                        {r.amount ? `${r.amount} — ` : ""}
                        {r.details}
                      </SmallItem>
                    ))}
                  </div>
                )}
                {parsedReport.registrations.length > 0 && (
                  <div>
                    <SmallHeading>Registrations</SmallHeading>
                    {parsedReport.registrations.slice(0, 3).map((l, idx) => (
                      <SmallItem key={`reg-${idx}`}>{l}</SmallItem>
                    ))}
                  </div>
                )}
                {parsedReport.serviceEvents.length > 0 && (
                  <div>
                    <SmallHeading>Service Events</SmallHeading>
                    {parsedReport.serviceEvents.slice(0, 3).map((l, idx) => (
                      <SmallItem key={`svc-${idx}`}>{l}</SmallItem>
                    ))}
                  </div>
                )}
              </SmallLists>
            )}
          </ReportPreviewContainer>
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
          techDetailsData={techDetailsData}
          estimatedCost={estimatedCost}
          engineVolume={engineVolume}
          bodyType={bodyType}
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

  @media (max-width: 600px) {
    padding: 12px;
  }
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
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Logo = styled.img`
  max-width: 100%;
  height: auto;

  @media (min-width: 769px) {
    height: 250px;
    width: auto;
  }
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
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 600px) {
    align-items: flex-start;
  }
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

  @media (max-width: 768px) {
    justify-content: center;
    width: 100%;
  }
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

  @media (max-width: 768px) {
    width: 100%;
    font-size: 14px;
    padding: 10px 16px;
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
  
  @media (max-width: 600px) {
    font-size: 13px;
  }
`;

// Report preview styles
const ReportPreviewContainer = styled.div`
  margin-top: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;
`;

const PreviewTitle = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  color: #444;
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
`;

const Chip = styled.span`
  display: inline-block;
  padding: 6px 10px;
  border-radius: 16px;
  font-size: 12px;
  color: ${(p) => (p.positive ? "#155724" : p.warning ? "#856404" : "#333")};
  background: ${(p) => (p.positive ? "#d4edda" : p.warning ? "#fff3cd" : "#e9ecef")};
  border: 1px solid ${(p) => (p.positive ? "#c3e6cb" : p.warning ? "#ffeeba" : "#dee2e6")};
`;

const SmallLists = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const SmallHeading = styled.div`
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
`;

const SmallItem = styled.div`
  font-size: 13px;
  color: #555;
  margin: 4px 0;
`;
