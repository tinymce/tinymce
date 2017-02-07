define(
  'ephox.alloy.docs.DocsPage',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.docs.SchemaView',
    'ephox.alloy.ui.schema.ButtonSchema',
    'ephox.alloy.ui.schema.ContainerSchema',
    'ephox.alloy.ui.schema.DropdownSchema',
    'ephox.alloy.ui.schema.ExpandableFormSchema',
    'ephox.alloy.ui.schema.FormChooserSchema',
    'ephox.alloy.ui.schema.FormCoupledInputsSchema',
    'ephox.alloy.ui.schema.FormFieldSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.SelectorFind'
  ],

  function (GuiFactory, Gui, Container, SchemaView, ButtonSchema, ContainerSchema, DropdownSchema, ExpandableFormSchema, FormChooserSchema, FormCoupledInputsSchema, FormFieldSchema, FieldSchema, ValueSchema, Arr, Fun, Insert, SelectorFind) {
    return function () {
      var root = Gui.create();

      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

      var uiSchemas = [
        ButtonSchema,
        ContainerSchema,
        DropdownSchema,
        ExpandableFormSchema,
        // Form,
        FormChooserSchema,
        FormCoupledInputsSchema,
        {
          name: FormFieldSchema.name,
          schema: FormFieldSchema.schema,
          parts: Fun.curry(FormFieldSchema.makeParts, { })
        }
      ];

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

      var definitions = Arr.map(uiSchemas, function (s) {
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

        
        return GuiFactory.build(wrapper);
      });

      Arr.each(definitions, root.add);

      Insert.append(ephoxUi, root.element());
    };
  }
);