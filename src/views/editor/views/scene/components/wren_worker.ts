const ctx: Worker = self as any;
const Wren = require("./wren_model");

ctx.onmessage = function(e) {
  const wren = Wren(e.data.points);
  console.log(wren);
};
