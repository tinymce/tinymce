import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as Sanitise from 'ephox/polaris/string/Sanitise';

UnitTest.test('api.Sanitise.css', () => {
  const check = (expected: string, input: string) => {
    const actual = Sanitise.css(input);
    Assert.eq('', expected, actual);
  };

  check('e', '');
  check('a', 'a');
  check('abcdefg', 'abcdefg');
  check('e_bogus', '_bogus');
  check('a-big-long-string', 'a big long string');
});
