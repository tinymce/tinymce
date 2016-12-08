define(
  'ephox.alloy.demo.TransitionsDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.api.ui.TabSection',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document',
    'text!dom-templates/demo.tabbar.html',
    'text!dom-templates/demo.tabbing.html'
  ],

  function (Gui, GuiTemplate, TabSection, HtmlDisplay, Option, Class, Element, Insert, document, TemplateTabbar, TemplateTabs) {
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

      var subject2 = HtmlDisplay.section(
        gui,
        'A basic tab view',
        TabSection.build(function (parts) {
          return {
            uiType: 'tabbing',
            dom: {
              tag: 'div'
            },
            components: [
              parts.tabbar().placeholder(),
              parts.tabview().placeholder()
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
              'tabbar': parts.tabbar().build(
                {
                  dom: {
                    tag: 'div'
                  },
                  parts: {
                    tabs: { }
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
                }
              ),
              'tabview': parts.tabview().build({
                dom: {
                  tag: 'div'
                }
              })
            } 
          };
        })
      );
    };
  }
);