import * as React from "react";

interface IStatusBar {
  helpText: string;
}

class StatusBar extends React.Component<IStatusBar> {
  render() {
    const { helpText } = this.props;
    return <div id="status-bar">{helpText}</div>;
  }
}

export default StatusBar;
