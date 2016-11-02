define(
  'ephox.alloy.demo.FormDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, HtmlDisplay, Merger, Fun, Class, Element, Insert, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var textMunger = function (spec) {
        return Merger.deepMerge(spec, {
          dom: {
            tag: 'div'
          },
          components: [
            { uiType: 'placeholder', name: '<alloy.form.field-label>', owner: 'formlabel' },
            { uiType: 'placeholder', name: '<alloy.form.field-input>', owner: 'formlabel' }
          ]
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
        'radio-group': radioMunger,
        'custom-radio-group': customRadioMunger 
      };

      var fieldParts = {
        alpha: { type: 'text-input', label: 'Alpha', inline: false },
        beta: { type: 'text-input', label: 'Beta', inline: false },
        gamma: {
          type: 'radio-group',
          members: {
            radio: {
              munge: function (data) {
                return {
                  uiType: 'custom',
                  dom: {
                    tag: 'input',
                    attributes: {
                      type: 'radio',
                      value: data.value
                    }
                  },
                  label: 'Radio',
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

      // form.apis().setValue({
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
          parts: Merger.deepMerge(
            fieldParts,
            {
              'minimal-form': {
                uiType: 'container',
                components: [
                  { uiType: 'placeholder', owner: 'form', name: '<alloy.field.alpha>' }
                ]
              },
              'extra-form': {
                uiType: 'container',
                components: [
                  { uiType: 'placeholder', owner: 'form', name: '<alloy.field.beta>' },
                  { uiType: 'placeholder', owner: 'form', name: '<alloy.field.gamma>' },
                  { uiType: 'placeholder', owner: 'form', name: '<alloy.field.delta>' },
                  { uiType: 'placeholder', owner: 'form', name: '<alloy.field.epsilon>' },
                  { uiType: 'placeholder', owner: 'form', name: '<alloy.field.rho>' }
                ]
              },
              'expander': { uiType: 'container' },
              'controls': { uiType: 'container' }
            }
          ),

          components: [
            { uiType: 'placeholder', name: '<alloy.expandable-form.minimal-form>', owner: 'expandable-form' },
            { uiType: 'placeholder', name: '<alloy.expandable-form.extra-form>', owner: 'expandable-form' },
            { uiType: 'placeholder', name: '<alloy.expandable-form.expander>', owner: 'expandable-form' },
            { uiType: 'placeholder', name: '<alloy.expandable-form.controls>', owner: 'expandable-form' }
          ],
          keying: {
            mode: 'cyclic'
          }
        }
      );

      // var slideform = HtmlDisplay.section(
      //   gui,
      //   'This is a sliding form',
      //   {
      //     uiType: 'slide-form',
      //     dom: {
      //       tag: 'div',
      //       classes: [ 'outside-slide-form' ]
      //     },
      //     members: {
      //       ui: {
      //         munge: function (spec) {
      //           return mungers[spec.type](spec);
      //         }
      //       }
      //     },
      //     parts: Merger.deepMerge(
      //       fieldParts,
      //       {
      //         left: {
      //           dom: { tag: 'button', innerHtml: '<' }
      //         },
      //         right: {
      //           dom: { tag: 'button', innerHtml: '>' }
      //         },
      //         tabbar: {
      //           dom: {
      //             tag: 'span'
      //           },
      //           members: {
      //             tab: {
      //               munge: function (spec) {
      //                 return Merger.deepMerge(
      //                   spec,
      //                   {
      //                     dom: {
      //                       tag: 'span',
      //                       classes: [ 'dot' ]
      //                     }
      //                   }
      //                 );
      //               }
      //             }
      //           },
      //           markers: {
      //             tabClass: 'dot',
      //             selectedClass: 'selected-dot'
      //           },
      //           parts: {
      //             tabs: { }
      //           },
      //           components: [
      //             { uiType: 'placeholder', name: '<alloy.tabs>', owner: 'tabbar' }
      //           ]
      //         },
      //         tabview: {

      //         }
      //       }
      //     ),
      //     components: [
      //       { uiType: 'placeholder', name: '<alloy.tabview>', owner: 'tabbing' },
      //       {
      //         uiType: 'container',
      //         dom: { classes: [ 'dot-container' ] },
      //         components: [
      //           { uiType: 'placeholder', name: '<alloy.slide-form.left>', owner: 'slide-form' },
      //           { uiType: 'placeholder', name: '<alloy.tabbar>', owner: 'tabbing' },
      //           { uiType: 'placeholder', name: '<alloy.slide-form.right>', owner: 'slide-form' }
      //         ]
      //       }
      //     ],
      //     fields: fieldParts,
      //     fieldOrder: [
      //       // 'alpha',
      //       'beta',
      //       // 'gamma',
      //       'delta'
      //     ],
      //     keying: {
      //       mode: 'cyclic'
      //     }
      //   }
      // );

      // slideform.apis().setValue({
      //   delta: 'dog'
      // });

      // window.SC = slideform;
    };
  }
);