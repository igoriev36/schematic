import * as React from "react";

interface IMeasurement {
  value: number;
  title: string;
  x: number;
  y: number;
}

class Measurement extends React.Component<IMeasurement> {
  render() {
    const { value, x, y, title } = this.props;
    return (
      <span title={title} style={{ left: x, top: y }} className="measurement">
        {value}
      </span>
    );
  }
}

export default Measurement;
