import { UnitTest } from '@ephox/bedrock';
import { buildUrl } from 'ephox/jax/core/UrlBuilder';
import { Option } from '@ephox/katamari';
import { RawAssertions } from '@ephox/agar';

UnitTest.test('UrlBuilderTest', () => {
  const createRecord = (record: any) => Option.some<Record<string, string>>(record);

  RawAssertions.assertEq('Should remain unchanged', 'http://localhost', buildUrl('http://localhost', Option.none()));
  RawAssertions.assertEq('Should remain unchanged', 'http://localhost?a=1', buildUrl('http://localhost?a=1', Option.none()));
  RawAssertions.assertEq('Should remain unchanged', 'http://localhost?a=1&b=2', buildUrl('http://localhost?a=1&b=2', Option.none()));
  RawAssertions.assertEq('Should remain unchanged', 'http://localhost', buildUrl('http://localhost', Option.some({})));

  RawAssertions.assertEq('Should be expected url with encoding', 'http://localhost?a=1%262', buildUrl('http://localhost', createRecord({ a: '1&2' })));
  RawAssertions.assertEq('Should be expected url with encoding', 'http://localhost?a%26b=1', buildUrl('http://localhost', createRecord({ 'a&b': '1' })));
  RawAssertions.assertEq('Should be expected url', 'http://localhost?a=1', buildUrl('http://localhost', createRecord({ a: '1' })));
  RawAssertions.assertEq('Should be expected url', 'http://localhost?a=1&b=2', buildUrl('http://localhost', createRecord({ a: '1', b: '2' })));
  RawAssertions.assertEq('Should be expected url', 'http://localhost?a=1&b=2&c=3', buildUrl('http://localhost?a=1', createRecord({ b: '2', c: '3' })));
  RawAssertions.assertEq('Should be expected url', 'http://localhost?a=1&b=2&c=3', buildUrl('http://localhost?a=1&b=2', createRecord({ c: '3' })));
});
