asynctest(
  'ReplacingTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.RawAssertions',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (ApproxStructure, Assertions, Keyboard, Keys, Logger, RawAssertions, Step, GuiFactory, Replacing, EventHandler, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'container',
        behaviours: {
          replacing: { }
        },
        components: [
          {
            uiType: 'container',
            dom: {
              tag: 'span'
            }
          }
        ]
      });
    }, function (doc, body, gui, component, store) {
      return [
        Assertions.sAssertStructure(
          'Initially, has a single span',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              children: [
                s.element('span', { })
              ]
            });
          }),
          component.element()
        ),

        Step.sync(function () {
          Replacing.set(component, [

          ]);
        }),

        Assertions.sAssertStructure(
          'After set([]), is empty',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              children: [ ]
            });
          }),
          component.element()
        ),
        Step.sync(function () {
          RawAssertions.assertEq('Should have no contents', [ ], Replacing.contents(component));
        }),

        Step.sync(function () {
          Replacing.set(component, [
            {
              uiType: 'container',
              uid: 'first'
            },
            {
              uiType: 'container',
              uid: 'second'
            }
          ]);
        }),

        Assertions.sAssertStructure(
          'After first time of replace([ first, second ])',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              children: [
                s.element('div', { }),
                s.element('div', { })
              ]
            });
          }),
          component.element()
        ),
        Step.sync(function () {
          RawAssertions.assertEq('Should have 2 children', 2, Replacing.contents(component).length);
        }),

        Logger.t(
          'Repeating adding the same uids to check clearing is working',          
          Step.sync(function () {
            Replacing.set(component, [
              {
                uiType: 'container',
                uid: 'first'
              },
              {
                uiType: 'container',
                uid: 'second'
              }
            ]);
          })
        ),
        Assertions.sAssertStructure(
          'After second time of set([ first, second ])',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              children: [
                s.element('div', { }),
                s.element('div', { })
              ]
            });
          }),
          component.element()
        ),
        Step.sync(function () {
          RawAssertions.assertEq('Should have 2 children still', 2, Replacing.contents(component).length);
        }),


        Logger.t(
          'Replacing.append to put a new thing at the end.',          
          Step.sync(function () {
            Replacing.append(component, {
              uiType: 'custom',
              dom: {
                tag: 'span'
              }
            });
          })
        ),
        Assertions.sAssertStructure(
          'After append(span)',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              children: [
                s.element('div', { }),
                s.element('div', { }),
                s.element('span', { })
              ]
            });
          }),
          component.element()
        ),
        Step.sync(function () {
          RawAssertions.assertEq('Should have 3 children now', 3, Replacing.contents(component).length);
        }),

        Logger.t(
          'Replacing.prepend to put a new thing at the start',
          Step.sync(function () {
            Replacing.prepend(component, {
              uiType: 'custom',
              dom: {
                tag: 'label'
              }
            });
          })
        ),

        Assertions.sAssertStructure(
          'After prepend(label)',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              children: [
                s.element('label', {}),
                s.element('div', { }),
                s.element('div', { }),
                s.element('span', { })
              ]
            });
          }),
          component.element()
        ),
        Step.sync(function () {
          RawAssertions.assertEq('Should have 4 children now', 4, Replacing.contents(component).length);
        })
      ];
    }, function () { success(); }, failure);

  }
);