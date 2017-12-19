var cached = function (f) {
  var called = false;
  var r;
  return function() {
    if (!called) {
      called = true;
      r = f.apply(null, arguments);
    }
    return r;
  };
};

export default <any> {
  cached: cached
};