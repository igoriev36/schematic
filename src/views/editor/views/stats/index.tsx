import * as React from "react";

const rows = {
  // "footprint": 100,
  // "insulation volume": 100,
  // "# bays": 100,
  // "# sheets": 100,
  // "CNC Time": 100,
  // "Total": 200
};

function Stats({ dimensions }) {
  const all = { ...rows, ...dimensions };
  return (
    <div id="stats">
      <table>
        <tbody>
          {Object.keys(all).map(key => (
            <tr key={key}>
              <th>{key}</th>
              <td>{all[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Stats;
