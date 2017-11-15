import data, { IData } from "./data";
import { combineReducers } from "redux";

export interface IStore {
  data: IData;
}

export default combineReducers({
  data
});
