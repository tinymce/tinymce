import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Tools from 'tinymce/core/api/util/Tools';
import Plugin from 'tinymce/plugins/toc/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import HtmlUtils from '../module/test/HtmlUtils';

UnitTest.asynctest('browser.tinymce.plugins.toc.TocPluginTest', (success, failure) => {

  const suite = LegacyUnit.createSuite();

  Plugin();
  Theme();

  const stripAttribs = function ($el, attr) {
    if (Tools.isArray(attr)) {
      Tools.each(attr, function (attr) {
        stripAttribs($el, attr);
      });
      return;
    }

    $el.removeAttr(attr);
    $el.find('[' + attr + ']').removeAttr(attr);
  };

  const trimBr = function (html) {
    return html.replace(/<br data-mce-bogus="1" \/>/g, '');
  };

  suite.test('TestCase-TBA: TableOfContents: mceInsertToc', function (editor) {
    editor.getBody().innerHTML =
      '<h1 id="h1">H1</h1>' +
      '<p>This is some text.</p><br />' +
      '<h2 id="h2">H2</h2>' +
      '<p>This is some text.</p><hr />' +
      '<h1 id="h3">H1</h1>' +
      '<p>This is some text.</p>' +
      '<h3 id="h4">H3</h3>' +
      '<p>This is some text.</p>'
      ;

    LegacyUnit.setSelection(editor, 'h1', 0);
    editor.execCommand('mceInsertToc');

    const $toc = editor.$('.tst-toc');

    LegacyUnit.equal($toc.length, 2, 'ToC inserted');
    LegacyUnit.equal($toc.attr('contentEditable'), 'false', 'cE=false');

    LegacyUnit.equal($toc.find('ul ul ul').length, 0, 'no levels beyond 2 are included');

    stripAttribs($toc, ['data-mce-href', 'data-mce-selected']);

    LegacyUnit.equal(trimBr(HtmlUtils.normalizeHtml($toc[0].outerHTML)),
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

  suite.test('TestCase-TBA: TableOfContents: mceInsertToc - flat structure', function (editor) {
    editor.getBody().innerHTML =
      '<h1 id="h1">H1</h1>' +
      '<p>This is some text.</p><br />' +
      '<h1 id="h2">H1</h1>' +
      '<p>This is some text.</p><hr />' +
      '<h1 id="h3">H1</h1>' +
      '<p>This is some text.</p>' +
      '<h2 id="h4">H2</h2>' +
      '<p>This is some text.</p>'
      ;

    LegacyUnit.setSelection(editor, 'h1', 0);
    editor.execCommand('mceInsertToc');

    const $toc = editor.$('.tst-toc');

    stripAttribs($toc, ['data-mce-href', 'data-mce-selected']);

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

  suite.test('TestCase-TBA: TableOfContents: mceUpdateToc', function (editor) {
    editor.getBody().innerHTML =
      '<h1 id="h1">H1</h1>' +
      '<p>This is some text.</p><br />' +
      '<h2 id="h2">H2</h2>' +
      '<p>This is some text.</p><hr />' +
      '<h1 id="h3">H1</h1>' +
      '<p>This is some text.</p>' +
      '<h3 id="h4">H3</h3>' +
      '<p>This is some text.</p>'
      ;

    LegacyUnit.setSelection(editor, 'h1', 0);
    editor.execCommand('mceInsertToc');

    // add one more heading
    editor.$().append('<h1 id="h5">H1</h1><p>This is some text.</p>');

    LegacyUnit.setSelection(editor, 'li', 0);
    editor.execCommand('mceUpdateToc');

    LegacyUnit.equal(editor.$('.tst-toc > ul a[href="#h5"]').length, 1,
      'ToC has been successfully updated');
  });

  suite.test('TestCase-TBA: TableOfContents: Misc.', function (editor) {
    let contents, $toc;

    editor.getBody().innerHTML =
      '<h2 id="h1">H2</h2>' +
      '<p>This is some text.</p><br />' +
      '<h2 id="h2">H2</h2>' +
      '<p>This is some text.</p>' +
      '<h3 id="h4">H3</h3>' +
      '<p>This is some text.</p>'
      ;

    LegacyUnit.setSelection(editor, 'h2', 0);
    editor.execCommand('mceInsertToc');

    contents = editor.getContent();
    LegacyUnit.equal(/contenteditable/i.test(contents), false, 'cE stripped for getContent()');

    editor.setContent(contents);

    $toc = editor.$('.tst-toc');
    LegacyUnit.deepEqual($toc.attr('contentEditable'), 'false', 'cE added back after setContent()');
    LegacyUnit.deepEqual($toc.find(':first-child').attr('contentEditable'), 'true',
      'cE added back to title after setContent()');

    stripAttribs($toc, ['data-mce-href', 'data-mce-selected']);

    LegacyUnit.equal(trimBr(HtmlUtils.normalizeHtml($toc[0].innerHTML)),
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

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, Log.steps('TBA', 'TableOfContents: Api insert, update and test table of contents', suite.toSteps(editor)), onSuccess, onFailure);
  }, {
    plugins: 'toc',
    toolbar: 'toc',
    add_unload_trigger: false,
    indent: false,
    toc_class: 'tst-toc',
    toc_depth: 2,
    toc_header: 'h3',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
