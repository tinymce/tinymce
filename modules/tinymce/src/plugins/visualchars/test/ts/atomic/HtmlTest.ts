import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import * as Html from 'tinymce/plugins/visualchars/core/Html';

UnitTest.test('atomic.tinymce.plugins.visualchars.HtmlTest', () => {
  Assert.eq(
    'should return correct span',
    '<span data-mce-bogus="1" class="mce-nbsp">' + Unicode.nbsp + '</span>',
    Html.wrapCharWithSpan(Unicode.nbsp)
  );

  Assert.eq(
    'should return correct span',
    '<span data-mce-bogus="1" class="mce-shy">' + Unicode.softHyphen + '</span>',
    Html.wrapCharWithSpan(Unicode.softHyphen)
  );
});
