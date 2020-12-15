import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Data from 'tinymce/plugins/visualchars/core/Data';

UnitTest.test('atomic.tinymce.plugins.visualchars.DataTest', () => {
  Assert.eq(
    'should return correct selector',
    'span.mce-a,span.mce-b',
    Data.charMapToSelector({ a: 'a', b: 'b' })
  );

  Assert.eq(
    'should return correct regexp',
    '/[ab]/',
    Data.charMapToRegExp({ a: 'a', b: 'b' }).toString()
  );

  Assert.eq(
    'should return correct global regexp',
    '/[ab]/g',
    Data.charMapToRegExp({ a: 'a', b: 'b' }, true).toString()
  );
});
