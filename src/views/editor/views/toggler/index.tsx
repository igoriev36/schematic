import * as React from "react";

function Toggler({ showModel, toggleModel }) {
  const text = showModel ? "hide model" : "show model";
  return (
    <input type="button" id="toggler" value={text} onClick={toggleModel} />
  );
}

export default Toggler;
