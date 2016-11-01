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
        }
      };

   
      HtmlDisplay.section(
        gui,
        'This form has many fields',
        {
          uiType: 'form',
          dom: {
            tag: 'div'
          },
          components: [
            { uiType: 'placeholder', name: '<alloy.form.fields>', owner: 'form' }
          ],
          members: {
            ui: {
              munge: function (spec) {
                return mungers[spec.type](spec);
              }
            }
          },
          uis: [
            { type: 'text-input', label: 'Alpha' },
            { type: 'text-input', label: 'Beta' }
            // {
            //   type: 'radio-group'
            // }
          ],
          keying: {
            mode: 'cyclic'
          }
        }
      );
    };
  }
);