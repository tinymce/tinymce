import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import { buildUrl } from 'ephox/jax/core/UrlBuilder';

UnitTest.test('UrlBuilderTest', () => {
  const createRecord = (record: any) => Optional.some<Record<string, string>>(record);

  // copied from agar, perhaps we should move it to bedrock
  const assertEq = (label: string, expected: string, actual: string) => {
    Assert.eq(`${label}.\n  Expected: ${expected} \n  Actual: ${actual}`, expected, actual);
  };

  assertEq('Should remain unchanged', 'http://localhost', buildUrl('http://localhost', Optional.none()));
  assertEq('Should remain unchanged', 'http://localhost?a=1', buildUrl('http://localhost?a=1', Optional.none()));
  assertEq('Should remain unchanged', 'http://localhost?a=1&b=2', buildUrl('http://localhost?a=1&b=2', Optional.none()));
  assertEq('Should remain unchanged', 'http://localhost', buildUrl('http://localhost', Optional.some({})));

  assertEq('Should be expected url with encoding', 'http://localhost?a=1%262', buildUrl('http://localhost', createRecord({ a: '1&2' })));
  assertEq('Should be expected url with encoding', 'http://localhost?a%26b=1', buildUrl('http://localhost', createRecord({ 'a&b': '1' })));
  assertEq('Should be expected url', 'http://localhost?a=1', buildUrl('http://localhost', createRecord({ a: '1' })));
  assertEq('Should be expected url', 'http://localhost?a=1&b=2', buildUrl('http://localhost', createRecord({ a: '1', b: '2' })));
  assertEq('Should be expected url', 'http://localhost?a=1&b=2&c=3', buildUrl('http://localhost?a=1', createRecord({ b: '2', c: '3' })));
  assertEq('Should be expected url', 'http://localhost?a=1&b=2&c=3', buildUrl('http://localhost?a=1&b=2', createRecord({ c: '3' })));
});
