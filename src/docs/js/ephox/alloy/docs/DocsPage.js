define(
  'ephox.alloy.docs.DocsPage',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.Tabbar',
    'ephox.alloy.api.ui.TabSection',
    'ephox.alloy.docs.DocSidetabs',
    'ephox.alloy.docs.SchemaView',
    'ephox.alloy.docs.UiDocumentation',
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

  function (GuiFactory, Gui, Container, Tabbar, TabSection, DocSidetabs, SchemaView, UiDocumentation, ButtonSchema, ContainerSchema, DropdownSchema, ExpandableFormSchema, FormChooserSchema, FormCoupledInputsSchema, FormFieldSchema, HtmlSelectSchema, InlineViewSchema, InputSchema, MenuSchema, ModalDialogSchema, SplitDropdownSchema, SplitToolbarSchema, TabbarSchema, TabButtonSchema, TabSectionSchema, TabviewSchema, TieredMenuSchema, ToolbarGroupSchema, ToolbarSchema, TypeaheadSchema, FieldSchema, ValueSchema, Arr, Fun, Insert, SelectorFind) {
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

      var definitions = UiDocumentation.make(uiSchemas);

      // 

      // Arr.each(definitions, function (s) {
      //   var built = GuiFactory.build(s);
      //   root.add(built);
      // });


      Insert.append(ephoxUi, root.element());




      var tabsection = DocSidetabs.make(definitions);

      var built = GuiFactory.build(tabsection);
      root.add(built);

    };
  }
);