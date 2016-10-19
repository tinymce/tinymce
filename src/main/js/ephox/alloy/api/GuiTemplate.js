define(
  'ephox.alloy.api.GuiTemplate',

  [
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Text',
    'ephox.sugar.api.Traverse',
    'ephox.violin.Strings',
    'global!Error'
  ],

  function (Objects, Arr, Obj, Merger, Json, Fun, Result, Element, Node, Text, Traverse, Strings, Error) {
    var fail = function (message, spec) {
      throw new Error(message +'\n' + Json.stringify(spec, null, 2));
    };

    var getAttrs = function (elem) {
      var attributes = elem.dom().attributes !== undefined ? elem.dom().attributes : [ ];
      return Arr.foldl(attributes, function (b, attr) {
        return Merger.deepMerge(b, Objects.wrap(attr.name, attr.value));
      }, {});
    };

    var readTemplate = function (templateHtml, replacements) {
      var regex = /\${([^{}]*)}/g;
      var rawFields = templateHtml.match(regex);
      var fields = rawFields !== undefined && rawFields !== null ? rawFields : [ ];
      var fs = Arr.map(fields, function (f) {
        return f.substring('${'.length, f.length - '}'.length);
      });

      var missing = Arr.filter(fs, function (field) {
        return !Objects.hasKey(replacements, field);
      });

      if (missing.length > 0) return Result.error('Missing fields in HTML template replacement\nMissing: [' + missing.join(', ') +
       '].\nProvided: [' + Obj.keys(replacements).join(', ') + ']');
      else {
        var html = Strings.supplant(templateHtml, replacements);
        return readHtml(html);
      }
    };

    var readHtml = function (html) {
      var elem = Element.fromHtml(html);
      return Node.isText(elem) ? Result.error('Template text must contain an element!') : Result.value(
        read(elem)
      );
    };


    var read = function (elem) {
      var attrs = getAttrs(elem);
      var children = Traverse.children(elem);

      var components = Arr.map(children, function (child) {
        if (Node.isText(child)) return { text: Text.get(child) };
        else {
          var parsed = read(child);
          return { 
            uiType: 'custom',
            dom: parsed.dom,
            components: parsed.components
          };
        }
      });

      return {
        dom: {
          tag: Node.name(elem),
          attributes: attrs
        },
        components: components
      };
    };

    var use = function (templateHtml, spec, replacements) {
      var extra = readTemplate(templateHtml, replacements);
      return extra.fold(function (err) {
        fail(err, {
          templateHtml: templateHtml,
          replacements: replacements,
          spec: spec
        });
      }, function (additions) {
        return Merger.deepMerge(spec, additions);
      });
    };

    return {
      use: use
    };
  }
);