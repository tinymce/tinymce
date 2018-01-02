

export default function (f) {
  return function (value, next, die) {
    try {
      f(value, next, die);
    } catch (err) {
      die(err);
    }
  };
};