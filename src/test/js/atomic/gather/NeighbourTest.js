test(
  'NeighbourTest',

  {
    'ephox.sugar.api.Traverse': '../mock/ephox/sugar/api/Traverse',
    'ephox.sugar.api.Compare': '../mock/ephox/sugar/api/Compare'
  },

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.gather.Neighbour'
  ],

  function (Option, Neighbour) {

    var some = Option.some;

    var check = function (expected, actual) {
      actual.fold(function () {
        assert.eq(true, expected.isNone());
      }, function (v) {
        expected.fold(function () {
          assert.fail('Expected none, Actual: ' + v);
        }, function (vv) {
          assert.eq(vv, v);
        });
      });
    };

    var checkBefore = function (expected, input) {
      var actual = Neighbour.before(input);
      check(expected, actual);
    };

    var checkAfter = function (expected, input) {
      var actual = Neighbour.after(input);
      check(expected, actual);
    };

    checkBefore(some('aab'), 'aac');
    checkBefore(some('aaa'), 'aab');

    checkBefore(Option.none(), 'aaa');
    checkBefore(Option.none(), 'aa');
    checkBefore(some('aac'), 'aba');
    checkBefore(some('aba'), 'abb');
    checkBefore(some('abb'), 'ba');
    checkBefore(some('ba'), 'caaa');
    checkBefore(some('caaa'), 'cb');
    checkBefore(some('cb'), 'cca');
    checkBefore(some('cca'), 'd');

    checkAfter(some('aab'), 'aaa');
    checkAfter(some('aac'), 'aab');
    checkAfter(some('aba'), 'aac');
    checkAfter(some('abb'), 'aba');
    checkAfter(some('ba'), 'abb');
    checkAfter(some('caaa'), 'ba');
    checkAfter(some('cb'), 'caaa');
    checkAfter(some('cca'), 'cb');
    checkAfter(some('d'), 'cca');
    checkAfter(Option.none(), 'd');
  }
);
