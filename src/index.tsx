import * as React from "react";
import * as ReactDOM from "react-dom";
import Counter from "./views/counter";
import reducers, { IStore } from "./reducers";
import { createStore, Store } from "redux";

const store = createStore(reducers);
const rootEl = document.getElementById("main");

const render = () =>
  ReactDOM.render(
    <Counter
      count={(store.getState() as IStore).data.count}
      onIncrement={() => store.dispatch({ type: "INCREMENT" })}
      onDecrement={() => store.dispatch({ type: "DECREMENT" })}
    />,
    rootEl
  );

render();
store.subscribe(render);
