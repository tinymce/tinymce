define(
  'ephox.alloy.demo.ToolbarsDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.api.ui.SplitToolbar',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.highway.Merger',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document',
    'text!dom-templates/tinymce.toolbar.group.button.html',
    'text!dom-templates/tinymce.toolbar.group.html',
    'text!dom-templates/tinymce.toolbar.group.textbutton.html',
    'text!dom-templates/tinymce.toolbar.html',
    'text!dom-templates/tinymce.toolstrip.html'
  ],

  function (Gui, GuiTemplate, SplitToolbar, HtmlDisplay, Merger, Option, Class, Element, Insert, document, TemplateButton, TemplateGroup, TemplateTextButton, TemplateToolbar, TemplateToolstrip) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var groups = [
        {
          label: 'group-1',
          items: [
            { uiType: 'button', action: function () { } },
            { uiType: 'button', action: function () { } },
            { uiType: 'button', action: function () { } }

          ]
        },
        {
          label: 'group-2',
          items: [
            { uiType: 'button', action: function () { } },
            { uiType: 'button', action: function () { } },
            { uiType: 'button', action: function () { } }

          ]
        },
        {
          label: 'group-3',
          items: [
            { uiType: 'button', action: function () { } },
            { uiType: 'button', action: function () { } },
            { uiType: 'button', action: function () { } }

          ]
        },
        {
          label: 'group-4',
          items: [
            { uiType: 'button', action: function () { } },
            { uiType: 'button', action: function () { } },
            { uiType: 'button', action: function () { } }

          ]
        },
        {
          label: 'group-5',
          items: [
            { uiType: 'button', action: function () { } },
            { uiType: 'button', action: function () { } },
            { uiType: 'button', action: function () { } }

          ]
        },
        {
          label: 'group-6',
          items: [
            { uiType: 'button', action: function () { } },
            { uiType: 'button', action: function () { } }

          ]
        },
        {
          label: 'group-7',
          items: [
            { uiType: 'button', action: function () { } },
            { uiType: 'button', action: function () { } }

          ]
        }
      ];

      var itemMunge = function (s) {
        return Merger.deepMerge(
          GuiTemplate.use(
            Option.none(),
            TemplateButton,
            {
              uiType: 'button',
              action: s.action !== undefined ? s.action : function () {
                console.log('clicked on button', s);
              },
              toggling: {
                toggleClass: 'mce-active'
              }
            }, {
              fields: { }
            }
          ),
          s
        );
      };

      var groupMunge = function (s) {
        console.log('s', s);
        return GuiTemplate.use(
          Option.some('toolbar-group'),
          TemplateGroup,
          {
            items: s.items,
            members: {
              'item': {
                munge: itemMunge
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
      };

      var toolbarSpec = function (extra) {
        return Merger.deepMerge(
          extra,
          GuiTemplate.use(
            Option.some('toolbar'),
            TemplateToolbar,
            {
              uiType: 'toolbar',
              members: {
                'group': {
                  munge: groupMunge
                }
              },
              parts: {
                groups: { }
              }
            },
            {
              fields: { }
            }
          )
        );
      };

      // var subject = HtmlDisplay.section(
      //   gui,
      //   'This demo plays around with skinning for TinyMCE Ui',
      //   {
      //     uiType: 'custom',
      //     dom: {
      //       tag: 'div', 
      //       classes: [ 'mce-container' ]
      //     },
      //     components: [
      //       toolbarSpec({
      //         groups: groups,
      //         overflowing: {
      //           mode: 'scroll',
      //           initWidth: '200px'
      //         }
      //       })
      //     ]
      //   }
      // );

      var toolbar2 = HtmlDisplay.section(
        gui,
        'This toolbar has overflow behaviour that uses a more drawer',
        {
          uiType: 'custom',
          dom: {
            tag: 'div', 
            classes: [ 'mce-container' ]
          },
          components: [
            GuiTemplate.use(
              Option.some('more.toolbar'),
              TemplateToolstrip,
              {
                uid: 'demo-toolstrip',
                uiType: 'more.toolbar',
                parts: {
                  primary: toolbarSpec({ }),
                  more: toolbarSpec({ })
                },
                initGroups: groups,

                moreOpenClass: 'demo-sliding-open',
                moreClosedClass: 'demo-sliding-closed',
                moreGrowingClass: 'demo-sliding-height-growing',
                moreShrinkingClass: 'demo-sliding-height-shrinking',

                // overflowing: {
                //   mode: 'scroll',
                //   initWidth: '200px'
                // },
                // groups: groups,
                // members: {
                //   'group': {
                //     munge: groupMunge
                //   }
                // }
                members: {
                  overflow: {
                    munge: function (spec) {
                      return GuiTemplate.use(
                        Option.none(),
                        TemplateTextButton,
                        {

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
        // {
        //   uiType: 'more.toolbar',
        //   uid: 'demo-more-toolbar',
        //   groups: groups,
        //   initWidth: '100px',
          
        //   dom: {
        //     styles: {
        //       // width: '300px',
        //       // display: 'flex',
        //       overflow: 'hidden'
        //     }
        //   },
        //   overflowButton: {
        //     uiType: 'button',
        //     dom: {
        //       tag: 'button',
        //       innerHtml: '-More-'
        //     }
        //   }
        // }
      );

      toolbar2.getSystem().getByUid('demo-toolstrip').each(SplitToolbar.refresh);
      

      window.addEventListener('resize', function () {
        toolbar2.getSystem().getByUid('demo-toolstrip').each(SplitToolbar.refresh);
      });
    };
  }
);