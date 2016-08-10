define(
  'ephox.alloy.dom.DomModification',

  [
    'ephox.alloy.dom.DomDefinition',
    'ephox.highway.Merger',
    'ephox.numerosity.api.JSON',
    'ephox.scullion.Struct'
  ],

  function (DomDefinition, Merger, Json, Struct) {
    // Maybe we'll need to allow add/remove
    var nu = Struct.immutableBag([ ], [
      'classes',
      'attributes',
      'styles',
      'value',
      'innerHtml',
      'defChildren',
      'domChildren'
    ]);

    var modToStr = function (mod) {
      var raw = modToRaw(mod);
      return Json.stringify(raw, null, 2);
    };

    var modToRaw = function (mod) {
      return {
        // Missing tag?
        classes: mod.classes().getOr([ ]),
        attributes: mod.attributes().getOr({ }),
        styles: mod.styles().getOr({ }),
        value: mod.value().getOr('<none>'),
        innerHtml: mod.innerHtml().getOr('<none>'),
        defChildren: mod.defChildren().getOr('<none>')
      };
    };

    var merge = function (defnA, mod) {
      var raw = {
        tag: defnA.tag(),
        classes: mod.classes().getOr([ ]).concat(defnA.classes().getOr([ ])),
        attributes: Merger.merge(
          defnA.attributes().getOr({}),
          mod.attributes().getOr({})
        ),
        styles: Merger.merge(
          defnA.styles().getOr({}),
          mod.styles().getOr({})
        ),
        domChildren: mod.domChildren().or(defnA.domChildren()).getOr([ ]),
        defChildren: mod.defChildren().or(defnA.defChildren()).getOr([ ])
      };
      
      var innerHtml = mod.innerHtml().or(defnA.innerHtml());
      
      // FIX: Mutation
      innerHtml.each(function (html) {
        raw.innerHtml = html;
      });

      var value = mod.value().or(defnA.value());
      value.each(function (v) {
        raw.value = v;
      });

      return DomDefinition.nu(raw);
    };

    return {
      nu: nu,
      merge: merge,
      modToStr: modToStr
    };
  }
);