define(
  'ephox.alloy.demo.FormDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Tabstopping',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.ExpandableForm',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.api.ui.FormChooser',
    'ephox.alloy.api.ui.FormCoupledInputs',
    'ephox.alloy.api.ui.FormField',
    'ephox.alloy.api.ui.HtmlSelect',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.api.ui.Typeahead',
    'ephox.alloy.api.ui.menus.MenuData',
    'ephox.alloy.demo.DemoDataset',
    'ephox.alloy.demo.DemoMenus',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.alloy.registry.Tagger',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.knoch.future.Future',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Value',
    'global!document',
    'global!setTimeout'
  ],

  function (Gui, GuiFactory, Keying, Representing, Tabstopping, Button, ExpandableForm, Form, FormChooser, FormCoupledInputs, FormField, HtmlSelect, Input, Typeahead, MenuData, DemoDataset, DemoMenus, HtmlDisplay, Tagger, Objects, Arr, Merger, Future, Fun, Option, Result, Class, Element, Insert, Value, document, setTimeout) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

       var sink = GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        behaviours: {
          positioning: {
            useFixed: true
          }
        }
      });

      gui.add(sink);

      var lazySink = function () {
        return Result.value(sink);
      };

      var textMunger = function (spec) {
        var invalidUid = Tagger.generate('demo-invalid-uid');
        return Merger.deepMerge(spec, {
          dom: {
            tag: 'div'
          },
          parts: {
            field: {
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
            },
            label: {
              dom: { tag: 'label', innerHtml: spec.label }
            }
          },
          components: [
            FormField.parts(Input).label(),
            { uiType: 'container', uid: invalidUid },
            FormField.parts(Input).field()
          ]
        });
      };

      var coupledTextMunger = function (spec) {
        return Merger.deepMerge(spec, {
          dom: {
            tag: 'div'
          },
          parts: {
            'field1': spec.field1,
            'field2': spec.field2,
            lock: { uiType: 'button', dom: { tag: 'button', innerHtml: 'x' }, tabstopping: true }
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
        });
      };

      var selectMunger = function (spec) {
        return Merger.deepMerge(spec, {
          dom: {
            tag: 'div',
            styles: {
              border: '1px solid blue'
            }
          },
          components: [
            FormField.parts(HtmlSelect).label(),
            {
              uiType: 'container',
              dom: {
                classes: [ 'wrapper' ]
              },
              components: [
                FormField.parts(HtmlSelect).field()
              ]
            }
          ],
          
          parts: {
            field: {
              dom: {
                classes: [ 'ephox-select-wrapper' ]
              },
              tabstopping: true,
              focusing: true,
              options: spec.options,
              members: {
                option: {
                  munge: function (spec) {
                    return {
                      dom: {
                        attributes: {
                          value: spec.value
                        },
                        innerHtml: spec.text
                      }
                    };
                  }
                }
              }
            },
            label: { dom: { tag: 'label', innerHtml: spec.label } }
          }
        });
      };

      var radioMunger = function (spec) {
        return Merger.deepMerge(spec, {
          dom: {
            tag: 'fieldset'
          },
          label: 'Radio',
          parts: {
            legend: { },
            fields: { }
          },
          markers: {
            radioSelector: 'input[type="radio"]'
          },
          components: [
            { uiType: 'placeholder', name: '<alloy.form.radio-fields>', owner: 'radio-group' },
            { uiType: 'placeholder', name: '<alloy.form.field-legend>', owner: 'radio-group' }
          ]
        });
      };

      var customRadioMunger = function (spec) {
        return Merger.deepMerge(spec, {
          dom: {
            tag: 'fieldset'
          },
          label: 'Radio',
          parts: {
            legend: { },
            fields: { }
          },
          markers: {
            itemClass: 'ephox-pastry-independent-button',
            selectedClass: 'demo-selected'
          },
          components: [
            { uiType: 'placeholder', name: '<alloy.form.field-legend>', owner: 'radio-group' },
            {
              uiType: 'container',
              components: [
                { uiType: 'placeholder', name: '<alloy.form.radio-fields>', owner: 'radio-group' }
              ]
            }
          ]
        });
      };

      var mungers = {
        'text-input': textMunger,
        'select-input': selectMunger,
        'radio-group': radioMunger,
        'custom-radio-group': customRadioMunger,
        'coupled-text-input': coupledTextMunger
      };

      var fieldParts = function () {
        return {
          omega: FormCoupledInputs.build(
            coupledTextMunger({
              field1: textMunger({ label: 'omega-1', inline: false }),
              field2: textMunger({ label: 'omega-2', inline: false })
            })
          ),
          alpha: FormField.build(Input, textMunger({ label: 'Alpha', inline: false })),
          beta: FormField.build(Input, textMunger({ label: 'Beta', inline: false })),
          gamma: FormField.build(Input, textMunger({ label: 'Gamma', inline: false })),
          delta: FormField.build(Input, textMunger({ label: 'Delta', inline: false })),
          epsilon: FormField.build(Input, textMunger({ label: 'Epsilon' })),
          rho: FormChooser.build({
            radioStyle: 'icons',

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
            behaviours: Objects.wrapAll([
              Tabstopping.config(true)
            ]),
            members: {
              choice: {
                munge: function (data) {
                  return {
                    uiType: 'custom',
                    dom: {
                      tag: 'span',
                      classes: [ 'ephox-pastry-independent-button' ],
                      attributes: {
                        title: data.text
                      },
                      styles: {
                        display: 'flex'
                      }
                    },

  // <span class="ephox-pastry-independent-button ephox-pastry-button ephox-polish-dialog-float-container ephox-polish-dialog-float-selected" unselectable="on" tabindex="-1" data-float-value="none" 
  //   title="Align None" aria-label="Align None" role="radio" aria-checked="true" style="-webkit-user-select: none;">
  //                 <div role="presentation" aria-hidden="true" class="ephox-polish-dialog-float-icon">
  //                   <div role="presentation" class="ephox-polish-dialog-float-icon-inner-left"></div>
  //                   <div role="presentation" class="ephox-polish-dialog-float-icon-inner-center"></div>
  //                   <div role="presentation" class="ephox-polish-dialog-float-icon-inner-right"></div>
  //                 </div>
  //               </span>


                    label: 'Alignment',
                    parts: {
                      legend: { },
                      fields: { }
                    },
                    markers: {
                      radioSelector: 'input[type="radio"]'
                    }
                  };
                }
              }
            },
            name: 'rho',
            choices: [
              { value: 'left', text: 'Left' },
              { value: 'middle', text: 'Middle' },
              { value: 'right', text: 'Right' }
            ]
          }),
          theta: FormField.build(HtmlSelect, selectMunger({
            label: 'AA',
            options: [
              { value: 'a.a', text: 'A.A' },
              { value: 'b.b', text: 'B.B' },
              { value: 'c.c', text: 'C.C' },
              { value: 'd.d', text: 'D.D' }
            ]        
          })),

          maxis: FormField.build(Typeahead, {
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
                    return MenuData.simple('blah', 'Blah', items);
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
        Form.build({
          dom: {
            tag: 'div',
            classes: [ 'outside-form' ]
          },
       
          parts: Objects.narrow(fieldParts(), [ 'alpha', 'maxis', 'beta', 'gamma', 'delta', 'epsilon', 'rho' ]),

          components: [
            { uiType: 'placeholder', owner: 'form', name: '<alloy.field.alpha>' },
            { uiType: 'placeholder', owner: 'form', name: '<alloy.field.maxis>' },
            { uiType: 'placeholder', owner: 'form', name: '<alloy.field.beta>' },
            { uiType: 'placeholder', owner: 'form', name: '<alloy.field.gamma>' },
            {
              uiType: 'container',
              components: [
                { uiType: 'placeholder', owner: 'form', name: '<alloy.field.delta>' },
                { uiType: 'placeholder', owner: 'form', name: '<alloy.field.epsilon>' }
              ]
            },
            { uiType: 'placeholder', owner: 'form', name: '<alloy.field.rho>' }

          ],

          behaviours: {
            keying: {
              mode: 'cyclic'
            }
          }
        })
      );

      Representing.setValue(form, {
        alpha: { value: 'doggy', text : 'doggy' },
        beta: { value: 'bottle', text: 'bottle' },
        gamma: { value: 'cad', text: 'cad' }
      });

      var expform = HtmlDisplay.section(
        gui,
        'This form expands',
        ExpandableForm.build({
          dom: {
            tag: 'div',
            classes: [ 'expandable-form' ]
          },
          members: {
            ui: {
              munge: function (spec) {
                return mungers[spec.type](spec);
              }
            }
          },
          markers: {
            expandedClass: 'a',
            collapsedClass: 'b',
            closedStyle: 'demo-sliding-closed',
            openStyle: 'demo-sliding-open',
            shrinkingStyle: 'demo-sliding-height-shrinking',
            growingStyle: 'demo-sliding-height-growing'
          },
          parts: {
            'minimal': {
              dom: {
                tag: 'div',
                classes: [ 'form-section' ]
              },
              parts: Objects.narrow(fieldParts(), [ 'omega', 'alpha', 'theta' ]),
              components: [
                { uiType: 'placeholder', owner: 'form', name: '<alloy.field.omega>' },
                { uiType: 'placeholder', owner: 'form', name: '<alloy.field.alpha>' },
                { uiType: 'placeholder', owner: 'form', name: '<alloy.field.theta>' }
              ]
            },
            'extra': {
              dom: {
                tag: 'div',
                classes: [ 'form-section' ]
              },
              parts: Objects.narrow(fieldParts(), [ 'beta', 'gamma', 'delta', 'epsilon', 'rho' ]),
              components: [
                { uiType: 'placeholder', owner: 'form', name: '<alloy.field.beta>' },
                { uiType: 'placeholder', owner: 'form', name: '<alloy.field.gamma>' },
                { uiType: 'placeholder', owner: 'form', name: '<alloy.field.delta>' },
                { uiType: 'placeholder', owner: 'form', name: '<alloy.field.epsilon>' },
                { uiType: 'placeholder', owner: 'form', name: '<alloy.field.rho>' }
              ]
            },
            'expander': {
              dom: {
                tag: 'button',
                innerHtml: 'v'
              },
              keying: {
                mode: 'execution'
              },
              tabstopping: true
            },
            'controls': {
              dom: {
                tag: 'div'
              },
              tabstopping: true,
              keying: {
                mode: 'flow',
                selector: 'button'
              },
              components: [
                Button.build({ dom: { tag: 'button', innerHtml: 'OK' } })
              ]
            }
          },

          components: [
            ExpandableForm.parts().minimal(),
            ExpandableForm.parts().extra(),
            ExpandableForm.parts().expander(),
            ExpandableForm.parts().controls()
          ],
          behaviours: Objects.wrapAll([
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