// Description:
//   HyperInfo remote control.
//
// Commands:
//   hubot connect <ip> <port> - Connect bot to HyperInfoWall.
//   hubot disconnect - Disconnect bot from HyperInfoWall.
//   hubot open <url> - Open web page in HyperInfoWall.

require("babel/register");
module.exports = function (robot) {
  require("../src/hyperinfo")(robot);
};
