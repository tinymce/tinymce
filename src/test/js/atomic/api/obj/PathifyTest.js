test(
  'Tests for PathifyTest',

  [
    'ephox.katamari.api.Pathify'
  ],

  function (Pathify) {

    var basicMerge = function (obj, obj2) {
      var r = {};
      for (var i in obj) {
        r[i] = obj[i];
      }

      for (var j in obj2) {
        r[j] = obj2[j];
      }

      return r;
    };

    var check = function (expected, input, f) {
      var actual = Pathify.pathify(input, f);
      assert.eq(expected, actual);
    };

    check({}, {}, function (x, path) { return x; });

    check({a: 10}, {a: 10}, function (x, path) { return x; });

    check({a: 10, path: []}, {a: 10}, function (x, path) {
      return basicMerge(x, { path: path });
    });

    // This is testing that the path is augmented into each path of the nested object.
    check({
      a: {
        b: {
          c  : {
            d: 'abcd',
            path: ['a', 'b', 'c']
          },
          path: ['a', 'b']
        },
        s : {
          t : 'ast',
          path: ['a', 's']
        },
        path: ['a']
      },
      path: []
    }, { a: { b: { c: { d: 'abcd' }}, s: { t: 'ast' }}}, function (x, path) {
      return basicMerge(x, { path: path });
    });


    // This is testing that at the point where the path is bookended with a c, an additional element binding is inserted
    check({
      a: {
        b: {
          c  : {
            element : {
              d: 'abcd'
            }
          }
        },
        s : {
          t : 'ast'
        }
      }
    }, { a: { b: { c: { d: 'abcd' }}, s: { t: 'ast' }}}, function (x, path) {
      return path.length && path[path.length - 1] === 'c' ? { element: x } : x;
    });
  }
);