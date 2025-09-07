import React, { useState, useEffect } from "react";
import styled from "styled-components";

// This component mirrors the technical inspection areas from the uploaded sheet.
// It manages its own state and is UI-only, so App.js does not need to track all fields.

const STATUS = {
  OK: "ok",
  ATTENTION: "attention",
  IMMEDIATE: "immediate",
};

const OutlineIcon = ({ shape, color, selected }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 16 16"
    aria-hidden="true"
    focusable="false"
    style={{ display: "block" }}
  >
    <circle cx="8" cy="8" r="6" fill="none" stroke={color} strokeWidth={selected ? 2.6 : 2} />
    {selected && (
      <path d="M4.5 8.5 L7.8 11.8 L12 6.2" stroke={color} strokeWidth="3.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

const StatusSelector = ({ value, onChange, name }) => (
  <StatusRow>
    <StatusOption title="Satisfactory">
      <HiddenRadio
        type="radio"
        name={name}
        checked={value === STATUS.OK}
        onChange={() => onChange(STATUS.OK)}
      />
      <OutlineIcon shape="circle" color="#2e7d32" selected={value === STATUS.OK} />
    </StatusOption>
    <StatusOption title="May Require Further Attention">
      <HiddenRadio
        type="radio"
        name={name}
        checked={value === STATUS.ATTENTION}
        onChange={() => onChange(STATUS.ATTENTION)}
      />
      <OutlineIcon shape="triangle" color="#f1b000" selected={value === STATUS.ATTENTION} />
    </StatusOption>
    <StatusOption title="Requires Immediate Attention">
      <HiddenRadio
        type="radio"
        name={name}
        checked={value === STATUS.IMMEDIATE}
        onChange={() => onChange(STATUS.IMMEDIATE)}
      />
      <OutlineIcon shape="diamond" color="#c62828" selected={value === STATUS.IMMEDIATE} />
    </StatusOption>
  </StatusRow>
);

const TechnicalDetails = ({ onStateChange }) => {
  // Interior / Exterior
  const [intExt, setIntExt] = useState({
    headlights: STATUS.OK,
    taillights: STATUS.OK,
    turnSignals: STATUS.OK,
    brakeLights: STATUS.OK,
    hazardLights: STATUS.OK,
    instrumentWarnings: STATUS.OK,
    washersWipers: STATUS.OK,
    windshieldCondition: STATUS.OK,
    hornOperation: STATUS.OK,
  });

  // Battery performance
  const [batteryResult, setBatteryResult] = useState("good"); // good | replace
  const [batteryDom, setBatteryDom] = useState("");

  // Under Hood
  const [underHood, setUnderHood] = useState({
    engineOil: STATUS.OK,
    coolant: STATUS.OK,
    psFluid: STATUS.OK,
    washerFluid: STATUS.OK,
    transmissionFluid: STATUS.OK,
    beltsHoses: STATUS.OK,
    filters: STATUS.OK, // Air / Cabin / Dust & Pollen
  });

  // Under Vehicle
  const [underVehicle, setUnderVehicle] = useState({
    brakeLinesHoses: STATUS.OK,
    shocksStrutsSuspension: STATUS.OK,
    exhaustSystem: STATUS.OK,
    leaks: STATUS.OK, // Engine oil and fluid leaks
    driveShaftCV: STATUS.OK,
    steeringComponents: STATUS.OK,
  });

  // Genuine Floor Mats removed per requirement

  // Tire Condition
  const emptyTire = { wearPattern: "", tread32nds: "", pressurePsi: "" };
  const [tires, setTires] = useState({
    leftFront: { ...emptyTire },
    rightFront: { ...emptyTire },
    leftRear: { ...emptyTire },
    rightRear: { ...emptyTire },
    spare: { ...emptyTire },
  });
  const [rotationSuggested, setRotationSuggested] = useState(false);
  const [alignmentSuggested, setAlignmentSuggested] = useState(false);
  const [replacementSuggested, setReplacementSuggested] = useState(false);
  const [seasonalChangeoverSuggested, setSeasonalChangeoverSuggested] =
    useState(false);

  // Brake Condition
  const padDefault = "ge5"; // ge5, between3and4, le2
  const [brakeCondition, setBrakeCondition] = useState({
    leftFront: padDefault,
    rightFront: padDefault,
    leftRear: padDefault,
    rightRear: padDefault,
  });

  // Maintenance + Recalls + Comments
  const [maintResetYes, setMaintResetYes] = useState(false);
  const [recallsYes, setRecallsYes] = useState(false);
  const [comments, setComments] = useState("");

  const updateStatus = (groupSetter) => (key, value) =>
    groupSetter((prev) => ({ ...prev, [key]: value }));

  const updateTire = (pos, field, val) =>
    setTires((prev) => ({
      ...prev,
      [pos]: { ...prev[pos], [field]: val },
    }));

  // Expose the current state to parent (for PDF generation)
  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({
        intExt,
        battery: { result: batteryResult, dom: batteryDom },
        underHood,
        underVehicle,
        tires,
        rotationSuggested,
        alignmentSuggested,
        replacementSuggested,
        seasonalChangeoverSuggested,
        brakeCondition,
        maintResetYes,
        recallsYes,
        comments,
      });
    }
  }, [
    intExt,
    batteryResult,
    batteryDom,
    underHood,
    underVehicle,
    tires,
    rotationSuggested,
    alignmentSuggested,
    replacementSuggested,
    seasonalChangeoverSuggested,
    brakeCondition,
    maintResetYes,
    recallsYes,
    comments,
    onStateChange,
  ]);

  return (
    <Container>
      <TwoCol>
        <Col>
          <LegendBar aria-label="Status legend">
            <LegendItem>
              <OutlineIcon shape="circle" color="#2e7d32" />
              <span>Satisfactory</span>
            </LegendItem>
            <LegendItem>
              <OutlineIcon shape="triangle" color="#f1b000" />
              <span>May Require Further Attention</span>
            </LegendItem>
            <LegendItem>
              <OutlineIcon shape="diamond" color="#c62828" />
              <span>Requires Immediate Attention</span>
            </LegendItem>
          </LegendBar>

          <SectionTitle>Interior / Exterior</SectionTitle>
          {[
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
          ].map(([label, key]) => (
            <Row key={key}>
              <ItemLabel>{label}</ItemLabel>
              <StatusSelector
                value={intExt[key]}
                onChange={(v) => updateStatus(setIntExt)(key, v)}
                name={`intExt-${key}`}
                compact
              />
            </Row>
          ))}

          <SectionTitle>Battery Performance (see printout)</SectionTitle>
          <Row>
            <ItemLabel>Result</ItemLabel>
            <Inline>
              <label>
                <input
                  type="radio"
                  name="batteryResult"
                  checked={batteryResult === "good"}
                  onChange={() => setBatteryResult("good")}
                />
                Good
              </label>
              <label>
                <input
                  type="radio"
                  name="batteryResult"
                  checked={batteryResult === "replace"}
                  onChange={() => setBatteryResult("replace")}
                />
                Replace
              </label>
            </Inline>
          </Row>
          <Row>
            <ItemLabel>Date of Manufacture</ItemLabel>
            <input
              type="date"
              value={batteryDom}
              onChange={(e) => setBatteryDom(e.target.value)}
            />
          </Row>

          <SectionTitle>Under Hood</SectionTitle>
          {[
            ["Engine oil level", "engineOil"],
            ["Coolant level", "coolant"],
            ["Power steering fluid level", "psFluid"],
            ["Windshield washer fluid level", "washerFluid"],
            ["Transmission fluid level", "transmissionFluid"],
            ["External drive belts and radiator hoses", "beltsHoses"],
            ["Air / Cabin / Dust & Pollen filter", "filters"],
          ].map(([label, key]) => (
            <Row key={key}>
              <ItemLabel>{label}</ItemLabel>
              <StatusSelector
                value={underHood[key]}
                onChange={(v) => updateStatus(setUnderHood)(key, v)}
                name={`underHood-${key}`}
                compact
              />
            </Row>
          ))}

          <SectionTitle>Under Vehicle</SectionTitle>
          {[
            ["Brakes lines / hoses / Parking brake cable", "brakeLinesHoses"],
            ["Shock absorbers / Struts / Suspension", "shocksStrutsSuspension"],
            ["Exhaust system", "exhaustSystem"],
            ["Engine oil and fluid leaks", "leaks"],
            ["Drive shaft / Constant velocity boots and bands", "driveShaftCV"],
            ["Steering gearbox components", "steeringComponents"],
          ].map(([label, key]) => (
            <Row key={key}>
              <ItemLabel>{label}</ItemLabel>
              <StatusSelector
                value={underVehicle[key]}
                onChange={(v) => updateStatus(setUnderVehicle)(key, v)}
                name={`underVehicle-${key}`}
                compact
              />
            </Row>
          ))}

          {null}
        </Col>

        <Col>
          <SectionTitle>Tire Condition</SectionTitle>
          {([
            ["Left Front", "leftFront"],
            ["Right Front", "rightFront"],
            ["Left Rear", "leftRear"],
            ["Right Rear", "rightRear"],
            ["Spare", "spare"],
          ]).map(([label, key]) => (
            <TireCard key={key}>
              <TireTitle>{label}</TireTitle>
              <TireRow>
                <small>Wear pattern</small>
                <select
                  value={tires[key].wearPattern}
                  onChange={(e) => updateTire(key, "wearPattern", e.target.value)}
                >
                  <option value="">--</option>
                  <option value="normal">Normal</option>
                  <option value="cupping">Cupping</option>
                  <option value="feathering">Feathering</option>
                  <option value="one-sided">One-sided</option>
                </select>
              </TireRow>
              <TireRow>
                <small>Tire tread (32nds)</small>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={tires[key].tread32nds}
                  onChange={(e) => updateTire(key, "tread32nds", e.target.value)}
                />
              </TireRow>
              <TireRow>
                <small>Tire pressure (psi)</small>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={tires[key].pressurePsi}
                  onChange={(e) => updateTire(key, "pressurePsi", e.target.value)}
                />
              </TireRow>
            </TireCard>
          ))}

          <Row>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={rotationSuggested}
                onChange={(e) => setRotationSuggested(e.target.checked)}
              />
              Rotation suggested
            </CheckboxLabel>
          </Row>
          <Row>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={alignmentSuggested}
                onChange={(e) => setAlignmentSuggested(e.target.checked)}
              />
              Alignment suggested
            </CheckboxLabel>
          </Row>
          <Row>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={replacementSuggested}
                onChange={(e) => setReplacementSuggested(e.target.checked)}
              />
              Replacement suggested
            </CheckboxLabel>
          </Row>
          <Row>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={seasonalChangeoverSuggested}
                onChange={(e) =>
                  setSeasonalChangeoverSuggested(e.target.checked)
                }
              />
              Seasonal tire changeover suggested
            </CheckboxLabel>
          </Row>

          <SectionTitle>Brake Condition</SectionTitle>
          {([
            ["Left Front", "leftFront"],
            ["Right Front", "rightFront"],
            ["Left Rear", "leftRear"],
            ["Right Rear", "rightRear"],
          ]).map(([label, key]) => (
            <Row key={key}>
              <ItemLabel>{label}</ItemLabel>
              <select
                value={brakeCondition[key]}
                onChange={(e) =>
                  setBrakeCondition((p) => ({ ...p, [key]: e.target.value }))
                }
              >
                <option value="ge5">≥ 5 mm</option>
                <option value="between3and4">3–4 mm</option>
                <option value="le2">≤ 2 mm</option>
              </select>
            </Row>
          ))}

          <SectionTitle>Maintenance / Recalls</SectionTitle>
          <Row>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={maintResetYes}
                onChange={(e) => setMaintResetYes(e.target.checked)}
              />
              Maintenance indicator light reset (YES)
            </CheckboxLabel>
          </Row>
          <Row>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={recallsYes}
                onChange={(e) => setRecallsYes(e.target.checked)}
              />
              Any outstanding recalls / PUD (YES)
            </CheckboxLabel>
          </Row>

          <SectionTitle>Comments</SectionTitle>
          <Textarea
            rows={5}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Notes, damage/wear areas, etc."
          />
        </Col>
      </TwoCol>
    </Container>
  );
};

