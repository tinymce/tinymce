test(
  'browser.tinymce.core.dom.TrimHtmlTest',
  [
    'ephox.agar.api.RawAssertions',
    'global!document',
    'tinymce.core.Editor',
    'tinymce.core.EditorManager',
    'tinymce.core.dom.DomSerializer',
    'tinymce.core.dom.TrimHtml',
    'tinymce.core.text.Zwsp'
  ],
  function (RawAssertions, document, Editor, EditorManager, DomSerializer, TrimHtml, Zwsp) {
    var serializer = DomSerializer({}, new Editor('id', {}, EditorManager));

    RawAssertions.assertEq('Should be unchanged', '<p id="a" data-mce-abc="1">a</p>', TrimHtml.trimInternal(serializer, '<p id="a" data-mce-abc="1">a</p>'));
    RawAssertions.assertEq('Should not have internal attr', '<p>a</p>', TrimHtml.trimInternal(serializer, '<p data-mce-selected="1">a</p>'));
    RawAssertions.assertEq('Should not trim zwsp', '<p>a' + Zwsp.ZWSP + 'b</p>', TrimHtml.trimInternal(serializer, '<p>a' + Zwsp.ZWSP + 'b</p>'));

    RawAssertions.assertEq('Should be unchanged', '<p id="a" data-mce-abc="1">a</p>', TrimHtml.trimExternal(serializer, '<p id="a" data-mce-abc="1">a</p>'));
    RawAssertions.assertEq('Should not have internal attr', '<p>a</p>', TrimHtml.trimExternal(serializer, '<p data-mce-selected="1">a</p>'));
    RawAssertions.assertEq('Should not have zwsp', '<p>ab</p>', TrimHtml.trimExternal(serializer, '<p>a' + Zwsp.ZWSP + 'b</p>'));
  }
);