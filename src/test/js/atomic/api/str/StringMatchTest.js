test(
  'StringMatchTest',

  [
    'ephox.katamari.api.StringMatch'
  ],

  function (StringMatch) {
    var check = function (testcase) {
      assert.eq(testcase.expected, testcase.match.matches(testcase.input));
      assert.eq(!testcase.expected, StringMatch.not(testcase.match).matches(testcase.input));
    };

    var toString = function (subject) {
      return StringMatch.cata(subject, function (s) {
        return 'starts with: ' + s;
      }, function (p) {
        return 'pattern: ' + p;
      }, function (s) {
        return 'contains: ' + s;
      }, function (s) {
        return 'exact: ' + s;
      }, function () {
        return 'all';
      }, function (n) {
        return 'not: ' + toString(n);
      });
    };

    var testcases = [
      { expected: false, input: 'bee', match: StringMatch.starts('a') },
      { expected: false, input: 'bee', match: StringMatch.starts('bed') },
      { expected: false, input: 'bee', match: StringMatch.starts('c') },
      { expected: true, input: 'bee', match: StringMatch.starts('b') },
      { expected: true, input: 'bee', match: StringMatch.starts('B') },
      { expected: true, input: 'bee', match: StringMatch.starts('be') },
      { expected: true, input: 'bee', match: StringMatch.starts('bee') },
      { expected: false, input: 'bee', match: StringMatch.starts('been') },

      { expected: false, input: 'bee', match: StringMatch.pattern(/c/) },
      { expected: true, input: 'bee', match: StringMatch.pattern(/e/) },
      { expected: true, input: 'bee', match: StringMatch.pattern(/b/) },
      { expected: false, input: 'bee', match: StringMatch.pattern(/been/) },
      { expected: false, input: 'bee', match: StringMatch.pattern(/dee/) },
      { expected: true, input: 'bee', match: StringMatch.pattern(/bee/) },
      { expected: true, input: 'bee', match: StringMatch.pattern(/ee/) },

      { expected: false, input: 'bee', match: StringMatch.contains('a') },
      { expected: true, input: 'bee', match: StringMatch.contains('b') },
      { expected: false, input: 'bee', match: StringMatch.contains('c') },
      { expected: true, input: 'bee', match: StringMatch.contains('B') },
      { expected: true, input: 'bee', match: StringMatch.contains('e') },
      { expected: false, input: 'bee', match: StringMatch.contains('f') },
      { expected: false, input: 'bee', match: StringMatch.contains('g') },

      { expected: false, input: 'bee', match: StringMatch.exact('b') },
      { expected: false, input: 'bee', match: StringMatch.exact('be') },
      { expected: false, input: 'bee', match: StringMatch.exact('ee') },
      { expected: true, input: 'bee', match: StringMatch.exact('bee') },
      { expected: true, input: 'bee', match: StringMatch.exact('BEE') },
      { expected: false, input: 'bee', match: StringMatch.exact('duck') },
      { expected: false, input: 'bee', match: StringMatch.exact('cat') },

      { expected: true, input: 'bee', match: StringMatch.all() },
      { expected: true, input: 'duck', match: StringMatch.all() },
      { expected: true, input: 'goat', match: StringMatch.all() },
      { expected: true, input: '', match: StringMatch.all() }
    ];

    for (var tc in testcases) {
      check(testcases[tc]);
    }
  }
);