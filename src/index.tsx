import * as React from "react";
import * as ReactDOM from "react-dom";
import Counter from "./views/counter";
import Editor from "./views/editor";
import reducers, { IStore } from "./reducers";
import { createStore, Store } from "redux";

const store = createStore(reducers);
const rootEl = document.getElementById("main");

/* <Counter
  count={(store.getState() as IStore).data.count}
  onIncrement={() => store.dispatch({ type: "INCREMENT" })}
  onDecrement={() => store.dispatch({ type: "DECREMENT" })}
/>, */

const render = () =>
  ReactDOM.render(
    <Editor
      width={window.innerWidth}
      height={window.innerHeight}
      devicePixelRatio={window.devicePixelRatio}
    />,
    rootEl
  );

render();
store.subscribe(render);
