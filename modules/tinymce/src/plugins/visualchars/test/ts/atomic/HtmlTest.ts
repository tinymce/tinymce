import Html from 'tinymce/plugins/visualchars/core/Html';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';

UnitTest.test('atomic.tinymce.plugins.visualchars.HtmlTest', function () {
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
