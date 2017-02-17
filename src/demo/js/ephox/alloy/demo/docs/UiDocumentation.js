define(
  'ephox.alloy.demo.docs.UiDocumentation',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.demo.docs.SchemaView',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr'
  ],

  function (GuiFactory, Container, SchemaView, ValueSchema, Arr) {
    var make = function (uis) {
      var extractParts = function (partTypes) {
        return Arr.map(partTypes, function (pt) {
          return pt.fold(
            function (_, pSchema, name, _, _, _) {
              var builtSchema = SchemaView.build([ name ],  ValueSchema.objOf(pSchema).toDsl());
              return Container.sketch({
                dom: {
                  tag: 'div'
                },
                components: [
                  Container.sketch({
                    dom: { tag: 'span', classes: [ 'strict-docs-field' ], innerHtml: '(reqd) ' + name }
                  }),
                  builtSchema
                ]
              })
            },
            function (_, pSchema, name, _, _, _) {
              // DUPE
              var builtSchema = SchemaView.build([ name ],  ValueSchema.objOf(pSchema).toDsl());
              return Container.sketch({
                dom: {
                  tag: 'div'
                },
                components: [
                  Container.sketch({
                    dom: { tag: 'span', classes: [ ], innerHtml: '(external) ' + name }
                  }),
                  builtSchema
                ]
              })
              return GuiFactory.text('(external) ' + name);
            },
            function (_, pSchema, name, _, _, _) {
              var builtSchema = SchemaView.build([ name ],  ValueSchema.objOf(pSchema).toDsl());
              return Container.sketch({
                dom: {
                  tag: 'div'
                },
                components: [
                  Container.sketch({
                    dom: { tag: 'span', classes: [ ], innerHtml: '(optional) ' + name }
                  }),
                  builtSchema
                ]
              })
            },
            function (_, _, name, _, _, _, _) {
              return GuiFactory.text('(group) ' + name);
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
                      tag: 'li'
                    },
                    components: [ p ]
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