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
            tag: 'div'
          },
          components: [ ],
          members: {
            ui: {
              munge: function (spec) {
                return mungers[spec.type](spec);
              }
            }
          },
          uis: [
            { type: 'text-input', label: 'Alpha', name: 'alpha' },
            { type: 'text-input', label: 'Beta', inline: false, name: 'beta' },
            {
              type: 'radio-group',
              name: 'gamma',
              candidates: [
                { value: 'abra', text: 'Abra' },
                { value: 'cad', text: 'Cad' },
                { value: 'abra!', text: 'abra!' }
              ]
            }
          ],
          keying: {
            mode: 'cyclic'
          }
        }
      );

      form.apis().setValue({
        alpha: 'doggy',
        beta: 'bottle',
        gamma: 'cad'
      })
    };
  }
);