define(
  'ephox.agar.arbitrary.ArbSchemaTypes',

  [
    'ephox.agar.alien.Truncate',
    'ephox.agar.arbitrary.ArbChildrenSchema',
    'ephox.agar.arbitrary.ArbNodes',
    'ephox.agar.arbitrary.WeightedChoice',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Merger',
    'ephox.sand.api.JSON',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.wrap-jsverify.Jsc'
  ],

  function (Truncate, ArbChildrenSchema, ArbNodes, WeightedChoice, Obj, Merger, Json, Attr, Css, InsertAll, Jsc) {
    var toTags = function (detail) {
      return Obj.mapToArray(detail.tags, function (v, k) {
        return Merger.deepMerge(v, { tag: k });
      });
    };

    var flattenTag = function (tag) {
      var r = {};
      r[tag] = { weight: 1.0 };
      return r;
    };

    var conform = function (detail) {
      if (detail.tags !== undefined) return detail;
      else return Merger.deepMerge(detail, {
        tags: flattenTag(detail.tag)
      });
    };

    var addDecorations = function (detail, element) {
      var attrDecorator = detail.attributes !== undefined ? detail.attributes : Jsc.constant({}).generator;
      var styleDecorator = detail.styles !== undefined ? detail.styles : Jsc.constant({}).generator;
      return attrDecorator.flatMap(function (attrs) {
        Attr.setAll(element, attrs);
        return styleDecorator.map(function (styles) {
          Css.setAll(element, styles);
          return element;
        });
      }); 
    };

    var makeTag = function (choice) {
      var element = ArbNodes.elementOf(choice.tag);
      var attributes = choice.attributes !== undefined ? choice.attributes : { };
      var styles = choice.styles !== undefined ? choice.styles : { };
      Attr.setAll(element, attributes);
      Css.setAll(element, styles);
      return element;
    };

    return function (construct) {
      var combine = function (detail, childGenerator) {
        var show = Truncate.getHtml;
        var tags = toTags(conform(detail));
        
        var generator =  WeightedChoice.generator(tags).flatMap(function (choiceOption) {
          var choice = choiceOption.getOrDie('Every entry in tags for: ' + Json.stringify(detail) + ' must have a tag');
          return childGenerator.flatMap(function (children) {
            var parent = makeTag(choice);
            InsertAll.append(parent, children);
            // Use any style and attribute decorators.
            return addDecorations(detail, parent);
          });
        });

        return Jsc.bless({
          generator: generator,
          shrink: Jsc.shrink.noop,
          show: show
        });
      };

      var composite = function (detail) {
        return function (rawDepth) {
          var childGenerator = ArbChildrenSchema.composite(rawDepth, detail, construct);
          return combine(detail, childGenerator);
        };
      };


      var leaf = function (detail) {
        return function (_) {          
          return combine(detail, ArbChildrenSchema.none);
        };
      };

      var structure = function (detail) {
        return function (rawDepth) {
          var childGenerator = ArbChildrenSchema.structure(rawDepth, detail, construct);
          return combine(detail, childGenerator);
        };
      };

      var arbitrary = function (arb) {
        return function (_) {
          return arb.component;
        };
      };
     
      return {
        arbitrary: arbitrary,
        leaf: leaf,
        structure: structure,
        composite: composite
      };
    };
  }
);