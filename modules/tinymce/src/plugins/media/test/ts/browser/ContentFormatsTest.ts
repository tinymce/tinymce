import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.media.ContentFormatsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'media',
    toolbar: 'media',
    base_url: '/project/tinymce/js/tinymce',
    live_embeds: false,
    document_base_url: '/tinymce/tinymce/trunk/tests/',
    extended_valid_elements: 'script[src|type]',
    media_scripts: [
      { filter: 'http://media1.tinymce.com' },
      { filter: 'http://media2.tinymce.com', width: 100, height: 200 }
    ]
  }, [ Plugin, Theme ]);

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
      '<param name="movie" value="someurl" />' +
      '<param name="wmode" value="transparent" />' +
      '<embed src="someurl" type="application/x-shockwave-flash" wmode="transparent" width="425" height="355" />' +
      '</object></p>'
    );
  });

  it('TBA: Embed retained as is', () => {
    const editor = hook.editor();
    editor.setContent(
      '<embed src="320x240.ogg" width="100" height="200">text<a href="#">link</a></embed>'
    );

    TinyAssertions.assertContent(editor,
      '<p><embed src="320x240.ogg" width="100" height="200"></embed>text<a href="#">link</a></p>'
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

  it('TBA: Iframe retained as is', () => {
    const editor = hook.editor();
    editor.setContent(
      '<iframe src="320x240.ogg" allowfullscreen>text<a href="#">link</a></iframe>'
    );

    TinyAssertions.assertContent(editor,
      '<p><iframe src="320x240.ogg" allowfullscreen="allowfullscreen">text<a href="#">link</a></iframe></p>'
    );
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
      '<track kind="captions" src="foo.en.vtt" srclang="en" label="English" />' +
      '<track kind="captions" src="foo.sv.vtt" srclang="sv" label="Svenska" />' +
      'text<a href="#">link</a>' +
      '</audio>' +
      '</p>'
    );
  });

  it('TBA: Resize complex object', () => {
    const editor = hook.editor();
    editor.settings.media_live_embeds = false;
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

    const placeholderElm = editor.getBody().firstChild.firstChild as HTMLImageElement;
    placeholderElm.width = 100;
    placeholderElm.height = 200;
    editor.fire('ObjectResized', { target: placeholderElm, width: placeholderElm.width, height: placeholderElm.height, origin: 'corner-se' });
    editor.settings.media_filter_html = false;

    TinyAssertions.assertContent(editor,
      '<p>' +
      '<video controls="controls" width="100" height="200">' +
      '<source src="s" />' +
      '<object type="application/x-shockwave-flash" data="../../js/tinymce/plugins/media/moxieplayer.swf" width="100" height="200">' +
      '<param name="allowfullscreen" value="true" />' +
      '<param name="allowscriptaccess" value="always" />' +
      '<param name="flashvars" value="video_src=s" />' +
      '<!-- [if IE]>' +
      '<param name="movie" value="../../js/tinymce/plugins/media/moxieplayer.swf" />' +
      '<![endif]-->' +
      '</object>' +
      '</video>' +
      '</p>'
    );

    delete editor.settings.media_filter_html;
    delete editor.settings.media_live_embeds;
  });

  it('TBA: Media script elements', () => {
    const editor = hook.editor();
    editor.setContent(
      '<script src="http://media1.tinymce.com/123456"></sc' + 'ript>' +
      '<script src="http://media2.tinymce.com/123456"></sc' + 'ript>'
    );

    const imgs = editor.getBody().getElementsByTagName('img');
    assert.equal(imgs[0].className, 'mce-object mce-object-script');
    assert.equal(imgs[0].width, 300);
    assert.equal(imgs[0].height, 150);
    assert.equal(imgs[1].className, 'mce-object mce-object-script');
    assert.equal(imgs[1].width, 100);
    assert.equal(imgs[1].height, 200);

    TinyAssertions.assertContent(editor,
      '<p>\n' +
      '<script src="http://media1.tinymce.com/123456" type="text/javascript"></sc' + 'ript>\n' +
      '<script src="http://media2.tinymce.com/123456" type="text/javascript"></sc' + 'ript>\n' +
      '</p>'
    );
  });

  it('TBA: XSS content', () => {
    const editor = hook.editor();
    const testXss = (input: string, expectedOutput: string) => {
      editor.setContent(input);
      TinyAssertions.assertContent(editor, expectedOutput);
    };

    testXss('<video><a href="javascript:alert(1);">a</a></video>', '<p><video width="300" height="150"><a>a</a></video></p>');
    testXss('<video><img src="x" onload="alert(1)"></video>', '<p><video width="300" height=\"150\"><img src="x" /></video></p>');
    testXss('<video><img src="x"></video>', '<p><video width="300" height="150"><img src="x" /></video></p>');
    testXss('<video><!--[if IE]><img src="x"><![endif]--></video>', '<p><video width="300" height="150"><!-- [if IE]><img src="x"><![endif]--></video></p>');
    testXss('<p><p><audio src=x onerror=alert(1)></audio>', '<p><audio src="x"></audio></p>');
    testXss('<p><html><audio><br /><audio src=x onerror=alert(1)></p>', '');
    testXss('<p><audio><img src="javascript:alert(1)"></audio>', '<p><audio><img /></audio></p>');
    testXss('<p><audio><img src="x" style="behavior:url(x); width: 1px"></audio>', '<p><audio><img src="x" style="width: 1px;" /></audio></p>');
    testXss(
      '<p><video><noscript><svg onload="javascript:alert(1)"></svg></noscript></video>',
      '<p><video width="300" height="150"></video></p>'
    );
    testXss(
      '<p><video><script><svg onload="javascript:alert(1)"></svg></s' + 'cript></video>',
      '<p><video width="300" height="150"></video></p>'
    );
    testXss(
      '<p><audio><noscript><svg onload="javascript:alert(1)"></svg></noscript></audio>',
      '<p><audio></audio></p>'
    );
    testXss(
      '<p><audio><script><svg onload="javascript:alert(1)"></svg></s' + 'cript></audio>',
      '<p><audio></audio></p>'
    );
    testXss('<p><audio><script><svg></svg></script></audio>', '<p><audio></audio></p>');
  });
});
