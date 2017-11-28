import * as React from "react";

function Stats({ dimensions }) {
  return (
    <div id="stats">
      <table>
        <tbody>
          {[
            "footprint",
            "numSheets",
            "chassisCost",
            "cncCost",
            "cncTime"
          ].map(key => (
            <tr key={key}>
              <th>{key}</th>
              <td>{dimensions[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Stats;
