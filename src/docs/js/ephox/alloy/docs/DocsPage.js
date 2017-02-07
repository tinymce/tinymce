define(
  'ephox.alloy.docs.DocsPage',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.Tabbar',
    'ephox.alloy.api.ui.TabSection',
    'ephox.alloy.docs.SchemaView',
    'ephox.alloy.ui.schema.ButtonSchema',
    'ephox.alloy.ui.schema.ContainerSchema',
    'ephox.alloy.ui.schema.DropdownSchema',
    'ephox.alloy.ui.schema.ExpandableFormSchema',
    'ephox.alloy.ui.schema.FormChooserSchema',
    'ephox.alloy.ui.schema.FormCoupledInputsSchema',
    'ephox.alloy.ui.schema.FormFieldSchema',
    'ephox.alloy.ui.schema.HtmlSelectSchema',
    'ephox.alloy.ui.schema.InlineViewSchema',
    'ephox.alloy.ui.schema.InputSchema',
    'ephox.alloy.ui.schema.MenuSchema',
    'ephox.alloy.ui.schema.ModalDialogSchema',
    'ephox.alloy.ui.schema.SplitDropdownSchema',
    'ephox.alloy.ui.schema.SplitToolbarSchema',
    'ephox.alloy.ui.schema.TabbarSchema',
    'ephox.alloy.ui.schema.TabButtonSchema',
    'ephox.alloy.ui.schema.TabSectionSchema',
    'ephox.alloy.ui.schema.TabviewSchema',
    'ephox.alloy.ui.schema.TieredMenuSchema',
    'ephox.alloy.ui.schema.ToolbarGroupSchema',
    'ephox.alloy.ui.schema.ToolbarSchema',
    'ephox.alloy.ui.schema.TypeaheadSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.SelectorFind'
  ],

  function (GuiFactory, Gui, Container, Tabbar, TabSection, SchemaView, ButtonSchema, ContainerSchema, DropdownSchema, ExpandableFormSchema, FormChooserSchema, FormCoupledInputsSchema, FormFieldSchema, HtmlSelectSchema, InlineViewSchema, InputSchema, MenuSchema, ModalDialogSchema, SplitDropdownSchema, SplitToolbarSchema, TabbarSchema, TabButtonSchema, TabSectionSchema, TabviewSchema, TieredMenuSchema, ToolbarGroupSchema, ToolbarSchema, TypeaheadSchema, FieldSchema, ValueSchema, Arr, Fun, Insert, SelectorFind) {
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
        },
        HtmlSelectSchema,
        InlineViewSchema,
        InputSchema,
        // ItemWidget (just has parts),
        MenuSchema,
        ModalDialogSchema,
        SplitDropdownSchema,
        SplitToolbarSchema,
        TabbarSchema,
        TabButtonSchema,
        TabSectionSchema,
        TabviewSchema,
        TieredMenuSchema,
        ToolbarSchema,
        ToolbarGroupSchema,
        TypeaheadSchema
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

        
        return {
          value: s.name(),
          wrapper: wrapper
        };
      });

      // 

      // Arr.each(definitions, function (s) {
      //   var built = GuiFactory.build(s);
      //   root.add(built);
      // });


      Insert.append(ephoxUi, root.element());




      var tabsection = TabSection.build({
        dom: {
          tag: 'div'
        },
        components: [
          TabSection.parts().tabbar(),
          TabSection.parts().tabview()
        ],

        tabs: Arr.map(definitions, function (defn) {
          return {
            value: defn.value,
            view: function () {
              return [ defn.wrapper ];
            }
          };
        }),
        parts: {
          tabbar: {
            
            dom: {
              tag: 'div',
              styles: {
                display: 'flex',
                'flex-wrap': 'wrap'
              }
            },
            components: [
              Tabbar.parts().tabs()
            ],
            members: {
              tab: {
                munge: function (tSpec) {
                  return {
                    value: tSpec.value,
                    dom: {
                      tag: 'span',
                      styles: {
                        margin: '2px',
                        padding: '2px',
                        border: '1px solid grey',
                        cursor: 'pointer'
                      },
                      innerHtml: tSpec.value
                    }
                  };
                }
              }
            },
            markers: {
              tabClass: 'tab-item',
              selectedClass: 'selected-tab-item'
            }
          },
          tabview: { }
        }
      });


      var built = GuiFactory.build(tabsection);
      root.add(built);

    };
  }
);