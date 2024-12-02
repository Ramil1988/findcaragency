const InspectorDetails = ({
  inspectorName,
  setInspectorName,
  inspectionDate,
  setInspectionDate,
}) => (
  <div>
    <label>Inspector's Name:</label>
    <input
      type="text"
      value={inspectorName}
      onChange={(e) => setInspectorName(e.target.value)}
    />
    <label>Inspection Date:</label>
    <input
      type="date"
      value={inspectionDate}
      onChange={(e) => setInspectionDate(e.target.value)}
    />
  </div>
);

export default InspectorDetails;
