define(
  'tinymce.themes.mobile.bridge.LinkBridge',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.TextContent',
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (Fun, Option, Element, Attr, TextContent, SelectorFind) {
    var isNotEmpty = function (val) {
      return val.length > 0;
    };

    var defaultToEmpty = function (str) {
      return str === undefined || str === null ? '' : str;
    };

    var noLink = function (editor) {
      var text = editor.selection.getContent({ format: 'text' });
      return {
        url: '',
        text: text,
        title: '',
        target: '',
        link: Option.none()
      };
    };

    var fromLink = function (link) {
      var text = TextContent.get(link);
      var url = Attr.get(link, 'href');
      var title = Attr.get(link, 'title');
      var target = Attr.get(link, 'target');
      return {
        url: defaultToEmpty(url),
        text: text !== url ? defaultToEmpty(text) : '',
        title: defaultToEmpty(title),
        target: defaultToEmpty(target),
        link: Option.some(link)
      };
    };

    var getInfo = function (editor) {
      // TODO: Improve with more of tiny's link logic?
      return query(editor).fold(
        function () {
          return noLink(editor);
        },
        function (link) {
          return fromLink(link);
        }
      );
    };

    var wasSimple = function (link) {
      var prevHref = Attr.get(link, 'href');
      var prevText = TextContent.get(link);
      return prevHref === prevText;
    };

    var getTextToApply = function (link, url, info) {
      return info.text.filter(isNotEmpty).fold(function () {
        return wasSimple(link) ? Option.some(url) : Option.none();
      }, Option.some);
    };

    var unlinkIfRequired = function (editor, info) {
      var activeLink = info.link.bind(Fun.identity);
      activeLink.each(function (link) {
        editor.execCommand('unlink');
      });
    };

    var getAttrs = function (url, info) {
      var attrs = { };
      attrs.href = url;

      info.title.filter(isNotEmpty).each(function (title) {
        attrs.title = title;
      });
      info.target.filter(isNotEmpty).each(function (target) {
        attrs.target = target;
      });
      return attrs;
    };

    var applyInfo = function (editor, info) {
      info.url.filter(isNotEmpty).fold(function () {
        // Unlink if there is something to unlink
        unlinkIfRequired(editor, info);
      }, function (url) {
        // We must have a non-empty URL to insert a link
        var attrs = getAttrs(url, info);

        var activeLink = info.link.bind(Fun.identity);
        activeLink.fold(function () {
          var text = info.text.filter(isNotEmpty).getOr(url);
          editor.insertContent(editor.dom.createHTML('a', attrs, editor.dom.encode(text)));
        }, function (link) {
          var text = getTextToApply(link, url, info);
          Attr.setAll(link, attrs);
          text.each(function (newText) {
            TextContent.set(link, newText);
          });
        });
      });
    };

    var query = function (editor) {
      var start = Element.fromDom(editor.selection.getStart());
      return SelectorFind.closest(start, 'a');
    };

    return {
      getInfo: getInfo,
      applyInfo: applyInfo,
      query: query
    };
  }
);
