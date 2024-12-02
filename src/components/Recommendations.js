import React from "react";

const Recommendations = ({
  expertRecommendations,
  setExpertRecommendations,
  estimatedCost,
  setEstimatedCost,
  comments,
  setComments,
}) => (
  <div>
    <h3>Expert Recommendations</h3>
    <div>
      <label>Recommendations:</label>
      <textarea
        value={expertRecommendations}
        onChange={(e) => setExpertRecommendations(e.target.value)}
        rows="4"
      />
    </div>
    <div>
      <label>Estimated Cost:</label>
      <input
        type="number"
        value={estimatedCost}
        onChange={(e) => setEstimatedCost(e.target.value)}
      />
    </div>
    <div>
      <label>Additional Comments:</label>
      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        rows="4"
      />
    </div>
  </div>
);

export default Recommendations;
