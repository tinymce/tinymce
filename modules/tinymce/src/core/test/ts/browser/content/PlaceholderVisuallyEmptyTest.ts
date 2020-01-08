import { Assertions, GeneralSteps, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { isVisuallyEmpty } from 'tinymce/core/content/Placeholder';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.content.PlaceholderVisuallyEmptyTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApi = TinyApis(editor);

    const sAssertEmpty = (label: string, expected: boolean, forcedRootBlockFalse: boolean) => Step.sync(() => {
      const body = editor.getBody();
      Assertions.assertEq(label, expected, isVisuallyEmpty(editor.dom, body, forcedRootBlockFalse ? '' : 'p'));
    });

    const sTestEmpty = (content: string, forcedRootBlockFalse: boolean = false) => GeneralSteps.sequence([
      tinyApi.sSetRawContent(content),
      sAssertEmpty(`Check "${content}" is empty`, true, forcedRootBlockFalse)
    ]);

    const sTestNotEmpty = (content: string, forcedRootBlockFalse: boolean = false) => GeneralSteps.sequence([
      tinyApi.sSetRawContent(content),
      sAssertEmpty(`Check "${content}" is not empty`, false, forcedRootBlockFalse)
    ]);

    Pipeline.async({}, [
      Log.stepsAsStep('TINY-3917', 'Check initial content is empty', [
        sAssertEmpty('Check base empty content', true, true)
      ]),
      Log.stepsAsStep('TINY-3917', 'Check content is visually empty - forced_root_block: "p"', [
        sTestEmpty('<p></p>'),
        sTestEmpty('<p><br /></p>'),
        sTestEmpty('<p><br data-mce-bogus="1" /></p>'),
        sTestEmpty('<p>' + Unicode.zeroWidth + '</p>'),
        sTestEmpty('<p><span data-mce-bogus="1" data-mce-type="format-caret"><strong></strong></span><br data-mce-bogus="1" /></p>')
      ]),
      Log.stepsAsStep('TINY-3917', 'Check content is visually empty - forced_root_block: false', [
        sTestEmpty('', true),
        sTestEmpty('<br />', true),
        sTestEmpty('<br data-mce-bogus="1" />', true),
        sTestEmpty(Unicode.zeroWidth),
        sTestEmpty('<span data-mce-bogus="1" data-mce-type="format-caret"><strong></strong></span><br data-mce-bogus="1" />', true)
      ]),
      Log.stepsAsStep('TINY-3917', 'Check content is NOT visually empty - forced_root_block: "p"', [
        sTestNotEmpty('<p>Text</p>'),
        sTestNotEmpty('<p>' + Unicode.nbsp + '</p>'),
        sTestNotEmpty('<p><br data-mce-bogus="1" /><br /></p>'),
        sTestNotEmpty('<ol><li></li></ol>'),
        sTestNotEmpty('<hr />'),
        sTestNotEmpty('<p style="padding-left: 40px"><br data-mce-bogus="1" /></p>'),
        sTestNotEmpty('<p><a href="#id">Link</a></p>'),
        sTestNotEmpty('<p><span data-mce-bogus="all"><a href="#id">Link</a></span></p>'),
        sTestNotEmpty('<figure><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==" /></figure>'),
        sTestNotEmpty('<p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==" /></p>'),
        sTestNotEmpty('<table><tbody><tr><td></td><td></td></tr></tbody></table>'),
        sTestNotEmpty('<pre class="language-markup"><code>test</code></pre>'),
        sTestNotEmpty('<blockquote><p>' + Unicode.nbsp + '</p></blockquote>')
      ]),
      Log.stepsAsStep('TINY-3917', 'Check content is NOT visually empty - forced_root_block: false', [
        sTestNotEmpty('Text', true),
        sTestNotEmpty(Unicode.nbsp, true),
        sTestNotEmpty('<br data-mce-bogus="1" /><br />'),
        sTestNotEmpty('<ol><li></li></ol>', true),
        sTestNotEmpty('<hr />', true),
        sTestNotEmpty('<div style="padding-left: 40px"><br data-mce-bogus="1" /></div>', true),
        sTestNotEmpty('<a href="#id">Link</a>', true),
        sTestNotEmpty('<span data-mce-bogus="all"><a href="#id">Link</a></span>', true),
        sTestNotEmpty('<figure><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==" /></figure>', true),
        sTestNotEmpty('<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==" />', true),
        sTestNotEmpty('<table><tbody><tr><td></td><td></td></tr></tbody></table>', true),
        sTestNotEmpty('<pre class="language-markup"><code>test</code></pre>', true),
        sTestNotEmpty('<blockquote><p>' + Unicode.nbsp + '</p></blockquote>', true)
      ])
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    forced_root_block: false
  }, success, failure);
});
