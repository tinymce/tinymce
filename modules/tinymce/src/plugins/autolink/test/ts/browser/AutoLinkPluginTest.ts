import { Log, Pipeline } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Plugin from 'tinymce/plugins/autolink/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import * as KeyUtils from '../module/test/KeyUtils';
import fc from 'fast-check';

UnitTest.asynctest('browser.tinymce.plugins.autolink.AutoLinkPluginTest', (success, failure) => {
  const suite = LegacyUnit.createSuite<Editor>();

  Theme();
  Plugin();

  const typeUrl = (editor: Editor, url: string): string => {
    editor.setContent('<p>' + url + '</p>');
    LegacyUnit.setSelection(editor, 'p', url.length);
    KeyUtils.type(editor, ' ');
    return editor.getContent();
  };

  const typeAnEclipsedURL = function (editor: Editor, url: string) {
    url = '(' + url;
    editor.setContent('<p>' + url + '</p>');
    LegacyUnit.setSelection(editor, 'p', url.length);
    KeyUtils.type(editor, ')');
    return editor.getContent();
  };

  const typeNewlineURL = (editor: Editor, url: string): string => {
    editor.setContent('<p>' + url + '</p>');
    LegacyUnit.setSelection(editor, 'p', url.length);
    KeyUtils.type(editor, '\n');
    return editor.getContent();
  };

  const assertNoLink = (editor: Editor, s: string): void => {
    Assert.eq('Should not convert to link', `<p>${s}&nbsp;</p>`, typeUrl(editor, s));
  };

  const test = (label: string, runTest: (editor: Editor) => void): void => {
    suite.test('TestCase-TBA: AutoLink: Correct urls ended with space', (editor) => {
      editor.focus();
      runTest(editor);
    });
  };

  test('TestCase-TBA: AutoLink: Correct urls ended with space', (editor) => {
    LegacyUnit.equal(typeUrl(editor, 'http://www.domain.com'), '<p><a href="http://www.domain.com">http://www.domain.com</a>&nbsp;</p>');
    LegacyUnit.equal(typeUrl(editor, 'https://www.domain.com'), '<p><a href="https://www.domain.com">https://www.domain.com</a>&nbsp;</p>');
    LegacyUnit.equal(typeUrl(editor, 'ssh://www.domain.com'), '<p><a href="ssh://www.domain.com">ssh://www.domain.com</a>&nbsp;</p>');
    LegacyUnit.equal(typeUrl(editor, 'ftp://www.domain.com'), '<p><a href="ftp://www.domain.com">ftp://www.domain.com</a>&nbsp;</p>');
    LegacyUnit.equal(typeUrl(editor, 'www.domain.com'), '<p><a href="http://www.domain.com">www.domain.com</a>&nbsp;</p>');
    LegacyUnit.equal(typeUrl(editor, 'www.domain.com.'), '<p><a href="http://www.domain.com">www.domain.com</a>.&nbsp;</p>');
    LegacyUnit.equal(typeUrl(editor, 'user@domain.com'), '<p><a href="mailto:user@domain.com">user@domain.com</a>&nbsp;</p>');
    LegacyUnit.equal(typeUrl(editor, 'mailto:user@domain.com'), '<p><a href="mailto:user@domain.com">mailto:user@domain.com</a>&nbsp;</p>');
    LegacyUnit.equal(typeUrl(editor, 'first-last@domain.com'), '<p><a href="mailto:first-last@domain.com">first-last@domain.com</a>&nbsp;</p>');
  });

  test('TestCase-TBA: AutoLink: Unexpected urls ended with space', (editor) => {
    LegacyUnit.equal(typeUrl(editor, 'first-last@domain'), '<p><a href="mailto:first-last@domain">first-last@domain</a>&nbsp;</p>'); // No .com or similar needed.
    LegacyUnit.equal(typeUrl(editor, 'first-last@()'), '<p><a href="mailto:first-last@()">first-last@()</a>&nbsp;</p>'); // Anything goes after the @.
    LegacyUnit.equal(typeUrl(editor, 'first-last@¶¶KJ'), '<p><a href="mailto:first-last@&para;&para;KJ">first-last@&para;&para;KJ</a>&nbsp;</p>'); // Anything goes after the @
  });

  test('TestCase-TBA: AutoLink: text which should not work', (editor) => {
    assertNoLink(editor, 'first-last@@domain@.@com'); // We only accept one @
    assertNoLink(editor, 'first-last@'); // We only accept one @
  });

  test('TestCase-TBA: AutoLink: multiple @ characters', (editor) => {
    fc.assert(fc.property(fc.hexaString(0, 30), fc.hexaString(0, 30), fc.hexaString(0, 30), (s1, s2, s3) => {
      assertNoLink(editor, `${s1}@@${s2}@.@${s3}`);
    }));
  });

  test('TestCase-TBA: AutoLink: ending in @ character', (editor) => {
    fc.assert(fc.property(fc.hexaString(0, 100), (s1) => {
      assertNoLink(editor, `${s1}@`);
    }));
  });

  test('TestCase-TBA: AutoLink: Urls ended with )', function (editor) {
    LegacyUnit.equal(
      typeAnEclipsedURL(editor, 'http://www.domain.com'),
      '<p>(<a href="http://www.domain.com">http://www.domain.com</a>)</p>'
    );
    LegacyUnit.equal(
      typeAnEclipsedURL(editor, 'https://www.domain.com'),
      '<p>(<a href="https://www.domain.com">https://www.domain.com</a>)</p>'
    );
    LegacyUnit.equal(
      typeAnEclipsedURL(editor, 'ssh://www.domain.com'),
      '<p>(<a href="ssh://www.domain.com">ssh://www.domain.com</a>)</p>'
    );
    LegacyUnit.equal(
      typeAnEclipsedURL(editor, 'ftp://www.domain.com'),
      '<p>(<a href="ftp://www.domain.com">ftp://www.domain.com</a>)</p>'
    );
    LegacyUnit.equal(typeAnEclipsedURL(editor, 'www.domain.com'), '<p>(<a href="http://www.domain.com">www.domain.com</a>)</p>');
    LegacyUnit.equal(typeAnEclipsedURL(editor, 'www.domain.com.'), '<p>(<a href="http://www.domain.com">www.domain.com</a>.)</p>');
  });

  test('TestCase-TBA: AutoLink: Urls ended with new line', function (editor) {
    LegacyUnit.equal(
      typeNewlineURL(editor, 'http://www.domain.com'),
      '<p><a href="http://www.domain.com">http://www.domain.com</a></p><p>&nbsp;</p>'
    );
    LegacyUnit.equal(
      typeNewlineURL(editor, 'https://www.domain.com'),
      '<p><a href="https://www.domain.com">https://www.domain.com</a></p><p>&nbsp;</p>'
    );
    LegacyUnit.equal(
      typeNewlineURL(editor, 'ssh://www.domain.com'),
      '<p><a href="ssh://www.domain.com">ssh://www.domain.com</a></p><p>&nbsp;</p>'
    );
    LegacyUnit.equal(
      typeNewlineURL(editor, 'ftp://www.domain.com'),
      '<p><a href="ftp://www.domain.com">ftp://www.domain.com</a></p><p>&nbsp;</p>'
    );
    LegacyUnit.equal(
      typeNewlineURL(editor, 'www.domain.com'),
      '<p><a href="http://www.domain.com">www.domain.com</a></p><p>&nbsp;</p>'
    );
    LegacyUnit.equal(
      typeNewlineURL(editor, 'www.domain.com.'),
      '<p><a href="http://www.domain.com">www.domain.com</a>.</p><p>&nbsp;</p>'
    );
  });

  test('TestCase-TBA: AutoLink: Url inside blank formatting wrapper', function (editor) {
    editor.focus();
    editor.setContent('<p><br></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild, 0);
    editor.execCommand('Bold');
    // inserting url via typeUrl() results in different behaviour, so lets simply type it in, char by char
    KeyUtils.typeString(editor, 'http://www.domain.com ');
    LegacyUnit.equal(
      editor.getContent(),
      '<p><strong><a href="http://www.domain.com">http://www.domain.com</a>&nbsp;</strong></p>'
    );
  });

  suite.test(`TestCase-TBA: AutoLink: default_link_target='_self'`, function (editor) {
    editor.settings.default_link_target = '_self';
    LegacyUnit.equal(
      typeUrl(editor, 'http://www.domain.com'),
      '<p><a href="http://www.domain.com" target="_self">http://www.domain.com</a>&nbsp;</p>'
    );
    delete editor.settings.default_link_target;
  });

  test('TestCase-TBA: AutoLink: link_default_protocol=https', function (editor) {
    editor.settings.link_default_protocol = 'https';
    LegacyUnit.equal(typeUrl(editor, 'http://www.domain.com'), '<p><a href="http://www.domain.com">http://www.domain.com</a>&nbsp;</p>');
    LegacyUnit.equal(typeUrl(editor, 'https://www.domain.com'), '<p><a href="https://www.domain.com">https://www.domain.com</a>&nbsp;</p>');
    LegacyUnit.equal(typeUrl(editor, 'ssh://www.domain.com'), '<p><a href="ssh://www.domain.com">ssh://www.domain.com</a>&nbsp;</p>');
    LegacyUnit.equal(typeUrl(editor, 'ftp://www.domain.com'), '<p><a href="ftp://www.domain.com">ftp://www.domain.com</a>&nbsp;</p>');
    LegacyUnit.equal(typeUrl(editor, 'www.domain.com'), '<p><a href="https://www.domain.com">www.domain.com</a>&nbsp;</p>');
    LegacyUnit.equal(typeUrl(editor, 'www.domain.com.'), '<p><a href="https://www.domain.com">www.domain.com</a>.&nbsp;</p>');
    LegacyUnit.equal(typeUrl(editor, 'user@domain.com'), '<p><a href="mailto:user@domain.com">user@domain.com</a>&nbsp;</p>');
    LegacyUnit.equal(typeUrl(editor, 'mailto:user@domain.com'), '<p><a href="mailto:user@domain.com">mailto:user@domain.com</a>&nbsp;</p>');
    LegacyUnit.equal(typeUrl(editor, 'first-last@domain.com'), '<p><a href="mailto:first-last@domain.com">first-last@domain.com</a>&nbsp;</p>');
    delete editor.settings.link_default_protocol;
  });

  test('TestCase-TBA: AutoLink: link_default_protocol=http', function (editor) {
    editor.settings.link_default_protocol = 'http';
    LegacyUnit.equal(typeUrl(editor, 'www.domain.com'), '<p><a href="http://www.domain.com">www.domain.com</a>&nbsp;</p>');
    LegacyUnit.equal(typeUrl(editor, 'www.domain.com.'), '<p><a href="http://www.domain.com">www.domain.com</a>.&nbsp;</p>');
    delete editor.settings.link_default_protocol;
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const steps = Env.browser.isIE() || Env.browser.isEdge() ? [] : suite.toSteps(editor);
    Pipeline.async({}, Log.steps('TBA', 'AutoLink: Test autolink url inputs', steps), onSuccess, onFailure);
  }, {
    plugins: 'autolink',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
