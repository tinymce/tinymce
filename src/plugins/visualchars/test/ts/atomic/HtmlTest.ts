import { RawAssertions } from '@ephox/agar';
import Html from 'tinymce/plugins/visualchars/core/Html';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('atomic.tinymce.plugins.visualchars.HtmlTest', function () {
  const nbsp = '\u00a0';
  const shy = '\u00AD';

  RawAssertions.assertEq(
    'should return correct span',
    '<span data-mce-bogus="1" class="mce-nbsp">' + nbsp + '</span>',
    Html.wrapCharWithSpan(nbsp)
  );

  RawAssertions.assertEq(
    'should return correct span',
    '<span data-mce-bogus="1" class="mce-shy">' + shy + '</span>',
    Html.wrapCharWithSpan(shy)
  );
});
