define(
  'ephox.phoenix.demo.SearchDemo',

  [
    'ephox.wrap.JQuery',
    'ephox.compass.Arr',
    'ephox.phoenix.search.Searcher',
    'ephox.phoenix.wrap.Wrapper',
    'ephox.phoenix.wrap.Wraps',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Event',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'text!html/content.html'
  ],

  function ($, Arr, Searcher, Wrapper, Wraps, Attr, Class, Css, Element, Event, Insert, InsertAll, ContentHtml) {
    return function () {
      var container = Element.fromTag('div');

      var content = Element.fromHtml(ContentHtml);
      var input = Element.fromTag('input');
      var button = Element.fromTag('button');
      Insert.append(button, Element.fromText('Highlight token'));
      Attr.set(button, 'type', 'input');

      var buttonWord = Element.fromTag('button');
      Attr.set(buttonWord, 'type', 'input');
      Insert.append(buttonWord, Element.fromText('Highlight word'));

      var wrapper = function () {
        var c = Element.fromTag('span');
        Class.add(c, 'highlighted');
        Css.set(c, 'background-color', '#cadbee');
        return Wraps.basic(c);
      };

      Event.bind(button, 'click', function (event) {
        var token = Attr.get(input, 'value');
        var matches = Searcher.safeToken([content], token);
        highlight(matches);
      });

      Event.bind(buttonWord, 'click', function (event) {
        var word = Attr.get(input, 'value');
        var matches = Searcher.safeWords([content], [word]);
        highlight(matches);
      });

      var highlight = function (matches) {
        Arr.each(matches, function (x) {
          Wrapper.wrapper(x.elements(), wrapper);
        });
      };
      
      InsertAll.append(container, [input, button, buttonWord, content]);

      var ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));
      Insert.append(ephoxUi, container);
    };
  }
);
