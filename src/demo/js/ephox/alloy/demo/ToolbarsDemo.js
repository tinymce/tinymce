define(
  'ephox.alloy.demo.ToolbarsDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document',
    'text!dom-templates/tinymce.toolbar.group.html',
    'text!dom-templates/tinymce.toolbar.group.button.html',
    'text!dom-templates/tinymce.toolbar.html'
  ],

  function (Gui, GuiTemplate, HtmlDisplay, Option, Class, Element, Insert, document, TemplateGroup, TemplateButton, TemplateToolbar) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var groups = [
        {
          label: 'group-1',
          items: [
            { uiType: 'button', dom: { tag: 'button', innerHtml: 'Alpha' }, action: function () { } },
            { uiType: 'button', dom: { tag: 'button', innerHtml: 'Beta' }, action: function () { } },
            { uiType: 'button', dom: { tag: 'button', innerHtml: 'Gamma' }, action: function () { } }

          ]
        },

        {
          label: 'group-2',
          items: [
            { uiType: 'button', dom: { tag: 'button', innerHtml: 'Delta' }, action: function () { } },
            { uiType: 'button', dom: { tag: 'button', innerHtml: 'Epsilon' }, action: function () { } }

          ]
        },
        {
          label: 'group-2',
          items: [
            { uiType: 'button', dom: { tag: 'button', innerHtml: 'Rho' }, action: function () { } },
            { uiType: 'button', dom: { tag: 'button', innerHtml: 'Theta' }, action: function () { } }

          ]
        }
      ];

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
                overflowing: {
                  mode: 'scroll',
                  initWidth: '150px'
                },
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

      // var toolbar = HtmlDisplay.section(
      //   gui,
      //   'This toolbar has overflow behaviour that scrolls',
      //   {
      //     uiType: 'toolbar',
      //     groups: groups,
      //     overflowing: {
      //       mode: 'scroll',
      //       initWidth: '150px'
      //     }
      //   }
      // );

      // var toolbar2 = HtmlDisplay.section(
      //   gui,
      //   'This toolbar has overflow behaviour that uses a more drawer',
      //   {
      //     uiType: 'more.toolbar',
      //     uid: 'demo-more-toolbar',
      //     groups: groups,
      //     initWidth: '100px',
      //     dom: {
      //       styles: {
      //         // width: '300px',
      //         // display: 'flex',
      //         overflow: 'hidden'
      //       }
      //     },
      //     overflowButton: {
      //       uiType: 'button',
      //       dom: {
      //         tag: 'button',
      //         innerHtml: '-More-'
      //       }
      //     }
      //   }
      // );

      window.addEventListener('resize', function () {
        toolbar2.apis().refresh();
      });
    };
  }
);