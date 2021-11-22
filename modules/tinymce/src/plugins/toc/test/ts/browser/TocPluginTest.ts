import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { LegacyUnit, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import Plugin from 'tinymce/plugins/toc/Plugin';

import * as HtmlUtils from '../module/test/HtmlUtils';

describe('browser.tinymce.plugins.toc.TocPluginTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'toc',
    toolbar: 'toc',
    add_unload_trigger: false,
    indent: false,
    toc_class: 'tst-toc',
    toc_depth: 2,
    toc_header: 'h3',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const stripAttribs = (el: Element, attr: string[] | string): void => {
    if (Tools.isArray(attr)) {
      Tools.each(attr, (attr) => {
        stripAttribs(el, attr);
      });
      return;
    }

    el.removeAttribute(attr);
    Tools.each(el.querySelectorAll('[' + attr + ']'), (child) => {
      child.removeAttribute(attr);
    });
  };

  const trimBr = (html: string): string =>
    html.replace(/<br data-mce-bogus="1" \/>/g, '');

  beforeEach(() => {
    const editor = hook.editor();
    editor.options.set('toc_depth', 2);
  });

  context('mceInsertToc', () => {
    it('sanity test', () => {
      const editor = hook.editor();

      editor.setContent(
        '<h1 id="h1">H1</h1>' +
        '<p>This is some text.</p><br />' +
        '<h2 id="h2">H2</h2>' +
        '<p>This is some text.</p><hr />' +
        '<h1 id="h3">H1</h1>' +
        '<p>This is some text.</p>' +
        '<h3 id="h4">H3</h3>' +
        '<p>This is some text.</p>'
      );

      LegacyUnit.setSelection(editor, 'h1', 0);
      editor.execCommand('mceInsertToc');

      const tocs = editor.dom.select('.tst-toc');

      assert.lengthOf(tocs, 2, 'ToC inserted');
      Arr.each(tocs, (toc) => {
        assert.equal(toc.getAttribute('contentEditable'), 'false', 'cE=false');

        assert.lengthOf(editor.dom.select('ul ul ul', toc), 0, 'no levels beyond 2 are included');

        stripAttribs(toc, [ 'data-mce-href', 'data-mce-selected' ]);
      });

      assert.equal(trimBr(HtmlUtils.normalizeHtml(tocs[0].outerHTML)),
        '<div class="tst-toc" contenteditable="false">' +
        '<h3 contenteditable="true">Table of Contents</h3>' +
        '<ul>' +
        '<li>' +
        '<a href="#h1">H1</a>' +
        '<ul>' +
        '<li><a href="#h2">H2</a></li>' +
        '</ul>' +
        '</li>' +
        '<li>' +
        '<a href="#h3">H1</a>' +
        '</li>' +
        '</ul>' +
        '</div>',
        'no surprises in ToC structure'
      );
    });

    it('flat structure', () => {
      const editor = hook.editor();

      editor.setContent(
        '<h1 id="h1">H1</h1>' +
        '<p>This is some text.</p><br />' +
        '<h1 id="h2">H1</h1>' +
        '<p>This is some text.</p><hr />' +
        '<h1 id="h3">H1</h1>' +
        '<p>This is some text.</p>' +
        '<h2 id="h4">H2</h2>' +
        '<p>This is some text.</p>'
      );

      LegacyUnit.setSelection(editor, 'h1', 0);
      editor.execCommand('mceInsertToc');

      const toc = editor.dom.select('.tst-toc')[0];

      stripAttribs(toc, [ 'data-mce-href', 'data-mce-selected' ]);

      LegacyUnit.equal(trimBr(HtmlUtils.normalizeHtml(toc.innerHTML)),
        '<h3 contenteditable="true">Table of Contents</h3>' +
        '<ul>' +
        '<li>' +
        '<a href="#h1">H1</a>' +
        '</li>' +
        '<li>' +
        '<a href="#h2">H1</a>' +
        '</li>' +
        '<li>' +
        '<a href="#h3">H1</a>' +
        '<ul>' +
        '<li><a href="#h4">H2</a></li>' +
        '</ul>' +
        '</li>' +
        '</ul>',
        'no surprises in ToC structure'
      );
    });

    it('TINY-4636: three tiers with final item', () => {
      const editor = hook.editor();
      editor.options.set('toc_depth', 3);

      editor.setContent(
        '<h1 id="h1">H1</h1>' +
        '<p>This is some text.</p>' +
        '<h2 id="h2">H2</h2>' +
        '<p>This is some text.</p>' +
        '<h3 id="h3">H3</h3>' +
        '<p>This is some text.</p>' +
        '<h1 id="h4">H1 - 2</h1>' +
        '<p>This is some text.</p>'
      );

      LegacyUnit.setSelection(editor, 'h1', 0);
      editor.execCommand('mceInsertToc');

      const toc = editor.dom.select('.tst-toc')[0];

      stripAttribs(toc, [ 'data-mce-href', 'data-mce-selected' ]);

      LegacyUnit.equal(trimBr(HtmlUtils.normalizeHtml(toc.innerHTML)),
        '<h3 contenteditable="true">Table of Contents</h3>' +
        '<ul>' +
          '<li>' +
            '<a href="#h1">H1</a>' +
            '<ul>' +
              '<li>' +
                '<a href="#h2">H2</a>' +
                '<ul>' +
                  '<li>' +
                    '<a href="#h3">H3</a>' +
                  '</li>' +
                '</ul>' +
              '</li>' +
            '</ul>' +
          '</li>' +
          '<li>' +
            '<a href="#h4">H1 - 2</a>' +
          '</li>' +
        '</ul>',
        'no surprises in ToC structure'
      );
    });

    it('TINY-4636: four tiers with final item', () => {
      const editor = hook.editor();
      editor.options.set('toc_depth', 4);

      editor.setContent(
        '<h1 id="h1">H1</h1>' +
        '<p>This is some text.</p>' +
        '<h2 id="h2">H2</h2>' +
        '<p>This is some text.</p>' +
        '<h3 id="h3">H3</h3>' +
        '<p>This is some text.</p>' +
        '<h4 id="h4">H4</h4>' +
        '<p>This is some text.</p>' +
        '<h1 id="h5">H1 - 2</h1>' +
        '<p>This is some text.</p>'
      );

      LegacyUnit.setSelection(editor, 'h1', 0);
      editor.execCommand('mceInsertToc');

      const toc = editor.dom.select('.tst-toc')[0];

      stripAttribs(toc, [ 'data-mce-href', 'data-mce-selected' ]);

      LegacyUnit.equal(trimBr(HtmlUtils.normalizeHtml(toc.innerHTML)),
        '<h3 contenteditable="true">Table of Contents</h3>' +
        '<ul>' +
          '<li>' +
            '<a href="#h1">H1</a>' +
            '<ul>' +
              '<li>' +
                '<a href="#h2">H2</a>' +
                '<ul>' +
                  '<li>' +
                    '<a href="#h3">H3</a>' +
                    '<ul>' +
                      '<li>' +
                        '<a href="#h4">H4</a>' +
                      '</li>' +
                    '</ul>' +
                  '</li>' +
                '</ul>' +
              '</li>' +
            '</ul>' +
          '</li>' +
          '<li>' +
            '<a href="#h5">H1 - 2</a>' +
          '</li>' +
        '</ul>',
        'no surprises in ToC structure'
      );
    });

    it('TINY-4636: four tiers with no final item', () => {
      const editor = hook.editor();
      editor.options.set('toc_depth', 4);

      editor.setContent(
        '<h1 id="h1">H1</h1>' +
        '<p>This is some text.</p>' +
        '<h2 id="h2">H2</h2>' +
        '<p>This is some text.</p>' +
        '<h3 id="h3">H3</h3>' +
        '<p>This is some text.</p>' +
        '<h4 id="h4">H4</h4>' +
        '<p>This is some text.</p>'
      );

      LegacyUnit.setSelection(editor, 'h1', 0);
      editor.execCommand('mceInsertToc');

      const toc = editor.dom.select('.tst-toc')[0];

      stripAttribs(toc, [ 'data-mce-href', 'data-mce-selected' ]);

      LegacyUnit.equal(trimBr(HtmlUtils.normalizeHtml(toc.innerHTML)),
        '<h3 contenteditable="true">Table of Contents</h3>' +
        '<ul>' +
          '<li>' +
            '<a href="#h1">H1</a>' +
            '<ul>' +
              '<li>' +
                '<a href="#h2">H2</a>' +
                '<ul>' +
                  '<li>' +
                    '<a href="#h3">H3</a>' +
                    '<ul>' +
                      '<li>' +
                        '<a href="#h4">H4</a>' +
                      '</li>' +
                    '</ul>' +
                  '</li>' +
                '</ul>' +
              '</li>' +
            '</ul>' +
          '</li>' +
        '</ul>',
        'no surprises in ToC structure'
      );
    });
  });

  it('mceUpdateToc', () => {
    const editor = hook.editor();

    editor.setContent(
      '<h1 id="h1">H1</h1>' +
      '<p>This is some text.</p><br />' +
      '<h2 id="h2">H2</h2>' +
      '<p>This is some text.</p><hr />' +
      '<h1 id="h3">H1</h1>' +
      '<p>This is some text.</p>' +
      '<h3 id="h4">H3</h3>' +
      '<p>This is some text.</p>'
    );

    LegacyUnit.setSelection(editor, 'h1', 0);
    editor.execCommand('mceInsertToc');

    // add one more heading
    editor.dom.add(editor.getBody(), 'h1', { id: 'h5' }, 'H1');
    editor.dom.add(editor.getBody(), 'p', {}, 'This is some text.');

    LegacyUnit.setSelection(editor, 'li', 0);
    editor.execCommand('mceUpdateToc');

    assert.lengthOf(editor.dom.select('.tst-toc > ul a[href="#h5"]'), 1, 'ToC has been successfully updated');
  });

  it('Misc', () => {
    const editor = hook.editor();

    editor.setContent(
      '<h2 id="h1">H2</h2>' +
      '<p>This is some text.</p><br />' +
      '<h2 id="h2">H2</h2>' +
      '<p>This is some text.</p>' +
      '<h3 id="h4">H3</h3>' +
      '<p>This is some text.</p>'
    );

    LegacyUnit.setSelection(editor, 'h2', 0);
    editor.execCommand('mceInsertToc');

    const contents = editor.getContent();
    assert.notMatch(contents, /contenteditable/i, 'cE stripped for getContent()');

    editor.setContent(contents);

    const toc = editor.dom.select('.tst-toc')[0];
    assert.equal(toc.getAttribute('contentEditable'), 'false', 'cE added back after setContent()');
    const tocChild = toc.firstElementChild;
    assert.equal(tocChild.getAttribute('contentEditable'), 'true', 'cE added back to title after setContent()');

    stripAttribs(toc, [ 'data-mce-href', 'data-mce-selected' ]);

    assert.equal(trimBr(HtmlUtils.normalizeHtml(toc.innerHTML)),
      '<h3 contenteditable="true">Table of Contents</h3>' +
      '<ul>' +
      '<li>' +
      '<a href="#h1">H2</a>' +
      '</li>' +
      '<li>' +
      '<a href="#h2">H2</a>' +
      '</li>' +
      '</ul>',
      'the largest available header becomes first ToC level'
    );
  });
});
