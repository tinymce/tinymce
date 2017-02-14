define(
  'tinymce.plugins.visualchars.core.Html',
  [
    'tinymce.plugins.visualchars.core.Data'
  ],
    function (Data) {
      var wrapCharWithSpan = function (value) {
        return '<span data-mce-bogus="1" class="mce-' + Data.charMap[value] + '">' + value + '</span>';
      };

      return {
        wrapCharWithSpan: wrapCharWithSpan
      };
    }
);
