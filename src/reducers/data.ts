type Action = {
  type?: "INCREMENT" | "DECREMENT";
};

export interface IData {
  readonly count?: number;
}

export default (
  state: IData = {
    count: 0
  },
  action: Action
): IData => {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + 1 };
    case "DECREMENT":
      return { ...state, count: state.count - 1 };
    default:
      return state;
  }
};
