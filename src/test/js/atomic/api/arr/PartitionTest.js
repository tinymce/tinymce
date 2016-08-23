test(
  'Partition Test',

  [
    'ephox.katamari.api.Arr'
  ],

  function (Arr) {

    (function() {

      var check = function (input, expected) {
        assert.eq(expected, Arr.partition(input, function (n) { return n.indexOf('yes') > -1; }));
      };

      check([], {pass: [], fail:[]});
      check(['yes'], {pass: ['yes'], fail:[]});
      check(['no'], {pass: [], fail:['no']});
      check(
        ['yes', 'no', 'no', 'yes'],
        {
          pass: ['yes', 'yes'], fail: ['no', 'no']
        }
      );

      check(
        ['no 1', 'no 2', 'yes 1', 'yes 2', 'yes 3', 'no 3', 'no 4', 'yes 4', 'no 5', 'yes 5'],
        {
          pass: ['yes 1', 'yes 2', 'yes 3', 'yes 4', 'yes 5'], fail: ['no 1', 'no 2', 'no 3', 'no 4', 'no 5']
        }
      );
    })();
  }
);