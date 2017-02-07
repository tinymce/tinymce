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
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.SelectorFind'
  ],

  function (GuiFactory, Gui, Container, SchemaView, ButtonSchema, ContainerSchema, DropdownSchema, ExpandableFormSchema, FormChooserSchema, FormCoupledInputsSchema, FieldSchema, ValueSchema, Arr, Insert, SelectorFind) {
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
        FormCoupledInputsSchema
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
        // var parts = b.parts();
        // if (parts.length > 0) {
        //   var h4 = Element.fromTag('h4');
        //   Html.set(h4, 'Parts');

        //   var list = Element.fromTag('ul');
        //   var partContainers = Arr.map(parts, function (p) {
        //     var li = Element.fromTag('li');
        //     Html.set(li, p);
        //     return li;
        //   })
        //   InsertAll.append(list, partContainers);
          

        //   Insert.after(schemaDiv, h4);
        //   Insert.after(h4, list);
        // }
      }

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