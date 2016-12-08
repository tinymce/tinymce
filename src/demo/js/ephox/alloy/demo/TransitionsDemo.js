define(
  'ephox.alloy.demo.TransitionsDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.ui.TabSection',
    'ephox.alloy.api.ui.Tabbar',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document',
    'text!dom-templates/demo.tabbar.html',
    'text!dom-templates/demo.tabbing.html'
  ],

  function (Gui, TabSection, Tabbar, HtmlDisplay, Fun, Class, Element, Insert, document, TemplateTabbar, TemplateTabs) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      // var subject = HtmlDisplay.section(
      //   gui,
      //   'instructions',
      //   {
      //     uiType: 'container',
      //     keying: {
      //       mode: 'cyclic'
      //     },
      //     transitioning: {
      //       views: {
      //         'insert_link': function (component, revertToBase) {
      //           return [
      //             {
      //               uiType: 'formlabel',
      //               label: { text: 'Hyperlink' },
      //               field: { uiType: 'input' },
      //               prefix: 'link_',
      //               dom: {
      //                 styles: {
      //                   display: 'inline-block'
      //                 }
      //               }
      //             },
      //             {
      //               uiType: 'button',
      //               dom: {
      //                 tag: 'button',
      //                 innerHtml: 'x'
      //               },
      //               action: revertToBase
      //             }
      //           ];
      //         }
      //       },
      //       base: function (component) {
      //         var moveTo = function (view) {
      //           return function () {
      //             Transitioning.transition(component, view);
      //           };
      //         };

      //         return [
      //           {
      //             uiType: 'button',
      //             dom: {
      //               tag: 'button',
      //               innerHtml: 'Insert Link'
      //             },
      //             action: moveTo('insert_link')
      //           }
      //         ];
      //       },
      //       onChange: function (component) {
      //         Keying.focusIn(component);
      //       }
      //     }
      //   }
      // );

      // Transitioning.revertToBase(subject);

      var subject1 = HtmlDisplay.section(
        gui,
        'A basic tab view (refactoring)',
        TabSection.build({
          dom: {
            tag: 'div'
          },
          components: [
            TabSection.parts().tabbar(),
            TabSection.parts().tabview()
          ],
          tabs: [
            { value: 'alpha', text: 'Alpha' },
            { value: 'beta', text: 'Beta' }
          ],
          defaultView: function () {
            return {
              uiType: 'container'
            };
          },
          parts: {
            tabbar: {
              dom: {
                tag: 'div'
              },
              components: [
                Tabbar.parts().tabs()
              ],
              parts: {
                tabs: { }
              },
              members: {
                tab: {
                  munge: function (tabSpec) {
                    return {
                      dom: {
                        tag: 'button',
                        attributes: {
                          'data-value': tabSpec.value
                        }
                      },
                      components: [
                        { text: tabSpec.text }
                      ]
                    };
                  }
                }
              },
              markers: {
                tabClass: 'demo-tab',
                selectedClass: 'demo-selected-tab'
              }
            },
            'tabview': {
              dom: {
                tag: 'div'
              }
            } 
          }
        })
      );

      return;

      /*

      var subject2 = HtmlDisplay.section(
        gui,
        'A basic tab view',
        TabSection.build({
          
          dom: {
            tag: 'div'
          },
          components: [
            TabSection.parts().tabbar(),
            TabSection.parts().tabview()
          ],
            tabs: [
              {
                value: 'alpha',
                text: 'Alpha',
                view: function () {
                  return {
                    uiType: 'input',
                    dom: {
                      tag: 'input'
                    }
                  };
                }
              }
            ],
            defaultView: function () {
              return {
                value: 'default',
                text: 'Default',
                view: function () {
                  return {
                    uiType: 'input',
                    data: {
                      value: 'a',
                      text: 'A'
                    },
                    dom: {
                      tag: 'input'
                    }
                  };
                }
              };
            },
            parts: {
              'tabbar': parts.tabbar().build(function (tabbarParts) {
                debugger;
                return {
                  dom: {
                    tag: 'div'
                  },
                  parts: {
                    tabs: Tabbar.parts(function (parts) {
                      return { };
                    })
                  },
                  markers: {
                    tabClass: 'tab-button',
                    selectedClass: 'demo-selected'
                  },
                  
                  members: {
                    tab: {
                      munge: function (spec) {
                        return { 
                          dom: {
                            tag: 'button',
                            styles: {
                              margin: '0px'
                            },
                            classes: [ 'tab-button' ],
                            innerHtml: spec.text
                          },
                          components: [ ]
                        };
                      }
                    }
                  }
                };
              }),
              'tabview': parts.tabview().build({
                dom: {
                  tag: 'div'
                }
              })
            } 
          };
        })
      );

      */
    };
  }
);