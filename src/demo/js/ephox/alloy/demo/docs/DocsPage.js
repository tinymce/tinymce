define(
  'ephox.alloy.demo.docs.DocsPage',

  [
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Disabling',
    'ephox.alloy.api.behaviour.Docking',
    'ephox.alloy.api.behaviour.Dragging',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Invalidating',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Receiving',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.behaviour.Streaming',
    'ephox.alloy.api.behaviour.Tabstopping',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.behaviour.Unselecting',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.demo.docs.BehaviourDocumentation',
    'ephox.alloy.demo.docs.DocSidetabs',
    'ephox.alloy.demo.docs.DocToptabs',
    'ephox.alloy.demo.docs.UiDocumentation',
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
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (
    Composing, Coupling, Disabling, Docking, Dragging, Focusing, Highlighting, Invalidating, Keying, Positioning, Receiving, Replacing, Representing, Sandboxing,
    Sliding, Streaming, Tabstopping, Toggling, Unselecting, GuiFactory, Attachment, Gui, BehaviourDocumentation, DocSidetabs, DocToptabs, UiDocumentation, ButtonSchema,
    ContainerSchema, DropdownSchema, ExpandableFormSchema, FormChooserSchema, FormCoupledInputsSchema, FormFieldSchema, HtmlSelectSchema, InlineViewSchema, InputSchema,
    MenuSchema, ModalDialogSchema, SplitDropdownSchema, SplitToolbarSchema, TabbarSchema, TabButtonSchema, TabSectionSchema, TabviewSchema, TieredMenuSchema,
    ToolbarGroupSchema, ToolbarSchema, TypeaheadSchema, Fun, SelectorFind
  ) {
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

      var behaviours = [
        // First while developing
        // Toggling,
        Composing,
        Coupling,
        Disabling,
        Docking,
        Dragging,
        Focusing,
        Highlighting,
        Invalidating,
        Keying,
        Positioning,
        Receiving,
        Replacing,
        Representing,
        Sandboxing,
        Sliding,
        Streaming,
        Tabstopping,
        Toggling,
        Unselecting
      ]

      var uiDefs = UiDocumentation.make(uiSchemas);
      var behaviourDefs = BehaviourDocumentation.make(behaviours)

      var uiSection = GuiFactory.build(DocSidetabs.make(uiDefs));
      var behaviourSection = GuiFactory.build(DocSidetabs.make(behaviourDefs));


      var topTabs = DocToptabs.make([
        {
          value: 'Ui',
          text: 'Ui Components',
          view: function () {
            return [
              GuiFactory.premade(uiSection)
            ]
          }
        },
        {
          value: 'Behaviours',
          text: 'Behaviours',
          view: function () {
            return [
              GuiFactory.premade(behaviourSection)
            ]
          }
        }
      ]);


      Attachment.attachSystem(ephoxUi, root);

      var built = GuiFactory.build(topTabs);
      root.add(built);

    };
  }
);