import { describe, it } from '@ephox/bedrock-client';
import { McEditor, TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';

describe('browser.tinymce.plugins.media.ContentFormatsTest', () => {
  const settings = {
    plugins: 'media',
    toolbar: 'media',
    base_url: '/project/tinymce/js/tinymce',
    media_live_embeds: false,
    document_base_url: '/tinymce/tinymce/trunk/tests/',
    extended_valid_elements: 'script[src|type]',
    allow_conditional_comments: true
  };
  const hook = TinyHooks.bddSetupLight<Editor>(settings, [ Plugin ]);

  it('TBA: Object retained as is', () => {
    const editor = hook.editor();
    editor.setContent(
      '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="425" height="355">' +
      '<param name="movie" value="someurl">' +
      '<param name="wmode" value="transparent">' +
      '<embed src="someurl" type="application/x-shockwave-flash" wmode="transparent" width="425" height="355" />' +
      '</object>'
    );

    TinyAssertions.assertContent(editor,
      '<p><object width="425" height="355" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000">' +
      '<param name="movie" value="someurl">' +
      '<param name="wmode" value="transparent">' +
      '<embed src="someurl" type="application/x-shockwave-flash" width="425" height="355" wmode="transparent">' +
      '</object></p>'
    );
  });

  it('TBA: Embed retained as is', () => {
    const editor = hook.editor();
    editor.setContent(
      '<embed src="320x240.ogg" width="100" height="200">text<a href="#">link</a></embed>'
    );

    TinyAssertions.assertContent(editor,
      '<p><embed src="320x240.ogg" width="100" height="200">text<a href="#">link</a></p>'
    );
  });

  it('TBA: Video retained as is', () => {
    const editor = hook.editor();
    editor.setContent(
      '<video src="320x240.ogg" autoplay loop controls>text<a href="#">link</a></video>'
    );

    TinyAssertions.assertContent(editor,
      '<p><video src="320x240.ogg" autoplay="autoplay" loop="loop" controls="controls" width="300" height="150">text<a href="#">link</a></video></p>'
    );
  });

  it('TINY-10348: Iframe retained as is with sandbox_iframes: false', async () => {
    const editor = await McEditor.pFromSettings({ ...settings, sandbox_iframes: false });
    editor.setContent('<iframe src="320x240.ogg" allowfullscreen></iframe>');
    TinyAssertions.assertContent(editor,
      '<p><iframe src="320x240.ogg" width="300" height="150" allowfullscreen="allowfullscreen"></iframe></p>'
    );
    McEditor.remove(editor);
  });

  it('TINY-10348: Iframe retained as is with sandbox_iframes: true', async () => {
    const editor = await McEditor.pFromSettings({ ...settings, sandbox_iframes: true });
    editor.setContent('<iframe src="320x240.ogg" allowfullscreen></iframe>');
    TinyAssertions.assertContent(editor,
      '<p><iframe src="320x240.ogg" width="300" height="150" sandbox="" allowfullscreen="allowfullscreen"></iframe></p>'
    );
    McEditor.remove(editor);
  });

  it('TBA: Iframe with innerHTML retained as is with xss_sanitization: false', async () => {
    // TINY-8363: Iframe with innerHTML is removed by DOMPurify, so disable sanitization for this test
    const editor = await McEditor.pFromSettings<Editor>({
      ...settings,
      xss_sanitization: false
    });
    editor.setContent(
      '<iframe src="320x240.ogg" allowfullscreen>text<a href="#">link</a></iframe>'
    );
    TinyAssertions.assertContent(editor,
      '<p><iframe src="320x240.ogg" width="300" height="150" allowfullscreen="allowfullscreen">text<a href="#">link</a></iframe></p>'
    );
    McEditor.remove(editor);
  });

  it('TBA: Audio retained as is', () => {
    const editor = hook.editor();
    editor.setContent(
      '<audio src="sound.mp3">' +
      '<track kind="captions" src="foo.en.vtt" srclang="en" label="English">' +
      '<track kind="captions" src="foo.sv.vtt" srclang="sv" label="Svenska">' +
      'text<a href="#">link</a>' +
      '</audio>'
    );

    TinyAssertions.assertContent(editor,
      '<p>' +
      '<audio src="sound.mp3">' +
      '<track kind="captions" src="foo.en.vtt" srclang="en" label="English">' +
      '<track kind="captions" src="foo.sv.vtt" srclang="sv" label="Svenska">' +
      'text<a href="#">link</a>' +
      '</audio>' +
      '</p>'
    );
  });

  it('TBA: Resize complex object', () => {
    const editor = hook.editor();
    editor.options.set('media_live_embeds', false);
    editor.setContent(
      '<video width="300" height="150" controls="controls">' +
      '<source src="s" />' +
      '<object type="application/x-shockwave-flash" data="../../js/tinymce/plugins/media/moxieplayer.swf" width="300" height="150">' +
      '<param name="allowfullscreen" value="true" />' +
      '<param name="allowscriptaccess" value="always" />' +
      '<param name="flashvars" value="video_src=s" />' +
      '<!--[if IE]><param name="movie" value="../../js/tinymce/plugins/media/moxieplayer.swf" /><![endif]-->' +
      '</object>' +
      '</video>'
    );

    const placeholderElm = editor.dom.select('img')[0];
    placeholderElm.width = 100;
    placeholderElm.height = 200;
    editor.dispatch('ObjectResized', { target: placeholderElm, width: placeholderElm.width, height: placeholderElm.height, origin: 'corner-se' });
    editor.options.set('media_filter_html', false);

    TinyAssertions.assertContent(editor,
      '<p>' +
      '<video controls="controls" width="100" height="200">' +
      '<source src="s">' +
      '<object data="../../js/tinymce/plugins/media/moxieplayer.swf" type="application/x-shockwave-flash" width="100" height="200">' +
      '<param name="allowfullscreen" value="true">' +
      '<param name="allowscriptaccess" value="always">' +
      '<param name="flashvars" value="video_src=s">' +
      '<!--[if IE]>' +
      '<param name="movie" value="../../js/tinymce/plugins/media/moxieplayer.swf" />' +
      '<![endif]-->' +
      '</object>' +
      '</video>' +
      '</p>'
    );

    editor.options.unset('media_filter_html');
    editor.options.unset('media_live_embeds');
  });

  it('TBA: XSS content', () => {
    const editor = hook.editor();
    const testXss = (input: string, expectedOutput: string) => {
      editor.setContent(input);
      TinyAssertions.assertContent(editor, expectedOutput);
    };

    testXss('<video><a href="javascript:alert(1);">a</a></video>', '<p><video width="300" height="150"><a>a</a></video></p>');
    testXss('<video><img src="x" onload="alert(1)"></video>', '<p><video width="300" height=\"150\"><img src="x"></video></p>');
    testXss('<video><img src="x"></video>', '<p><video width="300" height="150"><img src="x"></video></p>');
    testXss('<p><audio src=x onerror=alert(1)></audio></p>', '<p><audio src="x"></audio></p>');
    testXss('<p><html><audio><br /><audio src=x onerror=alert(1)></p>', '<p><audio><br></audio><audio src="x"></audio></p>');
    testXss('<p><audio><img src="javascript:alert(1)"></audio>', '<p><audio><img></audio></p>');
    testXss(
      '<p><video><noscript><svg onload="javascript:alert(1)"></svg></noscript></video>',
      '<p><video width="300" height="150"><noscript></noscript></video></p>'
    );
    testXss(
      '<p><video><script><svg onload="javascript:alert(1)"></svg></s' + 'cript></video>',
      '<p><video width="300" height="150"></video></p>'
    );
    testXss(
      '<p><audio><noscript><svg onload="javascript:alert(1)"></svg></noscript></audio>',
      '<p><audio><noscript></noscript></audio></p>'
    );
    testXss(
      '<p><audio><script><svg onload="javascript:alert(1)"></svg></s' + 'cript></audio>',
      '<p><audio></audio></p>'
    );
    testXss('<p><audio><script><svg></svg></script></audio>', '<p><audio></audio></p>');
  });
});
