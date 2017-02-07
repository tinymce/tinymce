define(
  'ephox.alloy.demo.docs.UiDocumentation',

  [
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.demo.docs.SchemaView',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr'
  ],

  function (Container, SchemaView, ValueSchema, Arr) {
    var make = function (uis) {
      var extractParts = function (partTypes) {
        return Arr.map(partTypes, function (pt) {
          return pt.fold(
            function (_, name, _, _, _) {
              return name;
            },
            function (_, name, _, _, _) {
              return name;
            },
            function (_, name, _, _, _) {
              return name;
            },
            function (_, name, _, _, _, _) {
              return name;
            }
          );
        });
      };

      var makeParts = function (partTypes) {
        var parts = extractParts(partTypes);

        return Container.sketch({
          dom: {
            tag: 'div',
            classes: [ 'doc-component-parts' ]
          },
          components: Arr.flatten([
            parts.length > 0 ? [
              Container.sketch({
                dom: { tag: 'h4', innerHtml: 'Parts' }
              }),
              Container.sketch({
                dom: {
                  tag: 'ul'
                },
                components: Arr.map(parts, function (p) {
                  return Container.sketch({
                    dom: {
                      tag: 'li',
                      innerHtml: p
                    }
                  });
                })
              })] : [ ]
          ])
        });
      };

      var definitions = Arr.map(uis, function (s) {
        var heading = Container.sketch({
          dom: {
            tag: 'h3',
            innerHtml: s.name()
          }
        });

        var description = Container.sketch({
          dom: {
            tag: 'p',
            innerHtml: SchemaView.getDescription(s.name())
          }
        });

        var schema = SchemaView.build([ s.name() ],  ValueSchema.objOf(s.schema()).toDsl());

        var wrapper = Container.sketch({
          dom: {
            tag: 'div'
          },
          components: [
            heading,
            description,
            schema,
            makeParts(s.parts())
          ]
        });

        
        return {
          value: s.name(),
          wrapper: wrapper
        };
      });

      return definitions;
    };

    return {
      make: make
    }; 
  }
);