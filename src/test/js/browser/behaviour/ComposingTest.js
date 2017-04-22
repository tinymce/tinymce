asynctest(
  'Browser Test: behaviour.ComposingTest',

  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.test.GuiSetup',
    'ephox.katamari.api.Option'
  ],

  function (ApproxStructure, Assertions, Step, Behaviour, Composing, GuiFactory, Memento, GuiSetup, Option) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var inner = Memento.record({
      dom: { tag: 'span', innerHtml: 'inner' }
    });

    GuiSetup.setup(
      function (store, doc, body) {
        return GuiFactory.build({
          dom: {
            tag: 'div'
          },
          components: [
            inner.asSpec()
          ],
          behaviours: Behaviour.derive([
            Composing.config({
              find: function (comp) {
                return inner.getOpt(comp);
              }
            })
          ])
        });
      },
      function (doc, body, gui, component, store) {
        return [
          Assertions.sAssertStructure(
            'Checking initial structure',
            ApproxStructure.build(function (s, str, arr) {
              return s.element('div', {
                children: [
                  s.element('span', {
                    html: str.is('inner')
                  })
                ]
              });
            }),
            component.element()
          ),
          Step.sync(function () {
            var delegate = Composing.getCurrent(component).getOrDie('Could not find delegate');
            Assertions.assertStructure(
              'Checking delegate structure',
              ApproxStructure.build(function (s, str, arr) {
                return s.element('span', { html: str.is('inner') })
              }),
              delegate.element()
            );
          })
        ];
      },
      success,
      failure
    );
  }
);
