import { before, describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks } from '@ephox/mcagar';
import { assert } from 'chai';
import fc from 'fast-check';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Plugin from 'tinymce/plugins/autolink/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import * as KeyUtils from '../module/test/KeyUtils';

describe('browser.tinymce.plugins.autolink.AutoLinkPluginTest', () => {
  before(function () {
    if (Env.browser.isIE() || Env.browser.isEdge()) {
      this.skip();
    }
  });

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'autolink',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

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
    assert.equal(editor.getContent(), `<p>(<a href="${expectedUrl || url}">${url + dot}</a>)</p>`, 'Create a link of an eclipsed url');
  };

  const typeNewlineURL = (editor: Editor, url: string, expectedUrl?: string, withDotAtTheEnd?: boolean): void => {
    const dot = withDotAtTheEnd ? '.' : '';
    editor.setContent('<p>' + url + dot + '</p>');
    LegacyUnit.setSelection(editor, 'p', url.length);
    KeyUtils.type(editor, '\n');
    TinyAssertions.assertContent(editor, `<p><a href="${expectedUrl || url}">${url}</a></p><p>${withDotAtTheEnd ? '.' : '&nbsp;'}</p>`);
  };

  const assertNoLink = (editor: Editor, input: string, text?: string): void => {
    assert.equal(typeUrl(editor, input), `<p>${text || input}&nbsp;</p>`, 'Should not convert to link');
  };

  const assertIsLink = (editor: Editor, input: string, link: string, withDotAtTheEnd?: boolean, text?: string): void => {
    const dot = withDotAtTheEnd ? '.' : '';
    assert.equal(typeUrl(editor, (input + dot)), `<p><a href="${link}">${text || input}</a>${dot}&nbsp;</p>`, 'Should be convert to link');
  };

  it('TBA: Correct urls ended with space', () => {
    const editor = hook.editor();
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

  it('TINY-4773: AutoLink: Unexpected urls ended with space', () => {
    const editor = hook.editor();
    assertIsLink(editor, 'first-last@domain', 'mailto:first-last@domain'); // No .com or similar needed.
    assertIsLink(editor, 'first-last@()', 'mailto:first-last@()'); // Anything goes after the @.
    assertIsLink(editor, 'first-last@¶¶KJ', 'mailto:first-last@&para;&para;KJ', false, 'first-last@&para;&para;KJ'); // Anything goes after the @
  });

  it('TINY-4773: AutoLink: text which should not work', () => {
    const editor = hook.editor();
    assertNoLink(editor, 'first-last@@domain@.@com'); // We only accept one @
    assertNoLink(editor, 'first-last@¶¶KJ@', 'first-last@&para;&para;KJ@'); // Anything goes after the @
    assertNoLink(editor, 'first-last@'); // We only accept one @
  });

  it('TINY-4773: AutoLink: multiple @ characters', () => {
    const editor = hook.editor();
    fc.assert(fc.property(fc.hexaString(0, 30), fc.hexaString(0, 30), fc.hexaString(0, 30), (s1, s2, s3) => {
      assertNoLink(editor, `${s1}@@${s2}@.@${s3}`, `${s1}@@${s2}@.@${s3}`);
    }));
  });

  it('TINY-4773: AutoLink: ending in @ character', () => {
    const editor = hook.editor();
    fc.assert(fc.property(fc.hexaString(0, 100), (s1) => {
      assertNoLink(editor, `${s1}@`, `${s1}@`);
    }));
  });

  it('TBA: Urls ended with )', () => {
    const editor = hook.editor();
    typeAnEclipsedURL(editor, 'http://www.domain.com');
    typeAnEclipsedURL(editor, 'https://www.domain.com');
    typeAnEclipsedURL(editor, 'ssh://www.domain.com');
    typeAnEclipsedURL(editor, 'ftp://www.domain.com');
    typeAnEclipsedURL(editor, 'www.domain.com', 'http://www.domain.com');
    typeAnEclipsedURL(editor, 'www.domain.com', 'http://www.domain.com');
  });

  it('TBA: Urls ended with new line', () => {
    const editor = hook.editor();
    typeNewlineURL(editor, 'http://www.domain.com');
    typeNewlineURL(editor, 'https://www.domain.com');
    typeNewlineURL(editor, 'ssh://www.domain.com');
    typeNewlineURL(editor, 'ftp://www.domain.com');
    typeNewlineURL(editor, 'www.domain.com', 'http://www.domain.com');
    typeNewlineURL(editor, 'www.domain.com', 'http://www.domain.com', true);
  });

  it('TBA: Url inside blank formatting wrapper', () => {
    const editor = hook.editor();
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

  it(`TBA: default_link_target='_self'`, () => {
    const editor = hook.editor();
    editor.settings.default_link_target = '_self';
    LegacyUnit.equal(
      typeUrl(editor, 'http://www.domain.com'),
      '<p><a href="http://www.domain.com" target="_self">http://www.domain.com</a>&nbsp;</p>'
    );
    delete editor.settings.default_link_target;
  });

  it('TBA: link_default_protocol=https', () => {
    const editor = hook.editor();
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

  it('TBA: link_default_protocol=http', () => {
    const editor = hook.editor();
    editor.settings.link_default_protocol = 'http';
    assertIsLink(editor, 'www.domain.com', 'http://www.domain.com');
    assertIsLink(editor, 'www.domain.com', 'http://www.domain.com', true);
    delete editor.settings.link_default_protocol;
  });
});
