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

  const typeAnEclipsedURL = (editor: Editor, url: string, expectedUrl?: string, withDotAtTheEnd?: boolean): void => {
    const dot = withDotAtTheEnd ? '.' : '';
    const modifiedurl = '(' + url + dot;
    editor.setContent('<p>' + modifiedurl + '</p>');
    LegacyUnit.setSelection(editor, 'p', modifiedurl.length);
    KeyUtils.type(editor, ')');
    Assert.eq('Create a link of an eclipsed url', `<p>(<a href="${expectedUrl || url}">${url + dot}</a>)</p>`, editor.getContent());
  };

  const typeNewlineURL = (editor: Editor, url: string, expectedUrl?: string, withDotAtTheEnd?: boolean): void => {
    const dot = withDotAtTheEnd ? '.' : '';
    editor.setContent('<p>' + url + dot + '</p>');
    LegacyUnit.setSelection(editor, 'p', url.length);
    KeyUtils.type(editor, '\n');
    Assert.eq('Create link with newline', `<p><a href="${expectedUrl || url}">${url}</a></p><p>${withDotAtTheEnd ? '.' : '&nbsp;'}</p>`, editor.getContent());
  };

  const assertNoLink = (editor: Editor, input: string, text?: string): void => {
    Assert.eq('Should not convert to link', `<p>${text || input}&nbsp;</p>`, typeUrl(editor, input));
  };

  const assertIsLink = (editor: Editor, input: string, link: string, withDotAtTheEnd?: boolean, text?: string): void => {
    const dot = withDotAtTheEnd ? '.' : '';
    Assert.eq('Should be convert to link', `<p><a href="${link}">${text || input}</a>${dot}&nbsp;</p>`, typeUrl(editor, (input + dot)));
  };

  const test = (label: string, runTest: (editor: Editor) => void): void => {
    suite.test(label, (editor) => {
      editor.focus();
      runTest(editor);
    });
  };

  test('TestCase-TBA: AutoLink: Correct urls ended with space', (editor) => {
    assertIsLink(editor, 'http://www.domain.com', 'http://www.domain.com');
    assertIsLink(editor, 'https://www.domain.com', 'https://www.domain.com');
    assertIsLink(editor, 'ssh://www.domain.com', 'ssh://www.domain.com');
    assertIsLink(editor, 'ftp://www.domain.com', 'ftp://www.domain.com');
    assertIsLink(editor, 'www.domain.com', 'http://www.domain.com');
    assertIsLink(editor, 'www.domain.com', 'http://www.domain.com', true);
    assertIsLink(editor, 'user@domain.com', 'mailto:user@domain.com');
    assertIsLink(editor, 'mailto:user@domain.com', 'mailto:user@domain.com');
    assertIsLink(editor, 'first-last@domain.com', 'mailto:first-last@domain.com');
  });

  test('TINY-4773: AutoLink: Unexpected urls ended with space', (editor) => {
    assertIsLink(editor, 'first-last@domain', 'mailto:first-last@domain'); // No .com or similar needed.
    assertIsLink(editor, 'first-last@()', 'mailto:first-last@()'); // Anything goes after the @.
    assertIsLink(editor, 'first-last@¶¶KJ', 'mailto:first-last@&para;&para;KJ', false, 'first-last@&para;&para;KJ'); // Anything goes after the @
  });

  test('TINY-4773: AutoLink: text which should not work', (editor) => {
    assertNoLink(editor, 'first-last@@domain@.@com'); // We only accept one @
    assertNoLink(editor, 'first-last@¶¶KJ@', 'first-last@&para;&para;KJ@'); // Anything goes after the @
    assertNoLink(editor, 'first-last@'); // We only accept one @
  });

  test('TINY-4773: AutoLink: multiple @ characters', (editor) => {
    fc.assert(fc.property(fc.hexaString(0, 30), fc.hexaString(0, 30), fc.hexaString(0, 30), (s1, s2, s3) => {
      assertNoLink(editor, `${s1}@@${s2}@.@${s3}`, `${s1}@@${s2}@.@${s3}`);
    }));
  });

  test('TINY-4773: AutoLink: ending in @ character', (editor) => {
    fc.assert(fc.property(fc.hexaString(0, 100), (s1) => {
      assertNoLink(editor, `${s1}@`, `${s1}@`);
    }));
  });

  test('TestCase-TBA: AutoLink: Urls ended with )', (editor) => {
    typeAnEclipsedURL(editor, 'http://www.domain.com');
    typeAnEclipsedURL(editor, 'https://www.domain.com');
    typeAnEclipsedURL(editor, 'ssh://www.domain.com');
    typeAnEclipsedURL(editor, 'ftp://www.domain.com');
    typeAnEclipsedURL(editor, 'www.domain.com', 'http://www.domain.com');
    typeAnEclipsedURL(editor, 'www.domain.com', 'http://www.domain.com');
  });

  test('TestCase-TBA: AutoLink: Urls ended with new line', (editor) => {
    typeNewlineURL(editor, 'http://www.domain.com');
    typeNewlineURL(editor, 'https://www.domain.com');
    typeNewlineURL(editor, 'ssh://www.domain.com');
    typeNewlineURL(editor, 'ftp://www.domain.com');
    typeNewlineURL(editor, 'www.domain.com', 'http://www.domain.com');
    typeNewlineURL(editor, 'www.domain.com', 'http://www.domain.com', true);
  });

  test('TestCase-TBA: AutoLink: Url inside blank formatting wrapper', (editor) => {
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

  suite.test(`TestCase-TBA: AutoLink: default_link_target='_self'`, (editor) => {
    editor.settings.default_link_target = '_self';
    LegacyUnit.equal(
      typeUrl(editor, 'http://www.domain.com'),
      '<p><a href="http://www.domain.com" target="_self">http://www.domain.com</a>&nbsp;</p>'
    );
    delete editor.settings.default_link_target;
  });

  test('TestCase-TBA: AutoLink: link_default_protocol=https', (editor) => {
    editor.settings.link_default_protocol = 'https';
    assertIsLink(editor, 'http://www.domain.com', 'http://www.domain.com');
    assertIsLink(editor, 'https://www.domain.com', 'https://www.domain.com');
    assertIsLink(editor, 'ssh://www.domain.com', 'ssh://www.domain.com');
    assertIsLink(editor, 'ftp://www.domain.com', 'ftp://www.domain.com');
    assertIsLink(editor, 'www.domain.com', 'https://www.domain.com');
    assertIsLink(editor, 'www.domain.com', 'https://www.domain.com', true);
    assertIsLink(editor, 'user@domain.com', 'mailto:user@domain.com');
    assertIsLink(editor, 'mailto:user@domain.com', 'mailto:user@domain.com');
    assertIsLink(editor, 'first-last@domain.com', 'mailto:first-last@domain.com');
    delete editor.settings.link_default_protocol;
  });

  test('TestCase-TBA: AutoLink: link_default_protocol=http', (editor) => {
    editor.settings.link_default_protocol = 'http';
    assertIsLink(editor, 'www.domain.com', 'http://www.domain.com');
    assertIsLink(editor, 'www.domain.com', 'http://www.domain.com', true);
    delete editor.settings.link_default_protocol;
  });

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const steps = Env.browser.isIE() || Env.browser.isEdge() ? [] : suite.toSteps(editor);
    Pipeline.async({}, Log.steps('TBA', 'AutoLink: Test autolink url inputs', steps), onSuccess, onFailure);
  }, {
    plugins: 'autolink',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});