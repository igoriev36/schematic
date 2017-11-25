import * as React from "react";

class Stats extends React.Component {
  render() {
    const rows = [
      ["footprint", 100],
      ["insulation volume", 100],
      ["# bays", 100],
      ["# sheets", 100],
      ["CNC Time", 100],
      ["Total", 100]
    ];
    return (
      <div id="stats">
        <table>
          <tbody>
            {rows.map(r => (
              <tr>
                <th>{r[0]}</th>
                <td>{r[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Stats;
