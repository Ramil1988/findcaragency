import React, { useState } from "react";
import styled from "styled-components";

const SafetyInspectionChecklist = () => {
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

  const toggleItem = (key) => {
    setInspectionItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(inspectionItems).every((val) => val);

  return (
    <ChecklistContainer>
      <ChecklistSection>
        <ChecklistItem>
          <input
            type="checkbox"
            checked={inspectionItems.brakes}
            onChange={() => toggleItem("brakes")}
          />
          <span>Brakes: No leaks, pads meet thickness standards.</span>
        </ChecklistItem>
        <ChecklistItem>
          <input
            type="checkbox"
            checked={inspectionItems.steering}
            onChange={() => toggleItem("steering")}
          />
          <span>Steering: No excessive play, power steering working.</span>
        </ChecklistItem>
        <ChecklistItem>
          <input
            type="checkbox"
            checked={inspectionItems.tires}
            onChange={() => toggleItem("tires")}
          />
          <span>Tires: Minimum tread depth 1.6mm, no visible damage.</span>
        </ChecklistItem>
        <ChecklistItem>
          <input
            type="checkbox"
            checked={inspectionItems.lights}
            onChange={() => toggleItem("lights")}
          />
          <span>Lights: Headlights, turn signals, brake lights work.</span>
        </ChecklistItem>
        <ChecklistItem>
          <input
            type="checkbox"
            checked={inspectionItems.windshield}
            onChange={() => toggleItem("windshield")}
          />
          <span>Windshield: No cracks obstructing driver's view.</span>
        </ChecklistItem>
        <ChecklistItem>
          <input
            type="checkbox"
            checked={inspectionItems.exhaust}
            onChange={() => toggleItem("exhaust")}
          />
          <span>Exhaust: No leaks, no excessive smoke.</span>
        </ChecklistItem>
        <ChecklistItem>
          <input
            type="checkbox"
            checked={inspectionItems.fuel}
            onChange={() => toggleItem("fuel")}
          />
          <span>Fuel System: No visible leaks.</span>
        </ChecklistItem>
        <ChecklistItem>
          <input
            type="checkbox"
            checked={inspectionItems.frame}
            onChange={() => toggleItem("frame")}
          />
          <span>Frame: No excessive rust or structural damage.</span>
        </ChecklistItem>
        <ChecklistItem>
          <input
            type="checkbox"
            checked={inspectionItems.seatbelts}
            onChange={() => toggleItem("seatbelts")}
          />
          <span>Seatbelts: Must retract and latch properly.</span>
        </ChecklistItem>
        <ChecklistItem>
          <input
            type="checkbox"
            checked={inspectionItems.battery}
            onChange={() => toggleItem("battery")}
          />
          <span>Battery: Secure, no corrosion on terminals.</span>
        </ChecklistItem>
      </ChecklistSection>

      <InspectionSummary allChecked={allChecked}>
        {allChecked
          ? "✅ Vehicle Passed Inspection"
          : "❌ Inspection Incomplete"}
      </InspectionSummary>
    </ChecklistContainer>
  );
};

export default SafetyInspectionChecklist;

// Styled Components
const ChecklistContainer = styled.div`
  background: #fff;
  padding: 20px;
`;

const ChecklistSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ChecklistItem = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
`;

const InspectionSummary = styled.div`
  margin-top: 20px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  color: ${(props) => (props.allChecked ? "green" : "red")};
`;
