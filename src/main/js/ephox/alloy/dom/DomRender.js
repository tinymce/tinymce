define(
  'ephox.alloy.dom.DomRender',

  [
    'ephox.alloy.dom.DomDefinition',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Classes',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Value',
    'global!Error'
  ],

  function (DomDefinition, Arr, Fun, Attr, Classes, Css, Element, Html, InsertAll, Value, Error) {
    var getChildren = function (definition) {
      if (definition.domChildren().isSome() && definition.defChildren().isSome()) {
        throw new Error('Cannot specify children and child specs! Must be one or the other.\nDef: ' + DomDefinition.defToStr(definition));
      } else {
        return definition.domChildren().fold(function () {
          var defChildren = definition.defChildren().getOr([ ]);
          return Arr.map(defChildren, renderDef);
        }, function (domChildren) {
          return domChildren;
        });      
      }
    };

    var renderToDom = function (definition) {
      var subject = Element.fromTag(definition.tag());
      Classes.add(subject, definition.classes().getOr([ ]));
      Attr.setAll(subject, definition.attributes().getOr({ }));
      Css.setAll(subject, definition.styles().getOr({ }));
      // Remember: Order of innerHtml vs children is important.
      Html.set(subject, definition.innerHtml().getOr(''));

      // Children are already elements.
      var children = getChildren(definition);
      InsertAll.append(subject, children);

      definition.value().each(function (value) {
        Value.set(subject, value);
      });

      return subject;
    };

    var renderDef = function (spec) {
      var definition = DomDefinition.nu(spec);
      return renderToDom(definition);
    };

    return {
      renderToDom: renderToDom
    };
  }
);