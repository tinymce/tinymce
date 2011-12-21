require("../../../../../lib/bolt/rhino.js");
require("../../../../../lib/test/json2.js");
require("../../../../../lib/test/jssert.js");
require("../../../../main/js/compile/bootstrap.js");
require("../../../../main/js/compile/porkbun.js");

define = ephox.bolt.module.api.define;
// FIX: this is crap, we need a better way to do this
require("../../../../../lib/test/ephox.scullion.Struct.js");
require("../../../../../lib/test/ephox.scullion.Mutable.js");
require("../../../../../lib/test/ephox.scullion.Immutable.js");

demand = ephox.bolt.module.api.demand;
