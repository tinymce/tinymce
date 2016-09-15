define(
  'ephox.robin.util.ArrayGroup',

  [

  ],

  function () {
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
        end: end
      };
    };
  }
);