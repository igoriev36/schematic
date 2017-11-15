import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { createStore, applyMiddleware, compose } from 'redux'
import App from './containers/App'

ReactDOM.render(
  <App />,
  document.getElementById("main")
)
