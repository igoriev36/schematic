import * as React from "react";

function Layers({ toggleLayer, layers }) {
  return (
    <div id="layers">
      {["reinforcers", "finPieces"].map(layerName => (
        <label key={layerName}>
          {layerName}
          <input
            type="checkbox"
            checked={layers.has(layerName)}
            onChange={toggleLayer(layerName)}
          />
        </label>
      ))}
    </div>
  );
}

export default Layers;
