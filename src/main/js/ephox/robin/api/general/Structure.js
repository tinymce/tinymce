define(
  'ephox.robin.api.general.Structure',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    var blockList = function() {
      return [
        'body',
        'p',
        'div',
        'article',
        'aside',
        'figcaption',
        'figure',
        'footer',
        'header',
        'nav',
        'section',
        'ol',
        'ul',
        'table',
        'tr',
        'td',
        'th',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'blockquote'
      ];
    };

    var isBlock = function (universe, item) {
      var tagName = universe.property().name(item);
      return Arr.contains(blockList(), tagName);
    };

    return {
      isBlock: isBlock
    };
  }
);
