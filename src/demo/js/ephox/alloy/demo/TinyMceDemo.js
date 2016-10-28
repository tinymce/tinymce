define(
  'ephox.alloy.demo.TinyMceDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document',
    'text!dom-templates/tinymce.toolbar.group.button.html',
    'text!dom-templates/tinymce.toolbar.group.html',
    'text!dom-templates/tinymce.toolbar.html'
  ],

  function (Gui, GuiTemplate, HtmlDisplay, Option, Class, Element, Insert, document, TemplateButton, TemplateGroup, TemplateToolbar) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var subject = HtmlDisplay.section(
        gui,
        'This demo plays around with skinning for TinyMCE Ui',
        {
          uiType: 'custom',
          dom: {
            tag: 'div', 
            classes: [ 'mce-container' ]
          },
          components: [
            GuiTemplate.use(
              Option.some('toolbar'),
              TemplateToolbar,
              {
                uiType: 'toolbar',
                groups: [
                  {
                    items: [
                      { },
                      { },
                      { }
                    ]
                  },

                  {
                    items: [
                      { },
                      { },
                      { }
                    ]
                  },

                  {
                    items: [
                      { },
                      { },
                      { }
                    ]
                  }

                ],
                members: {
                  'group': {
                    munge: function (s) {
                      console.log('s', s);
                      return GuiTemplate.use(
                        Option.some('toolbar-group'),
                        TemplateGroup,
                        {
                          items: s.items,
                          members: {
                            'item': {
                              munge: function (s) {
                                return GuiTemplate.use(
                                  Option.none(),
                                  TemplateButton,
                                  {
                                    uiType: 'button',
                                    action: function () {
                                      console.log('clicked on button', s);
                                    },
                                    toggling: {
                                      toggleClass: 'mce-active'
                                    }
                                  }, {
                                    fields: { }
                                  }
                                );
                              }
                            }
                          },
                          markers: {
                            itemClass: 'dog'
                          }
                        },
                        {
                          fields: { }
                        }
                      );
                    }
                  }
                }
              },
              {
                fields: { }
              }
            )
          ]
        }
      );
    };
  }
);