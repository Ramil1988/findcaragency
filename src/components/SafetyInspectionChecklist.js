import React, { useState } from "react";
import styled from "styled-components";

const SafetyInspectionChecklist = ({ onChecklistChange }) => {
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
    setInspectionItems((prev) => {
      const updatedItems = { ...prev, [key]: !prev[key] };
      onChecklistChange(updatedItems); // Notify parent of changes
      return updatedItems;
    });
  };

  const allChecked = Object.values(inspectionItems).every((val) => val);

  return (
    <ChecklistContainer>
      <ChecklistSection>
        {Object.entries(inspectionItems).map(([key, value]) => (
          <ChecklistItem key={key}>
            <input
              type="checkbox"
              checked={value}
              onChange={() => toggleItem(key)}
            />
            <span>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
            <span style={{ marginLeft: "10px" }}>
              {key === "brakes" && "No leaks, pads meet thickness standards."}
              {key === "steering" &&
                "No excessive play, power steering working."}
              {key === "tires" &&
                "Minimum tread depth 1.6mm, no visible damage."}
              {key === "lights" &&
                "Headlights, turn signals, brake lights work."}
              {key === "windshield" && "No cracks obstructing driver's view."}
              {key === "exhaust" && "No leaks, no excessive smoke."}
              {key === "fuel" && "No visible leaks."}
              {key === "frame" && "No excessive rust or structural damage."}
              {key === "seatbelts" && "Must retract and latch properly."}
              {key === "battery" && "Secure, no corrosion on terminals."}
            </span>
          </ChecklistItem>
        ))}
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
  font-size: 16px;

  span:first-of-type {
    width: 120px; /* Adjust width as needed for alignment */
    display: inline-block;
    font-weight: bold;
  }

  span:last-of-type {
    flex-grow: 1;
  }

  input {
    margin-right: 10px;
  }
`;

const InspectionSummary = styled.div`
  margin-top: 20px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  color: ${(props) => (props.allChecked ? "green" : "red")};
`;
