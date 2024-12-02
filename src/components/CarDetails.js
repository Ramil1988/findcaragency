import React from "react";

const CarDetails = ({
  vinCode,
  setVinCode,
  carMake,
  setCarMake,
  carModel,
  setCarModel,
  year,
  setYear,
  mileage,
  setMileage,
  color,
  setColor,
}) => (
  <div>
    <h3>Car Details</h3>
    <div>
      <label>VIN Code:</label>
      <input
        type="text"
        value={vinCode}
        onChange={(e) => setVinCode(e.target.value)}
      />
    </div>
    <div>
      <label>Car Make:</label>
      <input
        type="text"
        value={carMake}
        onChange={(e) => setCarMake(e.target.value)}
        required
      />
    </div>
    <div>
      <label>Car Model:</label>
      <input
        type="text"
        value={carModel}
        onChange={(e) => setCarModel(e.target.value)}
        required
      />
    </div>
    <div>
      <label>Year:</label>
      <input
        type="number"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        required
      />
    </div>
    <div>
      <label>Mileage:</label>
      <input
        type="number"
        value={mileage}
        onChange={(e) => setMileage(e.target.value)}
        required
      />
    </div>
    <div>
      <label>Color:</label>
      <input
        type="text"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
    </div>
  </div>
);

export default CarDetails;
