

export default <any> function (fun, delay) {
  var ref = null;

  var schedule = function () {
    var args = arguments;
    ref = setTimeout(function () {
      fun.apply(null, args);
      ref = null;
    }, delay);
  };

  var cancel = function () {
    if (ref !== null) {
      clearTimeout(ref);
      ref = null;
    }
  };

  return {
    cancel: cancel,
    schedule: schedule
  };
};