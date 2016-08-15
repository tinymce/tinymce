define(
  'ephox.alloy.dom.DomModification',

  [
    'ephox.alloy.dom.DomDefinition',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.numerosity.api.JSON',
    'ephox.perhaps.Result',
    'ephox.scullion.Struct'
  ],

  function (DomDefinition, Objects, Arr, Obj, Merger, Json, Result, Struct) {
    var fields = [
      'classes',
      'attributes',
      'styles',
      'value',
      'innerHtml',
      'defChildren',
      'domChildren'
    ];
    // Maybe we'll need to allow add/remove
    var nu = Struct.immutableBag([ ], fields);


    var derive = function (settings) {
      var r = { };
      var keys = Obj.keys(settings);
      Arr.each(keys, function (key) {
        settings[key].each(function (v) {
          r[key] = v;
        });
      });

      return nu(r);
    };

    var modToStr = function (mod) {
      var raw = modToRaw(mod);
      return Json.stringify(raw, null, 2);
    };

    var modToRaw = function (mod) {
      return {
        classes: mod.classes().getOr('<none>'),
        attributes: mod.attributes().getOr('<none>'),
        styles: mod.styles().getOr('<none>'),
        value: mod.value().getOr('<none>'),
        innerHtml: mod.innerHtml().getOr('<none>'),
        defChildren: mod.defChildren().getOr('<none>'),
        domChildren: mod.domChildren().fold(function () {
          return '<none>';
        }, function (children) {
          return children.length === 0 ? '0 children, but still specified' : String(children.length);
        })
      };
    };

    var clashingOptArrays = function (key, oArr1, oArr2) {
      return oArr1.fold(function () {
        return oArr2.fold(function () {
          return { };
        }, function (arr2) {
          return Objects.wrap(key, arr2);
        });
      }, function (arr1) {
        return oArr2.fold(function () {
          return Objects.wrap(key, arr1);
        }, function (arr2) {
          return Objects.wrap(key, arr2);
        });
      });
    };

    var merge = function (defnA, mod) {
      var raw = Merger.deepMerge(
        {
          tag: defnA.tag(),
          classes: mod.classes().getOr([ ]).concat(defnA.classes().getOr([ ])),
          attributes: Merger.merge(
            defnA.attributes().getOr({}),
            mod.attributes().getOr({})
          ),
          styles: Merger.merge(
            defnA.styles().getOr({}),
            mod.styles().getOr({})
          )
        }, 
        mod.innerHtml().or(defnA.innerHtml()).map(function (innerHtml) {
          return Objects.wrap('innerHtml', innerHtml);
        }).getOr({ }),

        clashingOptArrays('domChildren', mod.domChildren(), defnA.domChildren()),
        clashingOptArrays('defChildren', mod.defChildren(), defnA.defChildren()),

        mod.value().or(defnA.value()).map(function (value) {
          return Objects.wrap('value', value);
        }).getOr({ })
      );
      
      return DomDefinition.nu(raw);
    };

    return {
      nu: nu,
      derive: derive,

      merge: merge,
      // combine: combine,
      modToStr: modToStr,
      modToRaw: modToRaw
    };
  }
);