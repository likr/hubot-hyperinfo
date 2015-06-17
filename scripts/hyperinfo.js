// Description:
//   HyperInfo remote control.

require("babel/register");
module.exports = function (robot) {
  require("../src/hyperinfo")(robot);
};
