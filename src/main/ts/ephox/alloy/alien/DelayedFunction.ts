
export default <any> function (fun, delay) {
  let ref = null;

  const schedule = function () {
    const args = arguments;
    ref = setTimeout(function () {
      fun.apply(null, args);
      ref = null;
    }, delay);
  };

  const cancel = function () {
    if (ref !== null) {
      clearTimeout(ref);
      ref = null;
    }
  };

  return {
    cancel,
    schedule
  };
};