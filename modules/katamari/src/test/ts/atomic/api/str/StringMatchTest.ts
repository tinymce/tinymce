import { StringMatch } from 'ephox/katamari/api/StringMatch';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('StringMatchTest', function () {
  const check = function (testcase) {
    assert.eq(testcase.expected, StringMatch.matches(testcase.match, testcase.input));
    assert.eq(!testcase.expected, StringMatch.matches(
      StringMatch.not(testcase.match),
      testcase.input
    ));
  };

  const toString = function (subject) {
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

  const testcases = [
    { expected: false, input: 'bee', match: StringMatch.starts('a', StringMatch.caseInsensitive) },
    { expected: false, input: 'bee', match: StringMatch.starts('bed', StringMatch.caseInsensitive) },
    { expected: false, input: 'bee', match: StringMatch.starts('c', StringMatch.caseInsensitive) },
    { expected: true, input: 'bee', match: StringMatch.starts('b', StringMatch.caseInsensitive) },
    { expected: true, input: 'bee', match: StringMatch.starts('B', StringMatch.caseInsensitive) },
    { expected: true, input: 'bee', match: StringMatch.starts('be', StringMatch.caseInsensitive) },
    { expected: true, input: 'bee', match: StringMatch.starts('bee', StringMatch.caseInsensitive) },
    { expected: false, input: 'bee', match: StringMatch.starts('been', StringMatch.caseInsensitive) },

    { expected: false, input: 'bee', match: StringMatch.pattern(/c/, StringMatch.caseInsensitive) },
    { expected: true, input: 'bee', match: StringMatch.pattern(/e/, StringMatch.caseInsensitive) },
    { expected: true, input: 'bee', match: StringMatch.pattern(/b/, StringMatch.caseInsensitive) },
    { expected: false, input: 'bee', match: StringMatch.pattern(/been/, StringMatch.caseInsensitive) },
    { expected: false, input: 'bee', match: StringMatch.pattern(/dee/, StringMatch.caseInsensitive) },
    { expected: true, input: 'bee', match: StringMatch.pattern(/bee/, StringMatch.caseInsensitive) },
    { expected: true, input: 'bee', match: StringMatch.pattern(/ee/, StringMatch.caseInsensitive) },

    { expected: false, input: 'bee', match: StringMatch.contains('a', StringMatch.caseInsensitive) },
    { expected: true, input: 'bee', match: StringMatch.contains('b', StringMatch.caseInsensitive) },
    { expected: false, input: 'bee', match: StringMatch.contains('c', StringMatch.caseInsensitive) },
    { expected: true, input: 'bee', match: StringMatch.contains('B', StringMatch.caseInsensitive) },
    { expected: true, input: 'bee', match: StringMatch.contains('e', StringMatch.caseInsensitive) },
    { expected: false, input: 'bee', match: StringMatch.contains('f', StringMatch.caseInsensitive) },
    { expected: false, input: 'bee', match: StringMatch.contains('g', StringMatch.caseInsensitive) },

    { expected: false, input: 'bee', match: StringMatch.exact('b', StringMatch.caseInsensitive) },
    { expected: false, input: 'bee', match: StringMatch.exact('be', StringMatch.caseInsensitive) },
    { expected: false, input: 'bee', match: StringMatch.exact('ee', StringMatch.caseInsensitive) },
    { expected: true, input: 'bee', match: StringMatch.exact('bee', StringMatch.caseInsensitive) },
    { expected: true, input: 'bee', match: StringMatch.exact('BEE', StringMatch.caseInsensitive) },
    { expected: false, input: 'bee', match: StringMatch.exact('duck', StringMatch.caseInsensitive) },
    { expected: false, input: 'bee', match: StringMatch.exact('cat', StringMatch.caseInsensitive) },

    { expected: true, input: 'bee', match: StringMatch.all() },
    { expected: true, input: 'duck', match: StringMatch.all() },
    { expected: true, input: 'goat', match: StringMatch.all() },
    { expected: true, input: '', match: StringMatch.all() }
  ];

  for (const tc in testcases) {
    check(testcases[tc]);
  }

  Jsc.property(
    'StringMatch.matches(StringMatch.starts(s1), s1 + s) === true',
    Jsc.string,
    Jsc.string,
    function (s, s1) {
      return Jsc.eq(true, StringMatch.matches(
        StringMatch.starts(s1, StringMatch.caseInsensitive),
        s1 + s
      ));
    }
  );

  Jsc.property(
    'StringMatch.matches(StringMatch.contains(s1), s1 + s) === true',
    Jsc.string,
    Jsc.string,
    function (s, s1) {
      return Jsc.eq(true, StringMatch.matches(
        StringMatch.contains(s1, StringMatch.caseInsensitive),
        s1 + s
      ));
    }
  );

  Jsc.property(
    'StringMatch.matches(StringMatch.contains(s1), s + s1) === true',
    Jsc.string,
    Jsc.string,
    function (s, s1) {
      return Jsc.eq(true, StringMatch.matches(
        StringMatch.contains(s1, StringMatch.caseInsensitive),
        s + s1
      ));
    }
  );

  Jsc.property(
    'StringMatch.matches(StringMatch.contains(s1), s) === s.indexOf(s1)',
    Jsc.asciistring,
    Jsc.asciinestring,
    function (s, s1) {
      return Jsc.eq(s.toLowerCase().indexOf(s1.toLowerCase()) > -1, StringMatch.matches(
        StringMatch.contains(s1, StringMatch.caseInsensitive),
        s
      ));
    }
  );

  Jsc.property(
    'StringMatch.matches(StringMatch.contains(s), s) === true',
    Jsc.string,
    function (s) {
      return Jsc.eq(true, StringMatch.matches(
        StringMatch.contains(s, StringMatch.caseInsensitive),
        s
      ));
    }
  );

  Jsc.property(
    'StringMatch.matches(StringMatch.exact(s), s + s1) === false',
    Jsc.nestring,
    Jsc.nestring,
    function (s, s1) {
      return Jsc.eq(false, StringMatch.matches(
        StringMatch.exact(s, StringMatch.caseInsensitive),
        s + s1
      ));
    }
  );

  Jsc.property(
    'StringMatch.matches(StringMatch.exact(s), s1 + s) === false',
    Jsc.nestring,
    Jsc.nestring,
    function (s, s1) {
      return Jsc.eq(false, StringMatch.matches(
        StringMatch.exact(s, StringMatch.caseInsensitive),
        s1 + s
      ));
    }
  );

  Jsc.property(
    'StringMatch.matches(StringMatch.exact(s), s) === true',
    Jsc.nestring,
    function (s) {
      return Jsc.eq(true, StringMatch.matches(
        StringMatch.exact(s, StringMatch.caseInsensitive),
        s
      ));
    }
  );

  Jsc.property(
    'StringMatch.matches(StringMatch.exact(s), s) === false when different case and case-insensitive',
    Jsc.asciinestring,
    function (s) {
      return s.toUpperCase() === s.toLowerCase() || Jsc.eq(true, StringMatch.matches(
        StringMatch.exact(s.toLowerCase(), StringMatch.caseInsensitive),
        s.toUpperCase()
      ));
    }
  );

  Jsc.property(
    'StringMatch.matches(StringMatch.exact(s), s) === false when different case and case-sensitive',
    Jsc.asciinestring,
    function (s) {
      return s.toUpperCase() === s.toLowerCase() || Jsc.eq(false, StringMatch.matches(
        StringMatch.exact(s.toLowerCase(), StringMatch.caseSensitive),
        s.toUpperCase()
      ));
    }
  );

  Jsc.property(
    'StringMatch.matches(StringMatch.all(s1), *) === true',
    Jsc.string,
    Jsc.string,
    function (s) {
      return Jsc.eq(true, StringMatch.matches(
        StringMatch.all(),
        s
      ));
    }
  );
});
