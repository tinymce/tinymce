define(
  'ephox.alloy.demo.FormDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.highway.Merger',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, HtmlDisplay, Merger, Class, Element, Insert, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var mungers = {
        'text-input': function (spec) {
          return Merger.deepMerge(spec, {
            dom: {
              tag: 'div'
            },
            components: [
              { uiType: 'placeholder', name: '<alloy.form.field-label>', owner: 'formlabel' },
              { uiType: 'placeholder', name: '<alloy.form.field-input>', owner: 'formlabel' }
            ]
          });
        },
        'radio-group': function (spec) {
          return Merger.deepMerge(spec, {
            dom: {
              tag: 'fieldset'
            },
            label: 'Radio',
            parts: {
              legend: { },
              fields: { }
            },
            components: [
              { uiType: 'placeholder', name: '<alloy.form.radio-fields>', owner: 'radio-group' },
              { uiType: 'placeholder', name: '<alloy.form.field-legend>', owner: 'radio-group' }
            ]
          });
        }
      };

   
          


      var form = HtmlDisplay.section(
        gui,
        'This form has many fields',
        {
          uiType: 'form',
          dom: {
            tag: 'div',
            classes: [ 'outside-form' ]
          },
          members: {
            ui: {
              munge: function (spec) {
                return mungers[spec.type](spec);
              }
            }
          },
          parts: {
            alpha: { type: 'text-input', label: 'Alpha', inline: false },
            beta: { type: 'text-input', label: 'Beta' },
            gamma: {
              type: 'radio-group',
              name: 'gamma',
              candidates: [
                { value: 'abra', text: 'Abra' },
                { value: 'cad', text: 'Cad' },
                { value: 'abra!', text: 'abra!' }
              ]
            },
            delta: { type: 'text-input', label: 'Delta' },
            epsilon: { type: 'text-input', label: 'Epsilon' }
          },

          components: [
            { uiType: 'placeholder', owner: 'form', name: '<alloy.field.alpha>' },
            { uiType: 'placeholder', owner: 'form', name: '<alloy.field.beta>' },
            { uiType: 'placeholder', owner: 'form', name: '<alloy.field.gamma>' },
            {
              uiType: 'container',
              components: [
                { uiType: 'placeholder', owner: 'form', name: '<alloy.field.delta>' },
                { uiType: 'placeholder', owner: 'form', name: '<alloy.field.epsilon>' }
              ]
            }
          ],

          // uis: [
          //   { type: 'text-input', label: 'Alpha', name: 'alpha' },
          //   { type: 'text-input', label: 'Beta', inline: false, name: 'beta' },
            // {
            //   type: 'radio-group',
            //   name: 'gamma',
            //   candidates: [
            //     { value: 'abra', text: 'Abra' },
            //     { value: 'cad', text: 'Cad' },
            //     { value: 'abra!', text: 'abra!' }
            //   ]
            // },
            // {
            //   type: 'form-scaffold',
            //   dom: {
            //     tag: 'div',
            //     classes: [ 'scaffold' ]
            //   },
            //   parts: {
            //     field: {
            //       type: 'text-input',
            //       label: 'scaffold-a',
            //       name: 'scaffold-a'
            //     }
            //   },
            //   components: [
            //     { uiType: 'placeholder', name: '<alloy.form.element>', owner: 'form-scaffold' }
            //   ]
            // }
          // ],
          keying: {
            mode: 'cyclic'
          }
        }
      );

      form.apis().setValue({
        alpha: 'doggy',
        beta: 'bottle',
        gamma: 'cad'
      });
    };
  }
);