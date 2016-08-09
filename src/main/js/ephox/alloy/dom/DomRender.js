define(
  'ephox.alloy.dom.DomRender',

  [
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Classes',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Value'
  ],

  function (Attr, Classes, Css, Element, Html, InsertAll, Value) {
    var renderToDom = function (definition) {
      var subject = Element.fromTag(definition.tag());
      Classes.add(subject, definition.classes().getOr([ ]));
      Attr.setAll(subject, definition.attributes().getOr({ }));
      Css.setAll(subject, definition.styles().getOr({ }));
      // Remember: Order of innerHTMl vs children is important.
      Html.set(subject, definition.innerHtml().getOr(''));

      // Children are already elements.
      var children = definition.children().getOr([ ]);
      InsertAll.append(subject, children);

      definition.value().each(function (value) {
        Value.set(subject, value);
      });

      return subject;
    };

    return {
      renderToDom: renderToDom
    };
  }
);