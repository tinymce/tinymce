import { UnitTest, assert } from '@ephox/bedrock-client';
import { buildUrl } from 'ephox/jax/core/UrlBuilder';
import { Option } from '@ephox/katamari';

UnitTest.test('UrlBuilderTest', () => {
  const createRecord = (record: any) => Option.some<Record<string, string>>(record);

  // copied from agar, perhaps we shoud move it to bedrock
  const assertEq = function <T> (label: string, expected: string, actual: string) {
    assert.eq(expected, actual, `${label}.\n  Expected: ${expected} \n  Actual: ${actual}`);
  };

  assertEq('Should remain unchanged', 'http://localhost', buildUrl('http://localhost', Option.none()));
  assertEq('Should remain unchanged', 'http://localhost?a=1', buildUrl('http://localhost?a=1', Option.none()));
  assertEq('Should remain unchanged', 'http://localhost?a=1&b=2', buildUrl('http://localhost?a=1&b=2', Option.none()));
  assertEq('Should remain unchanged', 'http://localhost', buildUrl('http://localhost', Option.some({})));

  assertEq('Should be expected url with encoding', 'http://localhost?a=1%262', buildUrl('http://localhost', createRecord({ a: '1&2' })));
  assertEq('Should be expected url with encoding', 'http://localhost?a%26b=1', buildUrl('http://localhost', createRecord({ 'a&b': '1' })));
  assertEq('Should be expected url', 'http://localhost?a=1', buildUrl('http://localhost', createRecord({ a: '1' })));
  assertEq('Should be expected url', 'http://localhost?a=1&b=2', buildUrl('http://localhost', createRecord({ a: '1', b: '2' })));
  assertEq('Should be expected url', 'http://localhost?a=1&b=2&c=3', buildUrl('http://localhost?a=1', createRecord({ b: '2', c: '3' })));
  assertEq('Should be expected url', 'http://localhost?a=1&b=2&c=3', buildUrl('http://localhost?a=1&b=2', createRecord({ c: '3' })));
});
