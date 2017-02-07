define(
  'ephox.alloy.demo.ToolbarsDemo',

  [
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.SplitToolbar',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.highway.Merger',
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

  function (Gui, Button, Container, SplitToolbar, Toolbar, ToolbarGroup, HtmlDisplay, Merger, Class, Element, Insert, document, TemplateButton, TemplateGroup, TemplateTextButton, TemplateToolbar, TemplateToolstrip) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var groups = function () {
        return [
          {
            label: 'group-1',
            items: [
              { text: '1a', action: function () { } },
              { text: '1b', action: function () { } },
              { text: '1c', action: function () { } }

            ]
          },
          {
            label: 'group-2',
            items: [
              { text: '2a', action: function () { } },
              { text: '2b', action: function () { } },
              { text: '2c', action: function () { } }

            ]
          },
          {
            label: 'group-3',
            items: [
              { text: '3a', action: function () { } },
              { text: '3b', action: function () { } },
              { text: '3c', action: function () { } }

            ]
          },
          {
            label: 'group-4',
            items: [
              { text: '4a', action: function () { } },
              { text: '4b', action: function () { } },
              { text: '4c', action: function () { } }

            ]
          },
          {
            label: 'group-5',
            items: [
              { text: '5a', action: function () { } },
              { text: '5b', action: function () { } },
              { text: '5c', action: function () { } }

            ]
          },
          {
            label: 'group-6',
            items: [
              { text: '6a', action: function () { } },
              { text: '6b', action: function () { } }

            ]
          },
          {
            label: 'group-7',
            items: [
              { text: '7a', action: function () { } },
              { text: '7b', action: function () { } }

            ]
          }
        ];
      };

      var itemMunge = function (s) {
        return s.behaviours === undefined ? Button.sketch({
          'dom': {
            'tag': 'div',
            'attributes': {
              'id': 'mceu_0',
              'class': 'mce-widget mce-btn mce-first',
              'tabindex': '-1',
              'aria-labelledby': 'mceu_0',
              'role': 'button',
              'aria-label': s.text,
              'aria-pressed': 'true'
            }
          },
          'components': [
            Container.sketch({
              'dom': {
                'tag': 'button',
                'attributes': {
                  'role': 'presentation',
                  'type': 'button',
                  'tabindex': '-1'
                }
              },
              'components': [
                Container.sketch({
                  'dom': {
                    'tag': 'i',
                    'attributes': {
                      'class': 'mce-ico mce-i-bullist'
                    }
                  },
                  'components': []
                })
              ]
            })
          ],
          action: s.action !== undefined ? s.action : function () {
            console.log('clicked on button', s);
          },

          behaviours: {
            toggling: {
              toggleClass: 'mce-active'
            }
          }
        }) : Button.sketch({
          'dom': {
            'tag': 'div',
            'attributes': {
              'id': 'mceu_0',
              'class': 'mce-widget mce-btn mce-first',
              'tabindex': '-1',
              'aria-labelledby': 'mceu_0',
              'role': 'button',
              'aria-label': s.dom.innerHtml,
              'aria-pressed': 'true'
            }
          },
          action: s.action,
          'components': [
            Container.sketch({
              'dom': {
                'tag': 'button',
                'attributes': {
                  'role': 'presentation',
                  'type': 'button',
                  'tabindex': '-1'
                }
              },
              'components': [
                Container.sketch({
                  'dom': {
                    'tag': 'i',
                    'attributes': {
                      'class': 'mce-text mce-i-bullist'
                    },
                    innerHtml: s.dom.innerHtml
                  },
                  'components': []
                })
              ]
            })
          ]
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
            Container.sketch({
              dom: { tag: 'div' },
              components: [
                ToolbarGroup.parts().items()
              ]
            })
          ],
          items: s.items
        };
      };

      var toolbarSpec = function (extra) {
        return Merger.deepMerge(extra, {
          dom: {
            tag: 'div',
            classes: [ 'mce-toolbar-grp', 'mce-container', 'mce-panel', 'mce-stack-layout-item' ]
          },
          components: [
            Container.sketch({ 
              components: [

              ]
            })
          ],

          parts: { }
        });
      };

      var subject = HtmlDisplay.section(
        gui,
        'This demo plays around with skinning for TinyMCE Ui',
        Container.sketch({
          dom: {
            classes: [ 'mce-container' ]
          },
          components: [
            Toolbar.sketch(
              toolbarSpec({
                dom: {
                  tag: 'div',
                  styles: {
                    'overflow-x': 'auto',
                    'max-width': '200px',
                    display: 'flex'
                  }
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
        })
      );

      var toolbar1 = subject.components()[0];
      var gps = Toolbar.createGroups(toolbar1, groups());
      Toolbar.setGroups(toolbar1, gps);

      var subject2 = HtmlDisplay.section(
        gui,
        'This toolbar has overflow behaviour that uses a more drawer',
        Container.sketch({
          dom: {
            classes: [ 'mce-container' ]
          },
          components: [
            SplitToolbar.sketch({
              uid: 'demo-toolstrip',
              dom: {
                tag: 'div'
              },
              parts: {
                primary: toolbarSpec({
                  dom: {
                    tag: 'div'
                  },
                  parts: { },

                  members: {
                    group: {
                      munge: groupMunge
                    }
                  }
                }),
                overflow: toolbarSpec({
                  dom: {
                    tag: 'div',
                    styles: {
                      display: 'flex',
                      'flex-wrap': 'wrap'
                    }
                  },
                  parts: { },

                  members: {
                    group: {
                      munge: groupMunge
                    }
                  }
                }),
                'overflow-button': {
                  dom: {
                    tag: 'button',
                    innerHtml: 'More'
                  }
                }
              },
              initGroups: groups,

              components: [
                SplitToolbar.parts().primary(),
                SplitToolbar.parts().overflow()
              ],

              markers: {
                openStyle: 'demo-sliding-open',
                closedStyle: 'demo-sliding-closed',
                growingStyle: 'demo-sliding-height-growing',
                shrinkingStyle: 'demo-sliding-height-shrinking'
              }
            })
          ]
        })
      );

      var toolbar2 = subject2.components()[0];
      var gps2 = Toolbar.createGroups(toolbar2, groups());
      Toolbar.setGroups(toolbar2, gps2);
      toolbar2.getSystem().getByUid('demo-toolstrip').each(SplitToolbar.refresh);
      

      window.addEventListener('resize', function () {
        toolbar2.getSystem().getByUid('demo-toolstrip').each(SplitToolbar.refresh);
      });
    };
  }
);