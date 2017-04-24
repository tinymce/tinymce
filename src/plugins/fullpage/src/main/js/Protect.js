define(
  'tinymce.plugins.fullpage.Protect',
  [
    'tinymce.core.util.Tools'
  ],
  function (Tools) {
    var protectHtml = function (protect, html) {
      Tools.each(protect, function (pattern) {
        html = html.replace(pattern, function (str) {
          return '<!--mce:protected ' + escape(str) + '-->';
        });
      });

      return html;
    };

    var unprotectHtml = function (html) {
      return html.replace(/<!--mce:protected ([\s\S]*?)-->/g, function (a, m) {
        return unescape(m);
      });
    };

    return {
      protectHtml: protectHtml,
      unprotectHtml: unprotectHtml
    };
  }
);
