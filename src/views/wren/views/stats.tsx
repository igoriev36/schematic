import * as React from "react";

function Stats({ dimensions }) {
  return (
    <div id="stats">
      <table>
        <tbody>
          {Object.keys(dimensions).map(key => (
            <tr>
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
