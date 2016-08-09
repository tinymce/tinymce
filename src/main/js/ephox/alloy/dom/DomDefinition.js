define(
  'ephox.alloy.dom.DomDefinition',

  [
    'ephox.numerosity.api.JSON',
    'ephox.scullion.Struct',
    'global!String'
  ],

  function (Json, Struct, String) {
    var nu = Struct.immutableBag([ 'tag' ], [
      'classes',
      'attributes',
      'styles',
      'value',
      'innerHtml',
      'domChildren',
      'defChildren'
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
        innerHtml: defn.innerHtml().getOr('<none>'),
        defChildren: defn.defChildren().getOr('<none>'),
        domChildren: defn.domChildren().fold(function () {
          return '<none>';
        }, function (children) {
          return children.length === 0 ? '0 children, but still specified' : String(children.length);
        })
      };
    };
  
    return {
      nu: nu,  
      defToStr: defToStr,
      defToRaw: defToRaw
    };
  }
);