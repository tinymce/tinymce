define(
  'ephox.agar.assertions.ApproxStructures',

  [
    'ephox.agar.alien.Truncate',
    'ephox.agar.api.Assertions',
    'ephox.agar.assertions.ApproxComparisons',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj',
    'ephox.sand.api.JSON',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Classes',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.node.Text',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.properties.Value',
    'global!Error'
  ],

  function (Truncate, Assertions, ApproxComparisons, Arr, Obj, Json, Fun, Option, Attr, Classes, Css, Html, Node, Text, Traverse, Value, Error) {
    var element = function (tag, fields) {
      var doAssert = function (actual) {
        Assertions.assertEq('Incorrect node name for: ' + Truncate.getHtml(actual), tag, Node.name(actual));
        var attrs = fields.attrs !== undefined ? fields.attrs : { };
        var classes = fields.classes !== undefined ? fields.classes : [ ];
        var styles = fields.styles !== undefined ? fields.styles : { };
        var html = fields.html !== undefined ? Option.some(fields.html) : Option.none();
        var value = fields.value !== undefined ? Option.some(fields.value) : Option.none();
        var children = fields.children !== undefined ? Option.some(fields.children) : Option.none();
        assertAttrs(attrs, actual);
        assertClasses(classes, actual);
        assertStyles(styles, actual);
        assertHtml(html, actual);
        assertValue(value, actual);

        assertChildren(children, actual);
      };

      return {
        doAssert: doAssert
      };
    };

    var text = function (s) {
      var doAssert = function (actual) {
        Text.getOption(actual).fold(function () {
          assert.fail(Truncate.getHtml(actual) + ' is not a text node, so cannot check if its text is: ' + s.show());
        }, function (t) {
          if (s.strAssert === undefined) throw new Error(Json.stringify(s) + ' is not a *string assertion*');
          s.strAssert('Checking text content', t);  
        });
      };

      return {
        doAssert: doAssert
      };
    };

    var anything = {
      doAssert: Fun.noop
    };

    var assertAttrs = function (expectedAttrs, actual) {
      Obj.each(expectedAttrs, function (v, k) {
        if (v.strAssert === undefined) throw new Error(Json.stringify(v) + ' is not a *string assertion*.\nSpecified in *expected* attributes of ' + Truncate.getHtml(actual));
        var actualValue = Attr.has(actual, k) ? Attr.get(actual, k) : ApproxComparisons.missing();
        v.strAssert(
          'Checking attribute: "' + k + '" of ' + Truncate.getHtml(actual) + '\n',
          actualValue
        );
      });
    };

    var assertClasses = function (expectedClasses, actual) {
      var actualClasses = Classes.get(actual);
      Arr.each(expectedClasses, function (eCls) {
        if (eCls.arrAssert === undefined) throw new Error(Json.stringify(eCls) + ' is not an *array assertion*.\nSpecified in *expected* classes of ' + Truncate.getHtml(actual));
        eCls.arrAssert('Checking classes in ' + Truncate.getHtml(actual) + '\n', actualClasses);
      });
    };

    var assertStyles = function (expectedStyles, actual) {
      Obj.each(expectedStyles, function (v, k) {
        var actualValue = Css.getRaw(actual, k).getOrThunk(ApproxComparisons.missing);
        if (v.strAssert === undefined) throw new Error(Json.stringify(v) + ' is not a *string assertion*.\nSpecified in *expected* styles of ' + Truncate.getHtml(actual));
        v.strAssert(
          'Checking style: "' + k + '" of ' + Truncate.getHtml(actual) + '\n',
          actualValue
        );
      });
    };

    var assertHtml = function (expectedHtml, actual) {
      expectedHtml.each(function (expected) {
        var actualHtml = Html.get(actual);
        if (expected.strAssert === undefined) throw new Error(Json.stringify(expected) + ' is not a *string assertion*.\nSpecified in *expected* innerHTML of ' + Truncate.getHtml(actual));
        expected.strAssert('Checking HTML of ' + Truncate.getHtml(actual), actualHtml);
      });
    };

    var assertValue = function (expectedValue, actual) {
      expectedValue.each(function (v) {
        if (v.strAssert === undefined) throw new Error(Json.stringify(v) + ' is not a *string assertion*.\nSpecified in *expected* value of ' + Truncate.getHtml(actual));
        v.strAssert(
          'Checking value of ' + Truncate.getHtml(actual),
          Value.get(actual)
        );
      });
    };

    var assertChildren = function (expectedChildren, actual) {
      expectedChildren.each(function (expected) {
        var children = Traverse.children(actual);
        Assertions.assertEq(
          'Checking number of children of: ' + Truncate.getHtml(actual) + '\nComplete Structure: \n' + Html.getOuter(actual),
          expected.length,
          children.length
        );
        Arr.each(children, function (child, i) {
          var exp = expected[i];
          if (exp.doAssert === undefined) throw new Error(Json.stringify(exp) + ' is not a *structure assertion*.\nSpecified in *expected* children of ' + Truncate.getHtml(actual));
          exp.doAssert(child);
        });
      });
    };

    return {
      // Force anything to require invoking
      anything: Fun.constant(anything),
      element: element,
      text: text
    };
  }
);