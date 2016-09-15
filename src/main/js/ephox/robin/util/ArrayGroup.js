define(
  'ephox.robin.util.ArrayGroup',

  [
    'ephox.perhaps.Option'
  ],

  function (Option) {
    return function () {
      var all = [ ];
      var part = [ ];

      var add = function (x) {
        part.push(x);
      };

      var separator = function (x) {
        if (part.length > 0) all.push(part.slice(0));
        all.push([ x ]);
        part = [ ];
      };

      var begin = function (x) {
        if (part.length > 0) all.push(part.slice(0));
        part = [ x ];
      };

      var end = function () {
        if (part.length > 0) all.push(part.slice(0));
        part = [ ];
      };

      var reopen = function () {
        if (all.length === 0) return Option.none();
        else {
          var last = all[all.length - 1];
          part = last.slice(0);
          all = all.slice(0, all.length - 1);
          return Option.some(part);
        }
      };

      var done = function () {
        var result = all.slice(0);
        if (part.length > 0) result.push(part.slice(0));
        return result;
      };

      return {
        done: done,
        add: add,
        separator: separator,
        begin: begin,
        reopen: reopen,
        end: end
      };
    };
  }
);