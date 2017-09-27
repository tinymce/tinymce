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
    'ephox.alloy.demo.DemoDataset',
    'ephox.alloy.demo.DemoSink',
    'ephox.alloy.demo.forms.DemoFields',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'global!console',
    'global!document',
    'global!setTimeout'
  ],

  function (
    Behaviour, Keying, Representing, Tabstopping, Attachment, Gui, Button, Container, ExpandableForm, Form, DemoDataset, DemoSink, DemoFields, HtmlDisplay, Obj,
    Result, Element, Class, console, document, setTimeout
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

      var alphaSpec = { label: 'Alpha', inline: false };
      var betaSpec = { label: 'Beta', inline: false };
      var gammaSpec = { label: 'Gamma', inline: true };
      var deltaSpec = { label: 'Delta', inline: false };
      var epsilonSpec = { label: 'Epsilon' };


      var thetaSpec = {
        label: 'AA',
        options: [
          { value: 'a.a', text: 'A.A' },
          { value: 'b.b', text: 'B.B' },
          { value: 'c.c', text: 'C.C' },
          { value: 'd.d', text: 'D.D' }
        ]
      };

      var rhoSpec = {
        legend: 'Rho',
        choices: [
          { value: 'left', text: 'Left' },
          { value: 'middle', text: 'Middle' },
          { value: 'right', text: 'Right' }
        ]
      };

      var omegaSpec = {
        field1: { label: 'omega-1', inline: false },
        field2: { label: 'omega-2', inline: false }
      };

      var maxiSpec = {
        label: 'Maxis',
        dataset: DemoDataset,
        lazySink: lazySink
      };

      var form = HtmlDisplay.section(
        gui,
        'This form has many fields',
        Form.sketch(function (parts) {
          return {
            dom: {
              tag: 'div',
              classes: [ 'outside-form' ]
            },

            components: [
              parts.field('alpha', DemoFields.textMunger(alphaSpec)),
              parts.field('beta', DemoFields.textMunger(betaSpec)),
              Container.sketch({
                dom: {
                  styles: {
                    border: '1px solid green'
                  }
                },
                components: [
                  parts.field('gamma', DemoFields.textMunger(gammaSpec))
                ]
              }),

              parts.field('delta', DemoFields.textMunger(deltaSpec)),
              parts.field('epsilon', DemoFields.textMunger(epsilonSpec)),
              parts.field('theta', DemoFields.selectMunger(thetaSpec)),
              parts.field('rho', DemoFields.chooserMunger(rhoSpec)),
              parts.field('omega', DemoFields.coupledTextMunger(omegaSpec)),
              parts.field('maxis', DemoFields.typeaheadMunger(maxiSpec)),

              Button.sketch({
                dom: {
                  tag: 'button',
                  innerHtml: 'OK'
                },
                action: function (button) {
                  console.log('Form values', Obj.map(
                    Representing.getValue(form),
                    function (v) {
                      return v.getOr('Not found');
                    }
                  ));
                }
              })
            ],

            formBehaviours: Behaviour.derive([
              Keying.config({
                mode: 'cyclic'
              })
            ])
          };
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

          components: [
            ExpandableForm.parts().minimal(
              Form.sketch(function (parts) {
                return {
                  dom: {
                    tag: 'div',
                    classes: [ 'form-section' ]
                  },

                  components: [
                    parts.field('omega', DemoFields.coupledTextMunger(omegaSpec)),
                    parts.field('alpha', DemoFields.textMunger(alphaSpec)),
                    parts.field('beta', DemoFields.textMunger(betaSpec)),
                  ]
                };
              })
            ),

            ExpandableForm.parts().extra(
              Form.sketch(function (parts) {
                return {
                  dom: {
                    tag: 'div',
                    classes: [ 'form-section' ]
                  },
                  components: [
                    parts.field('beta', DemoFields.textMunger(betaSpec)),
                    Container.sketch({
                      dom: {
                        styles: {
                          border: '1px solid green'
                        }
                      },
                      components: [
                        parts.field('gamma', DemoFields.textMunger(gammaSpec))
                      ]
                    }),
                    parts.field('delta', DemoFields.textMunger(deltaSpec)),
                    parts.field('epsilon', DemoFields.textMunger(epsilonSpec)),
                    parts.field('rho', DemoFields.chooserMunger(rhoSpec))    
                  ]
                };
              })
            ),
            ExpandableForm.parts().expander({
              dom: {
                tag: 'button',
                innerHtml: 'v'
              },
              buttonBehaviours: Behaviour.derive([
                Tabstopping.config({ })
              ])
            }),
            ExpandableForm.parts().controls({
              dom: {
                tag: 'div'
              },
              behaviours: Behaviour.derive([
                Tabstopping.config({ }),
                Keying.config({
                  mode: 'flow',
                  selector: 'button'
                })
              ]),
              components: [
                Button.sketch(
                  {
                    dom: { tag: 'button', innerHtml: 'OK' },
                    action: function (button) {
                      console.log('Exp Form values', Obj.map(
                        Representing.getValue(expform),
                        function (v) {
                          return v.getOr('Not found');
                        }
                      ));
                    }
                  }
                )
              ]
            })
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

        Representing.setValue(form, {
          alpha: 'hi'
        });

        console.log('form', Obj.map(Representing.getValue(form), function (v) { return v.getOrDie(); }));

        console.log('expform', Obj.map(Representing.getValue(expform), function (v) { return v.getOrDie(); }));

        Representing.setValue(expform, {
          'omega': 'hi'
        });

        Representing.getValue(expform);

      }, 100);
    };
  }
);