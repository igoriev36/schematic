import * as React from "react";

interface IAppProps extends React.Props<any> {
  count: number;
  onIncrement: any;
  onDecrement: any;
}

class App extends React.Component<IAppProps, {}> {
  incrementIfOdd = () => {
    if (this.props.count % 2 !== 0) {
      this.props.onIncrement();
    }
  };

  incrementAsync = () => {
    setTimeout(this.props.onIncrement, 1000);
  };

  render() {
    const { count, onIncrement, onDecrement } = this.props;
    return (
      <p>
        Clicked: {count} times <button onClick={onIncrement}>+</button>{" "}
        <button onClick={onDecrement}>-</button>{" "}
        <button onClick={this.incrementIfOdd}>Increment if odd</button>{" "}
        <button onClick={this.incrementAsync}>Increment async</button>
      </p>
    );
  }
}

export default App;
