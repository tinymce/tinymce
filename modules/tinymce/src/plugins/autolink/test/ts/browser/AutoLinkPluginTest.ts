import { describe, it } from '@ephox/bedrock-client';
import { Type } from '@ephox/katamari';
import { LegacyUnit, TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';
import fc from 'fast-check';

import Editor from 'tinymce/core/api/Editor';
import { ExecCommandEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import Plugin from 'tinymce/plugins/autolink/Plugin';

import * as KeyUtils from '../module/test/KeyUtils';

describe('browser.tinymce.plugins.autolink.AutoLinkPluginTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'autolink',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    inline_boundaries: false,
    allow_unsafe_link_target: true
  }, [ Plugin ], true);

  const typeUrl = (editor: Editor, url: string): string => {
    editor.setContent('<p>' + url + '</p>');
    LegacyUnit.setSelection(editor, 'p', url.length);
    KeyUtils.type(editor, ' ');
    return editor.getContent();
  };

  const typeAnEclipsedURL = (editor: Editor, url: string, expectedUrl?: string, startBracket: string = '(', endBracket: string = ')'): void => {
    const modifiedUrl = startBracket + url;
    editor.setContent('<p>' + modifiedUrl + '</p>');
    LegacyUnit.setSelection(editor, 'p', modifiedUrl.length);
    KeyUtils.type(editor, endBracket);
    assert.equal(editor.getContent(), `<p>${startBracket}<a href="${expectedUrl || url}">${url}</a>${endBracket}</p>`, 'Create a link of an eclipsed url');
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

  const assertIsLink = (editor: Editor, input: string, link: string, punctuation?: string, text?: string): void => {
    const dot = Type.isString(punctuation) ? punctuation : '';
    assert.equal(typeUrl(editor, (input + dot)), `<p><a href="${link}">${text || input}</a>${dot}&nbsp;</p>`, 'Should be convert to link');
  };

  it('TBA: Correct urls ended with space', () => {
    const editor = hook.editor();
    assertIsLink(editor, 'http://www.domain.com', 'http://www.domain.com');
    assertIsLink(editor, 'https://www.domain.com', 'https://www.domain.com');
    assertIsLink(editor, 'file://www.domain.com', 'file://www.domain.com');
    assertIsLink(editor, 'customprotocol://www.domain.com', 'customprotocol://www.domain.com');
    assertIsLink(editor, 'ssh://www.domain.com', 'ssh://www.domain.com');
    assertIsLink(editor, 'ftp://www.domain.com', 'ftp://www.domain.com');
    assertIsLink(editor, 'www.domain.com', 'https://www.domain.com');
    assertIsLink(editor, 'www.domain.com', 'https://www.domain.com', '.');
    assertIsLink(editor, 'user@domain.com', 'mailto:user@domain.com');
    assertIsLink(editor, 'mailto:user@domain.com', 'mailto:user@domain.com');
    assertIsLink(editor, 'first-last@domain.com', 'mailto:first-last@domain.com');
    assertIsLink(editor, 'http://user:password@www.domain.com', 'http://user:password@www.domain.com');
  });

  it('TINY-4773: Unexpected urls ended with space', () => {
    const editor = hook.editor();
    assertIsLink(editor, 'first-last@domain', 'mailto:first-last@domain'); // No .com or similar needed.
    assertNoLink(editor, 'first-last@()', 'first-last@()');
    assertNoLink(editor, 'first-last@¶¶KJ', 'first-last@&para;&para;KJ');
  });

  it('TINY-4773: text which should not work', () => {
    const editor = hook.editor();
    assertNoLink(editor, 'first-last@@domain@.@com'); // We only accept one @
    assertNoLink(editor, 'first-last@¶¶KJ@', 'first-last@&para;&para;KJ@'); // Anything goes after the @
    assertNoLink(editor, 'first-last@'); // We only accept one @
  });

  it('TINY-4773: multiple @ characters', () => {
    const editor = hook.editor();
    fc.assert(fc.property(fc.hexaString(0, 30), fc.hexaString(0, 30), fc.hexaString(0, 30), (s1, s2, s3) => {
      assertNoLink(editor, `${s1}@@${s2}@.@${s3}`, `${s1}@@${s2}@.@${s3}`);
    }));
  });

  it('TINY-4773: ending in @ character', () => {
    const editor = hook.editor();
    fc.assert(fc.property(fc.hexaString(0, 100), (s1) => {
      assertNoLink(editor, `${s1}@`, `${s1}@`);
    }));
  });

  it('TBA: Urls ended with bracket', () => {
    const editor = hook.editor();
    typeAnEclipsedURL(editor, 'http://www.domain.com');
    typeAnEclipsedURL(editor, 'https://www.domain.com');
    typeAnEclipsedURL(editor, 'ssh://www.domain.com');
    typeAnEclipsedURL(editor, 'ftp://www.domain.com');
    typeAnEclipsedURL(editor, 'www.domain.com', 'https://www.domain.com');
    typeAnEclipsedURL(editor, 'www.domain.com', 'https://www.domain.com');

    typeAnEclipsedURL(editor, 'https://www.domain.com', 'https://www.domain.com', '[', ']');
    typeAnEclipsedURL(editor, 'https://www.domain.com', 'https://www.domain.com', '{', '}');
  });

  it('TBA: Urls ended with new line', () => {
    const editor = hook.editor();
    typeNewlineURL(editor, 'http://www.domain.com');
    typeNewlineURL(editor, 'https://www.domain.com');
    typeNewlineURL(editor, 'ssh://www.domain.com');
    typeNewlineURL(editor, 'ftp://www.domain.com');
    typeNewlineURL(editor, 'www.domain.com', 'https://www.domain.com');
    typeNewlineURL(editor, 'www.domain.com', 'https://www.domain.com', true);
  });

  it('TBA: Url inside blank formatting wrapper', () => {
    const editor = hook.editor();
    editor.setContent('<p><br></p>');
    editor.selection.setCursorLocation(editor.getBody().firstChild as HTMLParagraphElement, 0);
    editor.execCommand('Bold');
    // inserting url via typeUrl() results in different behaviour, so lets simply type it in, char by char
    KeyUtils.typeString(editor, 'http://www.domain.com ');
    LegacyUnit.equal(
      editor.getContent(),
      '<p><strong><a href="http://www.domain.com">http://www.domain.com</a>&nbsp;</strong></p>'
    );
  });

  it(`TBA: link_default_target='_self'`, () => {
    const editor = hook.editor();
    editor.options.set('link_default_target', '_self');
    LegacyUnit.equal(
      typeUrl(editor, 'http://www.domain.com'),
      '<p><a href="http://www.domain.com" target="_self">http://www.domain.com</a>&nbsp;</p>'
    );
    editor.options.unset('link_default_target');
  });

  it(`TBA: link_default_target='_blank'`, () => {
    const editor = hook.editor();
    editor.options.set('link_default_target', '_blank');
    editor.options.set('allow_unsafe_link_target', false);
    LegacyUnit.equal(
      typeUrl(editor, 'http://www.domain.com'),
      '<p><a href="http://www.domain.com" target="_blank" rel="noopener">http://www.domain.com</a>&nbsp;</p>',
      'With allow_unsafe_link_target=false'
    );

    editor.options.set('allow_unsafe_link_target', true);
    LegacyUnit.equal(
      typeUrl(editor, 'http://www.domain.com'),
      '<p><a href="http://www.domain.com" target="_blank">http://www.domain.com</a>&nbsp;</p>',
      'With allow_unsafe_link_target=true'
    );

    editor.options.unset('link_default_target');
  });

  it('TBA: link_default_protocol=https', () => {
    const editor = hook.editor();
    editor.options.set('link_default_protocol', 'https');
    assertIsLink(editor, 'http://www.domain.com', 'http://www.domain.com');
    assertIsLink(editor, 'https://www.domain.com', 'https://www.domain.com');
    assertIsLink(editor, 'ssh://www.domain.com', 'ssh://www.domain.com');
    assertIsLink(editor, 'ftp://www.domain.com', 'ftp://www.domain.com');
    assertIsLink(editor, 'www.domain.com', 'https://www.domain.com');
    assertIsLink(editor, 'www.domain.com', 'https://www.domain.com', '.');
    assertIsLink(editor, 'user@domain.com', 'mailto:user@domain.com');
    assertIsLink(editor, 'mailto:user@domain.com', 'mailto:user@domain.com');
    assertIsLink(editor, 'first-last@domain.com', 'mailto:first-last@domain.com');
    editor.options.unset('link_default_protocol');
  });

  it('TBA: link_default_protocol=http', () => {
    const editor = hook.editor();
    editor.options.set('link_default_protocol', 'http');
    assertIsLink(editor, 'www.domain.com', 'http://www.domain.com');
    assertIsLink(editor, 'www.domain.com', 'http://www.domain.com', '.');
    editor.options.unset('link_default_protocol');
  });

  it('TINY-7714: should trigger with trailing punctuation', () => {
    const editor = hook.editor();
    assertIsLink(editor, 'https://www.domain.com', 'https://www.domain.com', '.');
    assertIsLink(editor, 'https://www.domain.com', 'https://www.domain.com', ',');
    assertIsLink(editor, 'https://www.domain.com', 'https://www.domain.com', '?');
    assertIsLink(editor, 'https://www.domain.com', 'https://www.domain.com', '!');
    assertIsLink(editor, 'https://www.domain.com', 'https://www.domain.com', ';');
    assertIsLink(editor, 'https://www.domain.com', 'https://www.domain.com', ':');
  });

  it('TINY-8091: should not create nested links', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="https://www.domain.com/"><strong>https://www.domain.com/</strong></a></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 23);
    KeyUtils.type(editor, ' ');
    TinyAssertions.assertContent(editor, '<p><a href="https://www.domain.com/"><strong>https://www.domain.com/&nbsp;</strong></a></p>');
  });

  it('TINY-8091: should trigger when typing in the middle of brackets', () => {
    const editor = hook.editor();
    assert.equal(typeUrl(editor, '(https://www.domain.com'), '<p>(<a href="https://www.domain.com">https://www.domain.com</a>&nbsp;</p>');
    assert.equal(typeUrl(editor, '(https://www.domain.com,'), '<p>(<a href="https://www.domain.com">https://www.domain.com</a>,&nbsp;</p>');
    assert.equal(typeUrl(editor, '[https://www.domain.com,'), '<p>[<a href="https://www.domain.com">https://www.domain.com</a>,&nbsp;</p>');
    assert.equal(typeUrl(editor, '{https://www.domain.com'), '<p>{<a href="https://www.domain.com">https://www.domain.com</a>&nbsp;</p>');
  });

  it('TINY-8896: should fire a createlink ExecCommand event when converting a URL to a link', () => {
    const editor = hook.editor();
    const events: string[] = [];
    const logEvent = (e: EditorEvent<ExecCommandEvent>) => {
      events.push(`${e.type.toLowerCase()}-${e.command.toLowerCase()}`);
    };
    editor.on('BeforeExecCommand ExecCommand', logEvent);
    typeUrl(editor, 'http://www.domain.com');
    assert.deepEqual(events, [ 'beforeexeccommand-createlink', 'execcommand-createlink' ], 'The createlink ExecCommand events should have fired');
    editor.off('BeforeExecCommand ExecCommand', logEvent);
  });
});
