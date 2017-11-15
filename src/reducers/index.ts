import data, { Data } from "./data";
import { combineReducers } from "redux";

export interface IStore {
  data: Data;
}

export default combineReducers({
  data
});