export default TechnicalDetails;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0; /* allow content to shrink within grid track */
`;

const SectionTitle = styled.h3`
  margin: 10px 0 4px;
  color: #444;
  font-size: 16px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px dashed #eaeaea;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ItemLabel = styled.span`
  flex: 1 1 auto;
  color: #555;
  min-width: 0;
`;

const StatusRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 28px);
  gap: 12px;
  width: auto;
  justify-content: start;
`;

const StatusOption = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  cursor: pointer;
`;

const HiddenRadio = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
`;

const StatusIcon = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  ${(p) =>
    p.shape === "circle"
      ? `border-radius:50%; background:${p.color};`
      : p.shape === "triangle"
      ? `
        width: 0; height: 0;
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-bottom: 12px solid ${p.color};
      `
      : `
        width: 10px; height: 10px;
        background:${p.color};
        transform: rotate(45deg);
      `};
`;

const LegendBar = styled.div`
  display: flex;
  gap: 18px;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fafafa;
  margin-bottom: 6px;
`;

const LegendItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #444;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TireCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
  background: #fff;
`;

const TireTitle = styled.div`
  font-weight: 600;
  margin-bottom: 6px;
`;

const TireRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 6px 0;
`;

const Inline = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const Textarea = styled.textarea`
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px;
  font-size: 14px;
`;
