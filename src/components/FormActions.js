import React from "react";

const FormActions = ({ loading, error, chatGptResponse }) => (
  <div>
    <button type="submit">Submit Inspection</button>
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

export default FormActions;
