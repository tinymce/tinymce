import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import DomQuery from 'tinymce/core/api/dom/DomQuery';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import Plugin from 'tinymce/plugins/toc/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

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
  }, [ Plugin, Theme ]);

  const stripAttribs = ($el: DomQuery, attr: string[] | string): void => {
    if (Tools.isArray(attr)) {
      Tools.each(attr, (attr) => {
        stripAttribs($el, attr);
      });
      return;
    }

    $el.removeAttr(attr);
    $el.find('[' + attr + ']').removeAttr(attr);
  };

  const trimBr = (html: string): string =>
    html.replace(/<br data-mce-bogus="1" \/>/g, '');

  beforeEach(() => {
    const editor = hook.editor();
    editor.settings.toc_depth = 2;
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

      const $toc = editor.$<Element>('.tst-toc');

      assert.lengthOf($toc, 2, 'ToC inserted');
      assert.equal($toc.attr('contentEditable'), 'false', 'cE=false');

      assert.lengthOf($toc.find('ul ul ul'), 0, 'no levels beyond 2 are included');

      stripAttribs($toc, [ 'data-mce-href', 'data-mce-selected' ]);

      assert.equal(trimBr(HtmlUtils.normalizeHtml($toc[0].outerHTML)),
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

      const $toc = editor.$<Element>('.tst-toc');

      stripAttribs($toc, [ 'data-mce-href', 'data-mce-selected' ]);

      LegacyUnit.equal(trimBr(HtmlUtils.normalizeHtml($toc[0].innerHTML)),
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
      editor.settings.toc_depth = 3;

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

      const $toc = editor.$<Element>('.tst-toc');

      stripAttribs($toc, [ 'data-mce-href', 'data-mce-selected' ]);

      LegacyUnit.equal(trimBr(HtmlUtils.normalizeHtml($toc[0].innerHTML)),
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
      editor.settings.toc_depth = 4;

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

      const $toc = editor.$<Element>('.tst-toc');

      stripAttribs($toc, [ 'data-mce-href', 'data-mce-selected' ]);

      LegacyUnit.equal(trimBr(HtmlUtils.normalizeHtml($toc[0].innerHTML)),
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
      editor.settings.toc_depth = 4;

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

      const $toc = editor.$<Element>('.tst-toc');

      stripAttribs($toc, [ 'data-mce-href', 'data-mce-selected' ]);

      LegacyUnit.equal(trimBr(HtmlUtils.normalizeHtml($toc[0].innerHTML)),
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
    editor.$().append('<h1 id="h5">H1</h1><p>This is some text.</p>');

    LegacyUnit.setSelection(editor, 'li', 0);
    editor.execCommand('mceUpdateToc');

    assert.lengthOf(editor.$('.tst-toc > ul a[href="#h5"]'), 1, 'ToC has been successfully updated');
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

    const $toc = editor.$<Element>('.tst-toc');
    assert.equal($toc.attr('contentEditable'), 'false', 'cE added back after setContent()');
    assert.equal($toc.find(':first-child').attr('contentEditable'), 'true', 'cE added back to title after setContent()');

    stripAttribs($toc, [ 'data-mce-href', 'data-mce-selected' ]);

    assert.equal(trimBr(HtmlUtils.normalizeHtml($toc[0].innerHTML)),
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
