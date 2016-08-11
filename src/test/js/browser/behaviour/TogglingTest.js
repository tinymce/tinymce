asynctest(
  'TogglingTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (ApproxStructure, Assertions, Logger, Step, GuiFactory, SystemEvents, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div',
          classes: [ 'custom-component-test'],
          styles: {
            background: 'blue',
            width: '200px',
            height: '200px'
          }
        },
        uid: 'custom-uid',
        toggling: {
          selected: true,
          toggleClass: 'test-selected'
        }
      });

    }, function (doc, body, gui, component, store) {

      var testIsSelected = function (label) {
        return Step.sync(function () {
          Assertions.assertStructure(
            'Asserting structure shows selected\n' + label,
            ApproxStructure.build(function (s, str, arr) {
              return s.element('div', {
                classes: [
                  arr.has('test-selected'),
                  arr.not('selected')
                ],
                attrs: {
                  'alloy-id': str.is('custom-uid'),
                  'aria-pressed': str.is('true'),
                  'aria-expanded': str.none()
                }
              });
            }),
            component.element()
          );
        });
      };

      var testNotSelected = function (label) {
        return Step.sync(function () {
          Assertions.assertStructure(
            'Asserting structure shows not selected\n' + label,
            ApproxStructure.build(function (s, str, arr) {
              return s.element('div', {
                classes: [
                  arr.not('test-selected'),
                  arr.not('selected')
                ],
                attrs: {
                  'alloy-id': str.is('custom-uid'),
                  'aria-pressed': str.is('false'),
                  'aria-expanded': str.none()
                }
              });
            }),
            component.element()
          );
        });
      };

      var assertIsSelected = function (label, expected) {
        return Logger.t(
          'Asserting isSelected()\n' + label,
          Step.sync(function () {
            var actual = component.apis().isSelected();
            Assertions.assertEq(label, expected, actual);
          })
        );
      };

      var sSelect = Step.sync(function () {
        component.apis().select();
      });

      var sDeselect = Step.sync(function () {
        component.apis().deselect();
      });

      var sToggle = Step.sync(function () {
        component.apis().toggle();
      });

      return [
        testIsSelected('Initial'),

        sToggle,
        testNotSelected('selected > toggle'),
        assertIsSelected('selected > toggle', false),

        sToggle,
        testIsSelected('selected > toggle, toggle'),
        assertIsSelected('selected > toggle, toggle', true),

        sDeselect,
        testNotSelected('selected > toggle, toggle, deselect'),
        assertIsSelected('selected > toggle, toggle, deselect', false),
        sDeselect,
        testNotSelected('selected > toggle, toggle, deselect, deselect'),
        assertIsSelected('selected > toggle, toggle, deslect, deselect', false),

        sSelect,
        testIsSelected('selected > toggle, toggle, deselect, deselect, select'),
        assertIsSelected('selected > toggle, toggle, deselect, deselect, select', true),
        sSelect,
        testIsSelected('selected > toggle, toggle, deselect, deselect, select, select'),
        assertIsSelected('selected > toggle, toggle, deselect, deselect, select, select', true),

        Step.sync(function () {
          component.getSystem().triggerEvent(
            SystemEvents.execute(),
            component.element(),
            { }
          );
        }),

        testNotSelected('selected > toggle, toggle, deselect, deselect, select, select, event.exec'),
        assertIsSelected('selected > toggle, toggle, deselect, deselect, select, select, event.exec', false)
      ];
    }, success, failure);
  }
);