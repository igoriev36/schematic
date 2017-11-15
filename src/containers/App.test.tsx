import * as React from "react";
import App from "./app";
import { shallow } from "enzyme";

function setup(count = 0) {
  const actions = {
    onIncrement: jest.fn(),
    onDecrement: jest.fn()
  };
  const component = shallow(<App count={count} {...actions} />);

  return {
    component,
    actions,
    buttons: component.find("button"),
    p: component.find("p")
  };
}

describe("Counter component", () => {
  it("displays count", () => {
    const { p } = setup();
    expect(p.text()).toMatch(/^Clicked: 0 times/);
  });

  it("calls onIncrement after clicking first button", () => {
    const { buttons, actions } = setup();
    buttons.at(0).simulate("click");
    expect(actions.onIncrement).toBeCalled();
  });

  it("calls onDecrement after clicking second button", () => {
    const { buttons, actions } = setup();
    buttons.at(1).simulate("click");
    expect(actions.onDecrement).toBeCalled();
  });

  it("calls onIncrement after a second when fourth button clicked", done => {
    const { buttons, actions } = setup();
    buttons.at(3).simulate("click");
    setTimeout(() => {
      expect(actions.onIncrement).toBeCalled();
      done();
    }, 1000);
  });
});
