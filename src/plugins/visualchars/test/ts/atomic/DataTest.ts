import { RawAssertions } from '@ephox/agar';
import Data from 'tinymce/plugins/visualchars/core/Data';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('atomic.tinymce.plugins.visualchars.DataTest', function () {
  RawAssertions.assertEq(
    'should return correct selector',
    'span.mce-a,span.mce-b',
    Data.charMapToSelector({ a: 'a', b: 'b' })
  );

  RawAssertions.assertEq(
    'should return correct regexp',
    '/[ab]/',
    Data.charMapToRegExp({ a: 'a', b: 'b' }).toString()
  );

  RawAssertions.assertEq(
    'should return correct global regexp',
    '/[ab]/g',
    Data.charMapToRegExp({ a: 'a', b: 'b' }, true).toString()
  );
});
