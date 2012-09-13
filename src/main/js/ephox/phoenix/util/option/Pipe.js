define(
  'ephox.phoenix.util.option.Pipe',

  [
    'ephox.perhaps.Option'
  ],

  function (Option) {
    var pipe = function (o1, o2, nu) {
      return o1.bind(function (v1) {
        return o2.bind(function (v2) {
          return Option.some(nu(v1, v2));
        });
      });
    };

    return {
      pipe: pipe
    };

  }
);
