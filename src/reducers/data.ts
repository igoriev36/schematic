type Action = {
  type?: "INCREMENT" | "DECREMENT";
};

export interface Data {
  readonly count?: number;
}

export default (
  state: Data = {
    count: 0
  },
  action: Action
): Data => {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + 1 };
    case "DECREMENT":
      return { ...state, count: state.count - 1 };
    default:
      return state;
  }
};
