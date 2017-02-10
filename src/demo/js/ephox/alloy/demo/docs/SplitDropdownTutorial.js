define(
  'ephox.alloy.demo.docs.SplitDropdownTutorial',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.Dropdown',
    'ephox.alloy.api.ui.ExpandableForm',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.api.ui.FormChooser',
    'ephox.alloy.api.ui.FormCoupledInputs',
    'ephox.alloy.api.ui.FormField',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.api.ui.ModalDialog',
    'ephox.alloy.api.ui.SplitDropdown',
    'ephox.alloy.api.ui.SplitToolbar',
    'ephox.alloy.api.ui.Tabbar',
    'ephox.alloy.api.ui.TabButton',
    'ephox.alloy.api.ui.TabSection',
    'ephox.alloy.api.ui.Tabview',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.demo.DemoSink',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.knoch.future.Future',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (GuiFactory, SystemEvents, Gui, Button, Container, Dropdown, ExpandableForm, Form, FormChooser, FormCoupledInputs, FormField, Input, Menu, ModalDialog, SplitDropdown, SplitToolbar, Tabbar, TabButton, TabSection, Tabview, TieredMenu, Toolbar, ToolbarGroup, EventHandler, DemoSink, HtmlDisplay, Objects, Arr, Merger, Future, Fun, Result, Class, Element, Insert, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var sink = DemoSink.make();

      gui.add(sink);

      var sketchSplitDropdown = function () {
        return SplitDropdown.sketch({
          dom: {
            tag: 'div',
            classes: 'tutorial-split-dropdown'
          },
          components: [
            SplitDropdown.parts().arrow(),
            SplitDropdown.parts().button()
          ],
          toggleClass: 'tutorial-split-dropdown-open',
          fetch: function () {
            return Future.pure(
              TieredMenu.simpleData('tutorial1', 'tutorial1', [
                {
                  data: {
                    value: 'dog',
                    text: 'dog'
                  }
                }
              ])
            );
          },

          
          onExecute: function () {
            console.log('Split dropdown fired');
          },

          lazySink: function () { 
            return Result.value(sink);
          },

          parts: {
            arrow: {
              dom: {
                tag: 'button',
                innerHtml: 'v'
              }
            },
            button: {
              dom: {
                tag: 'button',
                innerHtml: 'Click me'
              }
            },
            menu: {
              markers: {
                backgroundMenu: 'tutorial-background-menu',
                menu: 'tutorial-menu',
                selectedMenu: 'tutorial-selected-menu',
                item: 'tutorial-item',
                selectedItem: 'tutorial-selected-item'
              },

              members: {
                menu: {
                  munge: function (m) {
                    return {
                      dom: {
                        tag: 'div'
                      },
                      components: [
                        Menu.parts().items()
                      ]
                    }
                  }
                },
                item: {
                  munge: function (i) {
                    return {
                      type: 'item',
                      data: i.data,
                      dom: {
                        tag: 'li'
                      },
                      components: [
                        GuiFactory.text(i.data.text)
                      ]
                    };
                  }
                }
              }
            }
          }
        });
      };
      
      var sketchButton = function () {
        return Button.sketch({
          dom: {
            tag: 'button',
            innerHtml: 'Click me'
          }
        });
      };

      var sketchDropdown = function () {
        return Dropdown.sketch({
          fetch: function () {
            return Future.pure(
              TieredMenu.simpleData('a', 'a', [
                { data: { value: 'A', text: 'A' } }
              ])
            );
          },
          toggleClass: 'toggle',
          dom: {
            tag: 'button',
            innerHtml: 'Dropdown'
          },

          lazySink: function () {
            return Result.value(sink);
          },

          parts: {
            menu: {
              markers: {
                backgroundMenu: 'tutorial-background-menu',
                menu: 'tutorial-menu',
                selectedMenu: 'tutorial-selected-menu',
                item: 'tutorial-item',
                selectedItem: 'tutorial-selected-item'
              },

              members: {
                menu: {
                  munge: function (m) {
                    return {
                      dom: {
                        tag: 'div'
                      },
                      components: [
                        Menu.parts().items()
                      ]
                    }
                  }
                },
                item: {
                  munge: function (i) {
                    return {
                      type: 'item',
                      data: i.data,
                      dom: {
                        tag: 'li'
                      },
                      components: [
                        GuiFactory.text(i.data.text)
                      ]
                    };
                  }
                }
              }
            }
          }
        });
      };

      var sketchFormChooser = function () {
        return FormChooser.sketch({
          dom: {
            tag: 'div'
          },
          components: [
            FormChooser.parts().legend(),
            FormChooser.parts().choices()
          ],

          choices: [
            { value: 'a' }
          ],

          parts: {
            legend: { },
            choices: { }
          },
          members: {
            choice: {
              munge: function (c) {
                return Container.sketch({
                  dom: {
                    tag: 'span',
                    innerHtml: c.value
                  }
                });
              }
            }
          },

          markers: {
            choiceClass: 'tutorial-choice',
            selectedClass: 'tutorial-selected-choice'
          }
        });
      };

      var sketchCoupledInput = function () {
        return FormCoupledInputs.sketch({
          dom: {
            tag: 'div'
          },
          components: [
            FormCoupledInputs.parts().field1(),
            FormCoupledInputs.parts().field2(),
            FormCoupledInputs.parts().lock()
          ],

          parts: {
            field1: {
              parts: { 
                label: {
                  dom: {
                    tag: 'label'
                  }
                },
                field: { }
              },

              components: [
                FormField.parts(Input).label(),
                FormField.parts(Input).field()
              ]
            },
            field2: {
              parts: {
                label: {
                  dom: {
                    tag: 'label'
                  }
                },
                field: { }
              },

              components: [
                FormField.parts(Input).label(),
                FormField.parts(Input).field()
              ]
            },
            lock: {
              dom: {
                tag: 'button',
                innerHtml: 'x'
              }
            }
          },

          onLockedChange: function () { },
          markers: {
            lockClass: 'tutorial-locked'
          }
        })
      }

      var sketchExpandableForm = function () {
        return ExpandableForm.sketch({
          dom: {
            tag: 'div'
          },

          markers: {
            closedClass: 'tutorial-expanded-form-closed',
            openClass: 'tutorial-expanded-form-open',
            shrinkingClass: 'tutorial-expanded-form-shrinking',
            growingClass: 'tutorial-expanded-form-growing',
            expandedClass: 'tutorial-expanded-section-expanded',
            collapsedClass: 'tutorial-expanded-section-collapsed'
          },

          components: [
            ExpandableForm.parts().minimal(),
            ExpandableForm.parts().expander(),
            ExpandableForm.parts().extra(),
            ExpandableForm.parts().controls()
          ],

          parts: {
            minimal: {
              dom: {
                tag: 'div'
              },
              components: [
                Form.parts('alpha')
              ],
              parts: {
                alpha: sketchCoupledInput()
              }
            },
            extra: {
              dom: {
                tag: 'div'
              },
              components: [
                Form.parts('beta')
              ],
              parts: {
                beta: Input.sketch({ })
              }
            },
            expander: {
              dom: {
                tag: 'button',
                innerHtml: 'v'
              }
            },
            controls: {
              dom: {
                tag: 'div'
              }
            }
          }
        });
      };

      var sketchModalDialog = function () {
        return ModalDialog.sketch({
          lazySink: function () { 
            return Result.value(sink);
          },

          onEscape: function () {
          
          },
          
          dom: {
            tag: 'div'
          },

          components: [
            ModalDialog.parts().title(),
            ModalDialog.parts().close(),
            ModalDialog.parts().body(),
            ModalDialog.parts().footer()
          ],

          parts: {
            title: {
              dom: { tag: 'div', innerHtml: 'Title' }
            },
            close: {
              dom: { tag: 'div', innerHtml: 'X' }
            },
            body: {
              dom: { tag: 'div' }
            },
            footer: {
              dom: { tag: 'div' }
            },
            blocker: {
              // dom: {
              //   styles: {
              //     background: 'blue',
              //     opacity: '0.5'
              //   }
              // }
            }
          }
        });
      };

      var sketchSplitToolbar = function () {
        return SplitToolbar.sketch({
          markers: {
            closedClass: 'tutorial-split-toolbar-closed',
            openClass: 'tutorial-split-toolbar-open',
            shrinkingClass: 'tutorial-split-toolbar-shrinking',
            growingClass: 'tutorial-split-toolbar-growing'
          },

          dom: {
            tag: 'div'
          },
          
          components: [
            SplitToolbar.parts().primary(),
            SplitToolbar.parts().overflow()
          ],

          parts: {
            primary: {
              dom: {
                tag: 'div'
              },
              parts: {
                groups: { }
              },
              members: {
                group: {
                  munge: Fun.identity
                }
              }
            },
            overflow: {
              uid: 'hacky',
              dom: {
                tag: 'div'
              },
              components: [
                Toolbar.parts().groups()
              ],
              shell: false,
              parts: { 
                groups: {
                  dom: {
                    tag: 'div'
                  }
                }
              },
              members: {
                group: {
                  munge: Fun.identity
                }
              }
            },
            'overflow-button': { }
          }
        });
      };

      var sketchTabbar = function () {
        return Tabbar.sketch({
          dom: {
            tag: 'div'
          },
          components: [
            Tabbar.parts().tabs()
          ],

          tabs: [
            { value: 'a' },
            { value: 'b' },
            { value: 'c' }
          ],

          markers: {
            tabClass: 'tutorial-tab',
            selectedClass: 'tutorial-selected-tab'
          },

          members: {
            tab: {
              munge: function (t) {
                return {
                  dom: {
                    tag: 'span',
                    innerHtml: t.value
                  },
                  value: t.value
                };
              }
            }
          },

          parts: {
            tabs: { }
          }
        })
      };

      var sketchTabview = function () {
        return Tabview.sketch({
          
        })
      };

      var sketchTabButton = function () {
        return TabButton.sketch({
          value: 'tab.button.1',
          dom: {
            tag: 'button',
            innerHtml: '1'
          }
        })
      };

      var sketchTabSection = function () {
        return TabSection.sketch({
          dom: {
            tag: 'div'
          },
          tabs: [
            { value: 'alpha', view: function () { return [ ]; } },
            { value: 'beta', view: function () { return [ ]; } }
          ],
          components: [
            TabSection.parts().tabbar(),
            TabSection.parts().tabview()
          ],

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

              markers: {
                tabClass: 'tutorial-tab',
                selectedClass: 'tutorial-selected-tab'
              },

              members: {
                tab: {
                  munge: function (t) {
                    return {
                      dom: {
                        tag: 'span',
                        innerHtml: t.value
                      },
                      value: t.value
                    };
                  }
                }
              }
            },
            tabview: { }
          }
        });
      };

      var sketchTieredMenu = function () {
        return TieredMenu.sketch({
          onExecute: function () { },
          onEscape: Fun.noop,
          onOpenMenu: Fun.noop,
          onOpenSubmenu: Fun.noop,
          data: {
            primary: 'primary',
            menus: {
              primary: {
                value: 'primary',
                items: [
                  { data: { value: 'a', text: 'a' } }
                ]
              }
            },
            expansions: { }
          },
          markers: {
            backgroundMenu: 'tutorial-background-menu',
            menu: 'tutorial-menu',
            selectedMenu: 'tutorial-selected-menu',
            item: 'tutorial-item',
            selectedItem: 'tutorial-selected-item'
          },
          members: {
            menu: {
              munge: function (m) {
                return {
                  dom: {
                    tag: 'div'
                  },
                  components: [
                    Menu.parts().items()
                  ]
                }
              }
            },
            item: {
              munge: function (i) {
                return {
                  type: 'item',
                  data: i.data,
                  dom: {
                    tag: 'li'
                  },
                  components: [
                    GuiFactory.text(i.data.text)
                  ]
                };
              }
            }
          }
        })
      };

      var sketchToolbar = function () {
        return Toolbar.sketch({
          uid: 'hacky',
          dom: {
            tag: 'div'
          },
          components: [ ],
          parts: {
            groups: {}
          },

          members: {
            group: {
              munge: function (g) {
                return Merger.deepMerge(g, {
                  dom: {
                    tag: 'div'
                  },
                  components: [
                    ToolbarGroup.parts().items()
                  ],
                  parts: {
                    items: { }
                  },

                  members: {
                    item: {
                      munge: Fun.identity
                    }
                  },
                  markers: {
                    selectedItem: 'tutorial-selected-item',
                    itemClass: 'tutorial-item'
                  }
                })
              }
            }
          }
        })
      };
   

      // var dialog = GuiFactory.build(
      //   sketchModalDialog()
      // );

      // ModalDialog.show(dialog);

      HtmlDisplay.section(
        gui,
        'Testing out the self-documentation',
        sketchToolbar()
      );

      gui.getByUid('hacky').each(function (toolbar) {
        var gs = Toolbar.createGroups(toolbar, [
          {
            items: [
              Container.sketch({ dom: { innerHtml: 'hi' } })
            ]
          }
        ]);
        Toolbar.setGroups(toolbar, gs);
      })
    };
  }
);
