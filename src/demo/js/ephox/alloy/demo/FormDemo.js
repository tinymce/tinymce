define(
  'ephox.alloy.demo.FormDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.alloy.registry.Tagger',
    'ephox.highway.Merger',
    'ephox.knoch.future.Future',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document',
    'global!setTimeout'
  ],

  function (Gui, Representing, HtmlDisplay, Tagger, Merger, Future, Fun, Option, Result, Class, Element, Insert, document, setTimeout) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

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
            }
          },
          components: [
            { uiType: 'placeholder', name: '<alloy.form.field-label>', owner: 'formlabel' },
            { uiType: 'container', uid: invalidUid },
            { uiType: 'placeholder', name: '<alloy.form.field-input>', owner: 'formlabel' }
          ]
        });
      };

      var coupledTextMunger = function (spec) {
        return Merger.deepMerge(spec, {
          dom: {
            tag: 'div'
          },
          parts: {
            'field-1': spec.field1,
            'field-2': spec.field2,
            lock: { uiType: 'button', dom: { tag: 'button', innerHtml: 'x' }, tabstopping: true }
          },
          markers: {
            lockClass: 'demo-selected'
          },
          onLockedChange: function (primary, current, other) {
            var cValue = Representing.getValue(current);
            Representing.setValue(other, cValue);
          },

          components: [
            { uiType: 'placeholder', name: '<alloy.form.field-1>', owner: 'coupled-text-input' },
            { uiType: 'placeholder', name: '<alloy.form.field-2>', owner: 'coupled-text-input' },
            { uiType: 'placeholder', name: '<alloy.form.lock>', owner: 'coupled-text-input' }
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
            { uiType: 'placeholder', name: '<alloy.form.field-label>', owner: 'formlabel' },
            {
              uiType: 'container',
              dom: {
                classes: [ 'wrapper' ]
              },
              components: [
                { uiType: 'placeholder', name: '<alloy.form.field-input>', owner: 'formlabel' }
              ]
            }
          ],
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
          },
          parts: {
            field: {
              dom: {
                classes: [ 'ephox-select-wrapper' ]
              },
              tabstopping: true,
              focusing: true
            }
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

      var fieldParts = {
        omega: {
          type: 'coupled-text-input',
          field1: { type: 'text-input', label: 'Omega.1' },
          field2: { type: 'text-input', label: 'Omega.2' }
        },
        alpha: { type: 'text-input', label: 'Alpha', inline: false },
        beta: { type: 'text-input', label: 'Beta', inline: false },
        gamma: {
          type: 'radio-group',
          members: {
            radio: {
              munge: function (data) {
                return { uiType: 'custom' };
              }
            }
          },
          name: 'gamma',
          candidates: [
            { value: 'abra', text: 'Abra' },
            { value: 'cad', text: 'Cad' },
            { value: 'abra!', text: 'abra!' }
          ]
        },
        delta: { type: 'text-input', label: 'Delta', inline: false },
        epsilon: { type: 'text-input', label: 'Epsilon' },
        rho: {
          type: 'custom-radio-group',
          radioStyle: 'icons',
          members: {
            radio: {
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
          candidates: [
            { value: 'left', text: 'Left' },
            { value: 'middle', text: 'Middle' },
            { value: 'right', text: 'Right' }
          ]
        },
        theta: {
          type: 'select-input',
          label: 'AA',
          options: [
            { value: 'a.a', text: 'A.A' },
            { value: 'b.b', text: 'B.B' },
            { value: 'c.c', text: 'C.C' },
            { value: 'd.d', text: 'D.D' }
          ]        
        }
      };

      // var form = HtmlDisplay.section(
      //   gui,
      //   'This form has many fields',
      //   {
      //     uiType: 'form',
      //     dom: {
      //       tag: 'div',
      //       classes: [ 'outside-form' ]
      //     },
      //     members: {
      //       ui: {
      //         munge: function (spec) {
      //           return mungers[spec.type](spec);
      //         }
      //       }
      //     },
      //     parts: fieldParts,

      //     components: [
      //       { uiType: 'placeholder', owner: 'form', name: '<alloy.field.alpha>' },
      //       { uiType: 'placeholder', owner: 'form', name: '<alloy.field.beta>' },
      //       { uiType: 'placeholder', owner: 'form', name: '<alloy.field.gamma>' },
      //       {
      //         uiType: 'container',
      //         components: [
      //           { uiType: 'placeholder', owner: 'form', name: '<alloy.field.delta>' },
      //           { uiType: 'placeholder', owner: 'form', name: '<alloy.field.epsilon>' }
      //         ]
      //       },
      //       { uiType: 'placeholder', owner: 'form', name: '<alloy.field.rho>' }

      //     ],

      //     keying: {
      //       mode: 'cyclic'
      //     }
      //   }
      // );

      // Representing.setValue(form, {
      //   alpha: 'doggy',
      //   beta: 'bottle',
      //   gamma: 'cad'
      // });

      var expform = HtmlDisplay.section(
        gui,
        'This form expands',
        {
          uiType: 'expandable-form',
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
            closedStyle: 'demo-sliding-closed',
            openStyle: 'demo-sliding-open',
            shrinkingStyle: 'demo-sliding-height-shrinking',
            growingStyle: 'demo-sliding-height-growing'
          },
          parts: Merger.deepMerge(
            fieldParts,
            {
              'minimal-form': {
                uiType: 'container',
                dom: {
                  classes: [ 'form-section' ]
                },
                components: [
                  { uiType: 'placeholder', owner: 'form', name: '<alloy.field.omega>' },
                  { uiType: 'placeholder', owner: 'form', name: '<alloy.field.alpha>' },
                  { uiType: 'placeholder', owner: 'form', name: '<alloy.field.theta>' }
                ]
              },
              'extra-form': {
                uiType: 'container',
                dom: {
                  classes: [ 'form-section' ]
                },
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
                uiType: 'container',
                tabstopping: true,
                keying: {
                  mode: 'flow',
                  selector: 'button'
                },
                components: [
                  { uiType: 'button', dom: { tag: 'button', innerHtml: 'OK' } }
                ]
              }
            }
          ),

          components: [
            { uiType: 'placeholder', name: '<alloy.expandable-form.minimal-form>', owner: 'expandable-form' },
            { uiType: 'placeholder', name: '<alloy.expandable-form.extra-form>', owner: 'expandable-form' },
            { uiType: 'placeholder', name: '<alloy.expandable-form.expander>', owner: 'expandable-form' },
            { uiType: 'placeholder', name: '<alloy.expandable-form.controls>', owner: 'expandable-form' }
          ],
          keying: {
            mode: 'cyclic',
            visibilitySelector: '.form-section'
          }
        }
      );

      setTimeout(function () {
        expform.apis().toggleForm();
      }, 1000);

      var slideform = HtmlDisplay.section(
        gui,
        'This is a sliding form',
        {
          uiType: 'slide-form',
          dom: {
            tag: 'div',
            classes: [ 'outside-slide-form' ]
          },
          members: {
            ui: {
              munge: function (spec) {
                return mungers[spec.type](spec);
              }
            }
          },
          parts: Merger.deepMerge(
            fieldParts,
            {
              left: {
                dom: { tag: 'button', innerHtml: '<' }
              },
              right: {
                dom: { tag: 'button', innerHtml: '>' }
              },
              tabbar: {
                dom: {
                  tag: 'span'
                },
                members: {
                  tab: {
                    munge: function (spec) {
                      return Merger.deepMerge(
                        spec,
                        {
                          dom: {
                            tag: 'span',
                            classes: [ 'dot' ]
                          }
                        }
                      );
                    }
                  }
                },
                markers: {
                  tabClass: 'dot',
                  selectedClass: 'selected-dot'
                },
                parts: {
                  tabs: { }
                },
                components: [
                  { uiType: 'placeholder', name: '<alloy.tabs>', owner: 'tabbar' }
                ]
              },
              tabview: {

              }
            }
          ),
          components: [
            { uiType: 'placeholder', name: '<alloy.tabview>', owner: 'tabbing' },
            {
              uiType: 'container',
              dom: { classes: [ 'dot-container' ] },
              components: [
                { uiType: 'placeholder', name: '<alloy.slide-form.left>', owner: 'slide-form' },
                { uiType: 'placeholder', name: '<alloy.tabbar>', owner: 'tabbing' },
                { uiType: 'placeholder', name: '<alloy.slide-form.right>', owner: 'slide-form' }
              ]
            }
          ],
          fields: fieldParts,
          fieldOrder: [
            // 'alpha',
            'beta',
            // 'gamma',
            'delta'
          ],
          keying: {
            mode: 'cyclic'
          }
        }
      );

      // Representing.setValue(slideform, {
      //   delta: 'dog'
      // });

      // window.SC = slideform;
    };
  }
);