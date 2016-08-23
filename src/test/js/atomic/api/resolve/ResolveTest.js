test(
  'resolve test',

  [
    'ephox.katamari.api.Resolve'
  ],

  function (Resolve) {
    var check = function (expected, path, scope) {
      var actual = Resolve.resolve(path, scope);
      assert.eq(expected, actual);
    };

    var data = {
      a: {
        apple: {
          red: 'i am a red apple',
          green: 'i am a green apple'
        }
      },
      b: {
        banana: {
          yellow: 'i am a yellow banana'
        }
      }
    };

    check(data.a.apple.red, 'a.apple.red', data);
    check(data.a.apple.green, 'a.apple.green', data);
    check(data.b.banana.yellow, 'b.banana.yellow', data);

    check(undefined, 'c', data);
    check(undefined, 'c.carrot', data);
    check(undefined, 'c.carrot.orange', data);
  }
);