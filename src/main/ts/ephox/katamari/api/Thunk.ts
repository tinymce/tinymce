var cached = function (f: Function) {
  var called = false;
  var r;
  return function(...args) {
    if (!called) {
      called = true;
      r = f.apply(null, args);
    }
    return r;
  };
};

export default {
  cached: cached
};