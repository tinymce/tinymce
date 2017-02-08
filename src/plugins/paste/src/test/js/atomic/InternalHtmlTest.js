test(
  'atomic.tinymce.plugins.paste.InternalHtmlTest',
  [
    'tinymce.plugins.paste.core.InternalHtml'
  ],
  function (InternalHtml) {
    var testMark = function () {
      assert.eq('<!-- tinymce:internal -->abc', InternalHtml.mark('abc'));
    };

    var testUnmark = function () {
      assert.eq('abc', InternalHtml.unmark('<!-- tinymce:internal -->abc'));
      assert.eq('abc', InternalHtml.unmark('abc<!-- tinymce:internal -->'));
    };

    var testIsMarked = function () {
      assert.eq(true, InternalHtml.isMarked('<!-- tinymce:internal -->abc'));
      assert.eq(true, InternalHtml.isMarked('abc<!-- tinymce:internal -->'));
      assert.eq(false, InternalHtml.isMarked('abc'));
    };

    var testInternalHtmlMime = function () {
      assert.eq('x-tinymce/html', InternalHtml.internalHtmlMime());
    };

    testMark();
    testUnmark();
    testIsMarked();
    testInternalHtmlMime();
  }
);