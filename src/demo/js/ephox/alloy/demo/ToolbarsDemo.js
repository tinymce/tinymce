define(
  'ephox.alloy.demo.ToolbarsDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.SplitToolbar',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.api.ui.ToolbarGroup',
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

  function (Gui, GuiTemplate, Button, SplitToolbar, Toolbar, ToolbarGroup, HtmlDisplay, Merger, Option, Class, Element, Insert, document, TemplateButton, TemplateGroup, TemplateTextButton, TemplateToolbar, TemplateToolstrip) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var groups = [
        {
          label: 'group-1',
          items: [
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } }),
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } }),
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } })

          ]
        },
        {
          label: 'group-2',
          items: [
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } }),
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } }),
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } })

          ]
        },
        {
          label: 'group-3',
          items: [
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } }),
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } }),
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } })

          ]
        },
        {
          label: 'group-4',
          items: [
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } }),
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } }),
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } })

          ]
        },
        {
          label: 'group-5',
          items: [
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } }),
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } }),
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } })

          ]
        },
        {
          label: 'group-6',
          items: [
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } }),
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } })

          ]
        },
        {
          label: 'group-7',
          items: [
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } }),
            Button.build({ dom: { tag: 'button', innerHtml: 'a' }, action: function () { } })

          ]
        }
      ];

      var itemMunge = function (s) {
        return Button.build({
          'dom': {
            'tag': 'div',
            'attributes': {
              'id': 'mceu_0',
              'class': 'mce-widget mce-btn mce-first',
              'tabindex': '-1',
              'aria-labelledby': 'mceu_0',
              'role': 'button',
              'aria-label': 'bullet list',
              'aria-pressed': 'true'
            }
          },
          'components': [
            {
              'dom': {
                'tag': 'button',
                'attributes': {
                  'role': 'presentation',
                  'type': 'button',
                  'tabindex': '-1'
                }
              },
              'components': [
                {
                  'uiType': 'custom',
                  'dom': {
                    'tag': 'i',
                    'attributes': {
                      'class': 'mce-ico mce-i-bullist'
                    }
                  },
                  'components': []
                }
              ],
              'uiType': 'custom'
            }
          ],
          action: s.action !== undefined ? s.action : function () {
            console.log('clicked on button', s);
          },

          behaviours: {
            toggling: {
              toggleClass: 'mce-active'
            }
          }
        });
      };

      var groupMunge = function (s) {
        return {
          dom: {
            tag: 'div',
            classes: [ 'mce-container', 'mce-flow-layout-item', 'mce-btn-group' ]
          },

          members: {
            item: {
              munge: itemMunge
            }
          },

          markers: {
            itemClass: 'mce-btn'
          },

          components: [
            {
              uiType: 'custom',
              dom: { tag: 'div' },
              components: [
                ToolbarGroup.parts().items()
              ]
            }
          ],
          items: s.items
        };
      };

      var toolbarSpec = function (extra) {
        return Merger.deepMerge(extra, {
          dom: {
            tag: 'div',
            classes: [ 'mce-toolbar-grp', 'mce-container', 'mce-panel', 'mce-stack-layout-item' ],

            styles: {
              'overflow-x': 'auto',
              'max-width': '200px',
              display: 'flex'
            }
          },
          components: [
            { 
              uiType: 'container',
              components: [

              ]
            }
          ]
        });
      };

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
            Toolbar.build(
              toolbarSpec({
                dom: {
                  tag: 'div'
                },
                parts: { },

                members: {
                  group: {
                    munge: groupMunge
                  }
                }
              })
            )
          ]
        }
      );

      var toolbar1 = subject.components()[0];
      var gps = Toolbar.createGroups(toolbar1, groups);
      Toolbar.setGroups(toolbar1, gps);

      return;

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