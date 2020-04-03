import { StringMatch } from 'ephox/katamari/api/StringMatch';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('StringMatch: unit tests', () => {
  const check = (testcase) => {
    Assert.eq('matches', testcase.expected, StringMatch.matches(testcase.match, testcase.input));
    Assert.eq('not matches', !testcase.expected, StringMatch.matches(
      StringMatch.not(testcase.match),
      testcase.input
    ));
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

  for (let i = 0; i < testcases.length; i++) {
    check(testcases[i]);
  }
});

UnitTest.test('StringMatch.matches(StringMatch.starts(s1), s1 + s) === true', () => {
  fc.assert(fc.property(
    fc.string(),
    fc.string(),
    (s, s1) => {
      Assert.eq('eq', true, StringMatch.matches(
        StringMatch.starts(s1, StringMatch.caseInsensitive),
        s1 + s
      ));
    }
  ));
});

UnitTest.test('StringMatch.matches(StringMatch.contains(s1), s1 + s) === true', () => {
  fc.assert(fc.property(
    fc.string(),
    fc.string(),
    (s, s1) => {
      Assert.eq('eq', true, StringMatch.matches(
        StringMatch.contains(s1, StringMatch.caseInsensitive),
        s1 + s
      ));
    }
  ));
});

UnitTest.test('StringMatch.matches(StringMatch.contains(s1), s + s1) === true', () => {
  fc.assert(fc.property(
    fc.string(),
    fc.string(),
    (s, s1) => {
      Assert.eq('eq', true, StringMatch.matches(
        StringMatch.contains(s1, StringMatch.caseInsensitive),
        s + s1
      ));
    }
  ));
});

UnitTest.test('StringMatch.matches(StringMatch.contains(s1), s) === s.indexOf(s1)', () => {
  fc.assert(fc.property(
    fc.asciiString(),
    fc.asciiString(1, 40),
    (s, s1) => {
      Assert.eq('eq', s.toLowerCase().indexOf(s1.toLowerCase()) > -1, StringMatch.matches(
        StringMatch.contains(s1, StringMatch.caseInsensitive),
        s
      ));
    }
  ));
});

UnitTest.test('StringMatch.matches(StringMatch.contains(s), s) === true', () => {
  fc.assert(fc.property(
    fc.string(),
    (s) => {
      Assert.eq('eq', true, StringMatch.matches(
        StringMatch.contains(s, StringMatch.caseInsensitive),
        s
      ));
    }
  ));
});

UnitTest.test('StringMatch.matches(StringMatch.exact(s), s + s1) === false', () => {
  fc.assert(fc.property(
    fc.string(1, 40),
    fc.string(1, 40),
    (s, s1) => {
      Assert.eq('eq', false, StringMatch.matches(
        StringMatch.exact(s, StringMatch.caseInsensitive),
        s + s1
      ));
    }
  ));
});

UnitTest.test('StringMatch.matches(StringMatch.exact(s), s1 + s) === false', () => {
  fc.assert(fc.property(
    fc.string(1, 40),
    fc.string(1, 40),
    (s, s1) => {
      Assert.eq('eq', false, StringMatch.matches(
        StringMatch.exact(s, StringMatch.caseInsensitive),
        s1 + s
      ));
    }
  ));
});

UnitTest.test('StringMatch.matches(StringMatch.exact(s), s) === true', () => {
  fc.assert(fc.property(
    fc.string(1, 40),
    (s) => {
      Assert.eq('eq', true, StringMatch.matches(
        StringMatch.exact(s, StringMatch.caseInsensitive),
        s
      ));
    }
  ));
});

UnitTest.test('StringMatch.matches(StringMatch.exact(s), s) === false when different case and case-insensitive', () => {
  fc.assert(fc.property(
    fc.asciiString(1, 40),
    (s) => s.toUpperCase() === s.toLowerCase() || StringMatch.matches(
      StringMatch.exact(s.toLowerCase(), StringMatch.caseInsensitive),
      s.toUpperCase()
    )
  ));
});

UnitTest.test('StringMatch.matches(StringMatch.exact(s), s) === false when different case and case-sensitive', () => {
  fc.assert(fc.property(
    fc.asciiString(1, 40),
    (s) => s.toUpperCase() === s.toLowerCase() || !StringMatch.matches(
      StringMatch.exact(s.toLowerCase(), StringMatch.caseSensitive),
      s.toUpperCase()
    )
  ));
});

UnitTest.test('StringMatch.matches(StringMatch.all(s1), *) === true', () => {
  fc.assert(fc.property(
    fc.string(),
    fc.string(),
    (s) => {
      Assert.eq('eq', true, StringMatch.matches(
        StringMatch.all(),
        s
      ));
    }
  ));
});
