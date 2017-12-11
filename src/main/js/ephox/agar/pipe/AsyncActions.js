var delay = function (amount) {
  return function (next, die) {
    setTimeout(function () {
      next();
    }, amount);
  };
};

// Not really async, but can fail.
var fail = function (message) {
  return function (next, die) {
    die('Fake failure: ' + message);
  };
};

export default <any> {
  delay: delay,
  fail: fail
};