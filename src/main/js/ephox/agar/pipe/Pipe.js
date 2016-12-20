define(
  'ephox.agar.pipe.Pipe',

  [

  ],

  function () {
    return function (f) {
      return function (value, next, die) {
        try {
          f(value, next, die);
        } catch (err) {
          die(err);
        }
      };
    };
  }
);