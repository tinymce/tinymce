define(
  'ephox.alloy.docs.UiDocumentation',

  [
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.docs.SchemaView',
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

        return Container.build({
          dom: {
            tag: 'div',
            classes: [ 'doc-component-parts' ]
          },
          components: Arr.flatten([
            parts.length > 0 ? [
              Container.build({
                dom: { tag: 'h4', innerHtml: 'Parts' }
              }),
              Container.build({
                dom: {
                  tag: 'ul'
                },
                components: Arr.map(parts, function (p) {
                  return Container.build({
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
        var heading = Container.build({
          dom: {
            tag: 'h3',
            innerHtml: s.name()
          }
        });

        var description = Container.build({
          dom: {
            tag: 'p',
            innerHtml: SchemaView.getDescription(s.name())
          }
        });

        var schema = SchemaView.build([ s.name() ],  ValueSchema.objOf(s.schema()).toDsl());

        var wrapper = Container.build({
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