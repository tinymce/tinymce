var log = function (message) {
  return function () {
    console.log(message);
  };
};

var debug = function () {
  debugger;
};

var pass = function () { };

export default <any> {
  log: log,
  debug: debug,
  pass: pass
};