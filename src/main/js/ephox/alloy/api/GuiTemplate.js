define(
  'ephox.alloy.api.GuiTemplate',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.epithet.Resolve',
    'ephox.highway.Merger',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Text',
    'ephox.sugar.api.Traverse',
    'ephox.violin.Strings',
    'global!Error',
    'global!String'
  ],

  function (FieldSchema, Objects, ValueSchema, Arr, Obj, Resolve, Merger, Json, Fun, Result, Attr, Element, Html, Node, Text, Traverse, Strings, Error, String) {
    var contract = ValueSchema.objOf([
      FieldSchema.defaulted('components', { }),
      FieldSchema.defaulted('fields', [ ])
    ]);

    var fail = function (message, spec) {
      throw new Error(message +'\n' + Json.stringify(spec, null, 2));
    };

    var getAttrs = function (elem) {
      console.log('getAttrs', elem.dom());
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
        var resolved = Resolve.resolve(field, replacements.fields);
        return resolved === null || resolved === undefined;
      });

      if (missing.length > 0) return Result.error('Missing fields in HTML template replacement\nMissing: [' + missing.join(', ') +
       '].\nProvided fields for top-level objects: [' + Obj.keys(replacements.fields).join(', ') + ']');
      else {
        // Copied from violin.supplant but used here to resolve paths with dots.
        var html = templateHtml.replace(/\${([^{}]*)}/g,
          function (a, b) {
            var resolved = Resolve.resolve(b, replacements.fields);
            return resolved !== null ? String(resolved) : a;
          }
        );

        return readHtml(html, replacements.components);
      }
    };

    var readHtml = function (html, compDefns) {
      var elem = Element.fromHtml(html);
      return Node.isText(elem) ? Result.error('Template text must contain an element!') : Result.value(
        read(elem, compDefns)
      );
    };

    var readText = function (elem) {
      var text = Text.get(elem);
      return text.trim().length > 0 ? [ { text: text } ] : [ ]
    };

    // The top-level cannot container component definitions
    var readChildren = function (elem, compDefns) {
      if (Node.isText(elem)) return readText(elem);
      else if (Node.isComment(elem)) return [ ];

      var compsId = Attr.get(elem, 'data-alloy-template-components');
      var compId = Attr.get(elem, 'data-alloy-template-component');
      var knownCompsId = Attr.get(elem, 'data-alloy-template-known-components');
      var knownCompId = Attr.get(elem, 'data-alloy-template-known-component');

      if (compsId !== undefined && !Objects.hasKey(compDefns, compsId)) fail('Element: ' + Html.getOuter(elem) + ' does not ' +
        'contain components definition for ' + compsId, { html: Html.getOuter(elem), defns: compDefns });

      if (compId !== undefined && !Objects.hasKey(compDefns, compId)) fail('Element: ' + Html.getOuter(elem) + ' does not ' +
        'contain component definition for ' + compId, { html: Html.getOuter(elem), defns: compDefns });

      if (compsId !== undefined && Objects.hasKey(compDefns, compsId)) {
        // this particular child is a component ... so ignore its children. and treat as leaf.
        return compDefns[compsId];
      } else if (compId !== undefined && Objects.hasKey(compDefns, compId)) {
        return [ compDefns[compId] ];
      } else {
        var attrs = getAttrs(elem);
        var children = Traverse.children(elem);

        var components = Arr.bind(children, function (child) {
          if (Node.isText(child)) return readText(child);
          else {
            var parsed = readChildren(child, compDefns);
            return Arr.map(parsed, function (p) {
              return p.uiType !== 'dependent' ? {
                uiType: 'custom',
                dom: p.dom,
                components: p.components
              } : p;
            });
          }
        });
        /*
        else if (knownCompId !== undefined) {
        return [ { uiType: 'dependent', name: knownCompId } ];
      } else if (knownCompsId !== undefined) {
        return [ { uiType: 'dependents', name: knownCompsId } ];
      } 
      */
        var common = {
          dom: {
            tag: Node.name(elem),
            attributes: attrs
          },
          components: components
        };



        
        if (knownCompId !== undefined) {
          return [ { uiType: 'dependent', name: knownCompId, extra: common } ];
        } else if (knownCompsId !== undefined) {
          return [ { uiType: 'dependents', name: knownCompsId, extra: common } ];
        } else {
          return [
            Merger.deepMerge(common, {
              uiType: 'custom'
            
            })
          ];
        }
      }
    };


    var read = function (elem, compDefns) {
      var attrs = getAttrs(elem);
      var children = Traverse.children(elem);

      var components = Arr.bind(children, function (child) {
        return readChildren(child, compDefns);
      });

      return {
        dom: {
          tag: Node.name(elem),
          attributes: attrs
        },
        components: components
      };
    };

    var use = function (templateHtml, spec, rawReplacements) {
      var replacements = ValueSchema.asRawOrDie('Template spec', contract, rawReplacements);
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