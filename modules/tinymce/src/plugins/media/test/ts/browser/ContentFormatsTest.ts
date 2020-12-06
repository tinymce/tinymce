import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.media.ContentFormatsTest', function (success, failure) {
  const suite = LegacyUnit.createSuite<Editor>();

  Plugin();
  Theme();

  suite.test('TestCase-TBA: Media: Object retain as is', function (editor) {
    editor.setContent(
      '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="425" height="355">' +
      '<param name="movie" value="someurl">' +
      '<param name="wmode" value="transparent">' +
      '<embed src="someurl" type="application/x-shockwave-flash" wmode="transparent" width="425" height="355" />' +
      '</object>'
    );

    LegacyUnit.equal(editor.getContent(),
      '<p><object width="425" height="355" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000">' +
      '<param name="movie" value="someurl" />' +
      '<param name="wmode" value="transparent" />' +
      '<embed src="someurl" type="application/x-shockwave-flash" wmode="transparent" width="425" height="355" />' +
      '</object></p>'
    );
  });

  suite.test('TestCase-TBA: Media: Embed retain as is', function (editor) {
    editor.setContent(
      '<embed src="320x240.ogg" width="100" height="200">text<a href="#">link</a></embed>'
    );

    LegacyUnit.equal(
      editor.getContent(),
      '<p><embed src="320x240.ogg" width="100" height="200"></embed>text<a href="#">link</a></p>'
    );
  });

  suite.test('TestCase-TBA: Media: Video retain as is', function (editor) {
    editor.setContent(
      '<video src="320x240.ogg" autoplay loop controls>text<a href="#">link</a></video>'
    );

    LegacyUnit.equal(
      editor.getContent(),
      '<p><video src="320x240.ogg" autoplay="autoplay" loop="loop" controls="controls" width="300" height="150">text<a href="#">link</a></video></p>'
    );
  });

  suite.test('TestCase-TBA: Media: Iframe retain as is', function (editor) {
    editor.setContent(
      '<iframe src="320x240.ogg" allowfullscreen>text<a href="#">link</a></iframe>'
    );

    LegacyUnit.equal(editor.getContent(),
      '<p><iframe src="320x240.ogg" allowfullscreen="allowfullscreen">text<a href="#">link</a></iframe></p>'
    );
  });

  suite.test('TestCase-TBA: Media: Audio retain as is', function (editor) {
    editor.setContent(
      '<audio src="sound.mp3">' +
      '<track kind="captions" src="foo.en.vtt" srclang="en" label="English">' +
      '<track kind="captions" src="foo.sv.vtt" srclang="sv" label="Svenska">' +
      'text<a href="#">link</a>' +
      '</audio>'
    );

    LegacyUnit.equal(editor.getContent(),
      '<p>' +
      '<audio src="sound.mp3">' +
      '<track kind="captions" src="foo.en.vtt" srclang="en" label="English" />' +
      '<track kind="captions" src="foo.sv.vtt" srclang="sv" label="Svenska" />' +
      'text<a href="#">link</a>' +
      '</audio>' +
      '</p>'
    );
  });

  suite.test('TestCase-TBA: Media: Resize complex object', function (editor) {
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
    editor.fire('objectResized', { target: placeholderElm, width: placeholderElm.width, height: placeholderElm.height });
    editor.settings.media_filter_html = false;

    LegacyUnit.equal(editor.getContent(),
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

  suite.test('TestCase-TBA: Media: Media script elements', function (editor) {
    editor.setContent(
      '<script src="http://media1.tinymce.com/123456"></sc' + 'ript>' +
      '<script src="http://media2.tinymce.com/123456"></sc' + 'ript>'
    );

    LegacyUnit.equal(editor.getBody().getElementsByTagName('img')[0].className, 'mce-object mce-object-script');
    LegacyUnit.equal(editor.getBody().getElementsByTagName('img')[0].width, 300);
    LegacyUnit.equal(editor.getBody().getElementsByTagName('img')[0].height, 150);
    LegacyUnit.equal(editor.getBody().getElementsByTagName('img')[1].className, 'mce-object mce-object-script');
    LegacyUnit.equal(editor.getBody().getElementsByTagName('img')[1].width, 100);
    LegacyUnit.equal(editor.getBody().getElementsByTagName('img')[1].height, 200);

    LegacyUnit.equal(editor.getContent(),
      '<p>\n' +
      '<script src="http://media1.tinymce.com/123456" type="text/javascript"></sc' + 'ript>\n' +
      '<script src="http://media2.tinymce.com/123456" type="text/javascript"></sc' + 'ript>\n' +
      '</p>'
    );
  });

  suite.test('TestCase-TBA: Media: XSS content', function (editor) {
    function testXss(input, expectedOutput) {
      editor.setContent(input);
      LegacyUnit.equal(editor.getContent(), expectedOutput);
    }

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

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, Log.steps('TBA', 'Media: Test media content formats', suite.toSteps(editor)), onSuccess, onFailure);
  }, {
    plugins: 'media',
    toolbar: 'media',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    live_embeds: false,
    document_base_url: '/tinymce/tinymce/trunk/tests/',
    extended_valid_elements: 'script[src|type]',
    media_scripts: [
      { filter: 'http://media1.tinymce.com' },
      { filter: 'http://media2.tinymce.com', width: 100, height: 200 }
    ]
  }, success, failure);
});
