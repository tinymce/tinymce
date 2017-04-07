define(
  'ephox.alloy.demo.FormDemo',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Tabstopping',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.ExpandableForm',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.api.ui.FormChooser',
    'ephox.alloy.api.ui.FormCoupledInputs',
    'ephox.alloy.api.ui.FormField',
    'ephox.alloy.api.ui.HtmlSelect',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.api.ui.Typeahead',
    'ephox.alloy.demo.DemoDataset',
    'ephox.alloy.demo.DemoMenus',
    'ephox.alloy.demo.DemoSink',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.alloy.registry.Tagger',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Value',
    'global!document',
    'global!setTimeout'
  ],

  function (
    Behaviour, Keying, Representing, Tabstopping, Attachment, Gui, Button, Container, ExpandableForm, Form, FormChooser, FormCoupledInputs, FormField, HtmlSelect,
    Input, TieredMenu, Typeahead, DemoDataset, DemoMenus, DemoSink, HtmlDisplay, Tagger, Objects, Arr, Future, Merger, Option, Result, Element, Class, Value,
    document, setTimeout
  ) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Attachment.attachSystem(body, gui);

       var sink = DemoSink.make();

      gui.add(sink);

      var lazySink = function () {
        return Result.value(sink);
      };

      var textMunger = function (spec) {
        var invalidUid = Tagger.generate('demo-invalid-uid');
        return {
          dom: {
            tag: 'div'
          },
          parts: {
            field: {
              inputBehaviours: {
                invalidating: {
                  invalidClass: 'invalid-input',
                  notify: {
                    getContainer: function (input) {
                      return input.getSystem().getByUid(invalidUid).fold(Option.none, function (c) {
                        return Option.some(c.element());
                      });
                    }
                  },
                  validator: {
                    validate: function (input) {
                      var v = Representing.getValue(input);
                      return Future.nu(function (callback) {
                        setTimeout(function () {
                          var res = v.indexOf('a') === 0 ? Result.error('Do not start with a!') : Result.value({ });
                          callback(res);
                        }, 1000);  
                      });
                    },
                    onEvent: 'input'
                  }
                }
              }
            },
            label: {
              dom: { tag: 'label', innerHtml: spec.label }
            }
          },
          components: [
            FormField.parts(Input).label(),
            Container.sketch({ uid: invalidUid }),
            FormField.parts(Input).field()
          ]
        };
      };

      var coupledTextMunger = function (spec) {
        return {
          dom: {
            tag: 'div'
          },
          parts: {
            'field1': spec.field1,
            'field2': spec.field2,
            lock: {
              dom: { tag: 'button', innerHtml: 'x' },
              buttonBehaviours: {
                tabstopping: true
              }
            }
          },
          markers: {
            lockClass: 'demo-selected'
          },
          onLockedChange: function (current, other) {
            var cValue = Representing.getValue(current);
            Representing.setValue(other, cValue);
          },

          components: [
            FormCoupledInputs.parts().field1(),
            FormCoupledInputs.parts().field2(),
            FormCoupledInputs.parts().lock()
          ]
        };
      };

      var selectMunger = function (spec) {
        return {
          dom: {
            tag: 'div',
            styles: {
              border: '1px solid blue'
            }
          },
          components: [
            FormField.parts(HtmlSelect).label(),
            Container.sketch({
              dom: {
                classes: [ 'wrapper' ]
              },
              components: [
                FormField.parts(HtmlSelect).field()
              ]
            })
          ],
          
          parts: {
            field: {
              dom: {
                classes: [ 'ephox-select-wrapper' ]
              },
              selectBehaviours: {
                tabstopping: true,
                focusing: true
              },
              options: spec.options
            },
            label: { dom: { tag: 'label', innerHtml: spec.label } }
          }
        };
      };

      var fieldParts = function () {
        return {
          omega: FormCoupledInputs.sketch(
            coupledTextMunger({
              field1: textMunger({ label: 'omega-1', inline: false }),
              field2: textMunger({ label: 'omega-2', inline: false })
            })
          ),
          alpha: FormField.sketch(Input, textMunger({ label: 'Alpha', inline: false })),
          beta: FormField.sketch(Input, textMunger({ label: 'Beta', inline: false })),
          gamma: FormField.sketch(Input, textMunger({ label: 'Gamma', inline: false })),
          delta: FormField.sketch(Input, textMunger({ label: 'Delta', inline: false })),
          epsilon: FormField.sketch(Input, textMunger({ label: 'Epsilon' })),
          rho: FormChooser.sketch({
            parts: {
              legend: {
                dom: {
                  innerHtml: 'Rho'
                }
              },
              choices: { }
            },

            markers: {
              choiceClass: 'ephox-pastry-independent-button',
              selectedClass: 'demo-selected'
            },

            dom: {
              tag: 'div'
            },
            components: [
              FormChooser.parts().legend(),
              FormChooser.parts().choices()
            ],
            chooserBehaviours: Behaviour.derive([
              Tabstopping.config(true)
            ]),
            members: {
              choice: {
                munge: function (data) {
                  return {
                    dom: {
                      tag: 'span',
                      classes: [ 'ephox-pastry-independent-button' ],
                      attributes: {
                        title: data.text
                      },
                      styles: {
                        display: 'flex'
                      }
                    }
                  };
                }
              }
            },
            choices: [
              { value: 'left', text: 'Left' },
              { value: 'middle', text: 'Middle' },
              { value: 'right', text: 'Right' }
            ]
          }),
          theta: FormField.sketch(HtmlSelect, selectMunger({
            label: 'AA',
            options: [
              { value: 'a.a', text: 'A.A' },
              { value: 'b.b', text: 'B.B' },
              { value: 'c.c', text: 'C.C' },
              { value: 'd.d', text: 'D.D' }
            ]        
          })),

          maxis: FormField.sketch(Typeahead, {
            parts: {
              field: {
                minChars: 1,

                lazySink: lazySink,

                fetch: function (input) {

                  var text = Value.get(input.element());
                  console.log('text', text);
                  var matching = Arr.bind(DemoDataset, function (d) {
                    var index = d.indexOf(text.toLowerCase());
                    if (index > -1) {
                      var html = d.substring(0, index) + '<b>' + d.substring(index, index + text.length) + '</b>' + 
                        d.substring(index + text.length);
                      return [ { type: 'item', data: { value: d, text: d, html: html }, 'item-class': 'class-' + d } ];
                    } else {
                      return [ ];
                    }
                  });

                  var matches = matching.length > 0 ? matching : [
                    { type: 'separator', text: 'No items' }
                  ];
         
                  var future = Future.pure(matches);
                  return future.map(function (items) {
                    return TieredMenu.simpleData('blah', 'Blah', items);
                  });
                },
                dom: {

                },
                parts: {
                  menu: DemoMenus.list()
                },

                markers: {
                  openClass: 'alloy-selected-open'
                }
              },
              label: {
                dom: {
                  tag: 'label',
                  innerHtml: 'Maxis'
                }
              }
            },
            components: [
              FormField.parts(Typeahead).label(),
              FormField.parts(Typeahead).field()
            ]
          })
        };
      };

      var form = HtmlDisplay.section(
        gui,
        'This form has many fields',
        Form.sketch({
          dom: {
            tag: 'div',
            classes: [ 'outside-form' ]
          },
       
          parts: Objects.narrow(fieldParts(), [ 'alpha', 'maxis', 'beta', 'gamma', 'delta', 'epsilon', 'rho' ]),

          components: [
            Form.parts('alpha'),
            Form.parts('maxis'),
            Form.parts('beta'),
            Form.parts('gamma'),
            Container.sketch({
              components: [
                Form.parts('delta'),
                Form.parts('epsilon')
              ]
            }),
            Form.parts('rho')

          ],

          formBehaviours: {
            keying: {
              mode: 'cyclic'
            }
          }
        })
      );

      Representing.setValue(form, {
        alpha: 'doggy',
        beta: 'bottle',
        gamma: 'cad'
      });

      var expform = HtmlDisplay.section(
        gui,
        'This form expands',
        ExpandableForm.sketch({
          dom: {
            tag: 'div',
            classes: [ 'expandable-form' ]
          },
          
          markers: {
            expandedClass: 'a',
            collapsedClass: 'b',
            closedClass: 'demo-sliding-closed',
            openClass: 'demo-sliding-open',
            shrinkingClass: 'demo-sliding-height-shrinking',
            growingClass: 'demo-sliding-height-growing'
          },
          parts: {
            'minimal': {
              dom: {
                tag: 'div',
                classes: [ 'form-section' ]
              },
              parts: Objects.narrow(fieldParts(), [ 'omega', 'alpha', 'theta' ]),
              components: [
                Form.parts('omega'),
                Form.parts('alpha'),
                Form.parts('theta')
              ]
            },
            'extra': {
              dom: {
                tag: 'div',
                classes: [ 'form-section' ]
              },
              parts: Objects.narrow(fieldParts(), [ 'beta', 'gamma', 'delta', 'epsilon', 'rho' ]),
              components: [
                Form.parts('beta'),
                Form.parts('gamma'),
                Form.parts('delta'),
                Form.parts('epsilon'),
                Form.parts('rho')
              ]
            },
            'expander': {
              dom: {
                tag: 'button',
                innerHtml: 'v'
              },
              buttonBehaviours: {
                keying: {
                  mode: 'execution'
                },
                tabstopping: true
              }
            },
            'controls': {
              dom: {
                tag: 'div'
              },
              behaviours: {
                tabstopping: true,
                keying: {
                  mode: 'flow',
                  selector: 'button'
                }
              },
              components: [
                Button.sketch({ dom: { tag: 'button', innerHtml: 'OK' } })
              ]
            }
          },

          components: [
            ExpandableForm.parts().minimal(),
            ExpandableForm.parts().extra(),
            ExpandableForm.parts().expander(),
            ExpandableForm.parts().controls()
          ],
          expandableBehaviours: Behaviour.derive([
            Keying.config({
              mode: 'cyclic',
              visibilitySelector: '.form-section'
            })
          ])
        })
      );

      Keying.focusIn(expform);

      setTimeout(function () {
        ExpandableForm.toggleForm(expform);
      }, 1000);
    };
  }
);