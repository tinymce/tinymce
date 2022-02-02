import { Waiter } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/fullpage/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.fullpage.FullPagePluginTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'fullpage',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    theme: 'silver',
    protect: [
      /<!--([\s\S]*?)-->/g
    ]
  }, [ Plugin, Theme ]);

  afterEach(() => {
    const editor = hook.editor();
    editor.getBody().removeAttribute('dir');
  });

  it('TBA: Keep header/footer intact', () => {
    const editor = hook.editor();
    const normalizeHTML = (html: string) => {
      return html.replace(/\s/g, '');
    };

    editor.setContent('<html><body><p>Test</p>');
    assert.equal(normalizeHTML(editor.getContent()), '<html><body><p>Test</p>', 'Invalid HTML content is still editable.');

    editor.setContent('<html><body><p>Test</p></body></html>');
    assert.equal(normalizeHTML(editor.getContent()), '<html><body><p>Test</p></body></html>', 'Header/footer is intact.');
  });

  it('TBA: Default header/footer', () => {
    const editor = hook.editor();
    editor.setContent('<p>Test</p>');
    assert.equal(
      editor.getContent(),
      '<!DOCTYPE html>\n<html>\n<head>\n</head>\n<body>\n<p>Test</p>\n</body>\n</html>',
      'Invalid HTML content is still editable.'
    );
  });

  it('TBA: Parse body attributes', () => {
    const editor = hook.editor();
    editor.setContent('<html><body><p>Test</p></body></html>');
    assert.equal(editor.getBody().style.color, '', 'No color on body.');
    assert.equal(editor.getBody().dir, '', 'No dir on body.');
    assert.equal(editor.dom.getStyle(editor.getBody().firstChild, 'display', true), 'block', 'No styles added to iframe document');

    editor.setContent('<html><body style="color:#FF0000"><p>Test</p></body></html>');
    assert.isAbove(editor.getBody().style.color.length, 0, 'Color added to body');

    editor.setContent('<html><body dir="rtl"><p>Test</p></body></html>');
    assert.equal(editor.getBody().dir, 'rtl', 'Dir added to body');

    editor.setContent('<html><body><p>Test</p></body></html>');
    assert.equal(editor.getBody().style.color, '', 'No color on body.');
    assert.equal(editor.getBody().dir, '', 'No dir on body.');
    assert.equal(editor.dom.getStyle(editor.getBody().firstChild, 'display', true), 'block', 'No styles added to iframe document');
  });

  it('TBA: fullpage_hide_in_source_view: false', () => {
    const editor = hook.editor();
    editor.settings.fullpage_hide_in_source_view = false;
    editor.setContent('<html><body><p>1</p></body></html>');
    TinyAssertions.assertContent(editor, '<html><body>\n<p>1</p>\n</body></html>', { source_view: true });
  });

  it('TBA: fullpage_hide_in_source_view: true', () => {
    const editor = hook.editor();
    editor.settings.fullpage_hide_in_source_view = true;
    editor.setContent('<html><body><p>1</p></body></html>');
    TinyAssertions.assertContent(editor, '<p>1</p>', { source_view: true });
  });

  it('TBA: link elements', () => {
    const editor = hook.editor();
    editor.setContent('<html><head><link rel="stylesheet" href="a.css"><link rel="something"></head><body><p>c</p></body></html>');
    TinyAssertions.assertContent(
      editor,
      '<html><head><link rel="stylesheet" href="a.css"><link rel="something"></head><body>\n<p>c</p>\n</body></html>'
    );
  });

  it('TBA: add/remove stylesheets', () => {
    const editor = hook.editor();
    const hasLink = (href: string) => {
      const links = editor.getDoc().getElementsByTagName('link');

      for (let i = 0; i < links.length; i++) {
        if (links[i].href.indexOf('/' + href) !== -1) {
          return true;
        }
      }

      return false;
    };

    editor.setContent('<html><head><link rel="stylesheet" href="a.css"></head><body><p>c</p></body></html>');
    assert.isTrue(hasLink('a.css'));
    assert.isFalse(hasLink('b.css'));
    assert.isFalse(hasLink('c.css'));

    editor.setContent(
      '<html><head><link rel="stylesheet" href="a.css"><link rel="stylesheet" href="b.css"></head><body><p>c</p></body></html>'
    );
    assert.isTrue(hasLink('a.css'));
    assert.isTrue(hasLink('b.css'));
    assert.isFalse(hasLink('c.css'));

    editor.setContent(
      '<html><head>' +
      '<link rel="stylesheet" href="a.css">' +
      '<link rel="stylesheet" href="b.css">' +
      '<link rel="stylesheet" href="c.css">' +
      '</head>' +
      '<body><p>c</p></body></html>'
    );
    assert.isTrue(hasLink('a.css'));
    assert.isTrue(hasLink('b.css'));
    assert.isTrue(hasLink('c.css'));

    editor.setContent('<html><head><link rel="stylesheet" href="a.css"></head><body><p>c</p></body></html>');
    assert.isTrue(hasLink('a.css'));
    assert.isFalse(hasLink('b.css'));
    assert.isFalse(hasLink('c.css'));

    editor.setContent('<html><head></head><body><p>c</p></body></html>');
    assert.isFalse(hasLink('a.css'));
    assert.isFalse(hasLink('b.css'));
    assert.isFalse(hasLink('c.css'));
  });

  it('Parse styles', async () => {
    const editor = hook.editor();
    editor.setContent('<html><head><style>p {text-transform: uppercase}</style></head><body dir="rtl"><p>Test</p></body></html>');
    await Waiter.pTryUntil(
      'Expected styles were added',
      () => {
        assert.equal(editor.dom.getStyle(editor.getBody().firstChild, 'text-transform', true), 'uppercase', 'Styles added to iframe document');
        assert.equal(editor.dom.getStyle(editor.getBody().firstChild, 'text-transform', false), '', 'Styles not added to actual element');
      }
    );
  });

  it('protect conditional comments in head and foot', () => {
    const editor = hook.editor();
    editor.setContent([
      '<!DOCTYPE html>',
      '<html>',
      '<!--[if mso]>',
      '<body class="mso-container" style="background-color:#FFFFFF;">',
      '<![endif]-->',
      '<!--[if !mso]><!-->',
      '<body class="clean-body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #FFFFFF">',
      '<!--<![endif]--><p>text</p>',
      '</body>',
      '</html>'
    ].join('\n'));

    const expectedContent = [
      '<!DOCTYPE html>',
      '<html>',
      '<!--[if mso]>',
      '<body class="mso-container" style="background-color:#FFFFFF;">',
      '<![endif]-->',
      '<!--[if !mso]><!-->',
      '<body class="clean-body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #FFFFFF">',
      '<!--<![endif]--><p>text</p>',
      '</body>',
      '</html>'
    ].join('\n');

    TinyAssertions.assertContent(editor, expectedContent);
  });

  it('TINY-6541: Text content should not be modified', () => {
    const editor = hook.editor();
    editor.setContent('some plain text');
    TinyAssertions.assertContent(editor, 'some plain text', { format: 'text' });
  });
});
