import Html from 'tinymce/plugins/visualchars/core/Html';
import { Assert, UnitTest } from '@ephox/bedrock-client';

UnitTest.test('atomic.tinymce.plugins.visualchars.HtmlTest', function () {
  const nbsp = '\u00a0';
  const shy = '\u00AD';

  Assert.eq(
    'should return correct span',
    '<span data-mce-bogus="1" class="mce-nbsp">' + nbsp + '</span>',
    Html.wrapCharWithSpan(nbsp)
  );

  Assert.eq(
    'should return correct span',
    '<span data-mce-bogus="1" class="mce-shy">' + shy + '</span>',
    Html.wrapCharWithSpan(shy)
  );
});
