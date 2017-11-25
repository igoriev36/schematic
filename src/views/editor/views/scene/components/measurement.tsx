import * as React from "react";

interface IMeasurement {
  value: number;
  title: string;
  x: number;
  y: number;
}

class Measurement extends React.Component<IMeasurement> {
  render() {
    const { value = 0, x = 0, y = 0, title = "untitled" } = this.props;
    return (
      <span title={title} style={{ left: x, top: y }} className="measurement">
        {value}
      </span>
    );
  }
}

export default Measurement;
