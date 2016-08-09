define(
  'ephox.alloy.dom.DomDefinition',

  [
    'ephox.numerosity.api.JSON',
    'ephox.scullion.Struct'
  ],

  function (Json, Struct) {
    var nu = Struct.immutableBag([ 'tag' ], [
      'classes',
      'attributes',
      'styles',
      'value',
      'innerHtml',
      'children'
    ]);

    var defToStr = function (defn) {
      var raw = defToRaw(defn);
      return Json.stringify(raw, null, 2);
    };

    var defToRaw = function (defn) {
      return {
        tag: defn.tag(),
        classes: defn.classes().getOr([ ]),
        attributes: defn.attributes().getOr({ }),
        styles: defn.styles().getOr({ }),
        value: defn.value().getOr('<none>'),
        innerHtml: defn.innerHtml().getOr('<none>')
      };
    };

  
    return {
      nu: nu,  
      defToStr: defToStr,
      defToRaw: defToRaw
    };
  }
);