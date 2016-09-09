asynctest(
  'DropdownMenuSpecTest',
 
  [
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.compass.Arr',
    'ephox.knoch.future.Future'
  ],
 
  function (FocusTools, Keyboard, Keys, Step, UiFinder, Waiter, GuiFactory, GuiSetup, Sinks, Arr, Future) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var sink = Sinks.relativeSink();

      var makeFlow = function (v) {
        return {
          uiType: 'custom',
          dom: {
            tag: 'span',
            innerHtml: ' ' + v + ' ',
            classes: [ v ]
          },
          focusing: true
        };
      };

      var widget = {
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        keying: {
          mode: 'flow',
          selector: 'span'
        },
        components: Arr.map([
          'one',
          'two',
          'three'
        ], makeFlow)
      };

      var testData = {
        primary: 'tools-menu',
        menus: {
          'tools-menu': [
            { type: 'item', value: 'packages', text: 'Packages' },
            { type: 'item', value: 'about', text: 'About' },
            { type: 'widget', spec: widget }
          ],
          'packages-menu': [
            { type: 'item', value: 'sortby', text: 'SortBy' }
          ],
          'sortby-menu': [
            { type: 'item', value: 'strings', text: 'Strings' },
            { type: 'item', value: 'numbers', text: 'Numbers' }
          ],
          'strings-menu': [
            { type: 'item', value: 'version', text: 'Versions', html: '<b>V</b>ersions' },
            { type: 'item', value: 'alphabetic', text: 'Alphabetic' }
          ],
          'numbers-menu': [
            { type: 'item', value: 'double', text: 'Double digits' }
          ]
        },
        expansions: {
          'packages': 'packages-menu',
          'sortby': 'sortby-menu',
          'strings': 'strings-menu',
          'numbers': 'numbers-menu' 
        }
      };


      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        }, 
        components: [
          { built: sink },
          {
            uiType: 'dropdownmenu',
            text: '+',
            uid: 'test-dropdown',
            fetch: function () {
              return Future.pure(testData);
            },
            onExecute: function (dropdown, item, itemValue) {
              return store.adder(itemValue)();
            },
            sink: sink,
            desc: 'demo-dropdownmenu'
          }
        ]
      });

    }, function (doc, body, gui, component, store) {
      var dropdown = component.getSystem().getByUid('test-dropdown').getOrDie();

      var components = {
        toolsMenu: { label: 'tools-menu', selector: '[data-alloy-menu-value="tools-menu"]' },
        packagesMenu: { label: 'packages-menu', selector: '[data-alloy-menu-value="packages-menu"]' },
        sortbyMenu: { label: 'sortby-menu', selector: '[data-alloy-menu-value="sortby-menu"]' },
        stringsMenu: { label: 'strings-menu', selector: '[data-alloy-menu-value="strings-menu"]' },
        numbersMenu: { label: 'numbers-menu', selector: '[data-alloy-menu-value="numbers-menu"]' },
        button: { label: 'dropdown-button', 'selector': 'button' },
        packages: { label: 'packages-item', selector: '[data-alloy-item-value="packages"]' },
        beta: { label: 'beta-item', selector: '[data-alloy-item-value="beta"]' },
        gamma: { label: 'gamma-item', selector: '[data-alloy-item-value="gamma"]' },
        delta: { label: 'delta-item', selector: '[data-alloy-item-value="delta"]' }
      };

      // A bit of dupe with DropdownButtonSpecTest
      return [
        Step.sync(function () {
          dropdown.apis().focus();
        }),
        UiFinder.sNotExists(gui.element(), '[data-alloy-item-value]'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),

        Waiter.sTryUntil(
          'Wait until dropdown content loads',
          UiFinder.sExists(gui.element(), '[data-alloy-item-value]'),
          100,
          1000
        ),

        UiFinder.sExists(gui.element(), components.toolsMenu.selector + '.alloy-selected-menu'),
        UiFinder.sExists(gui.element(), components.toolsMenu.selector),
        FocusTools.sTryOnSelector('focus should start on packages item', doc, components.packages.selector),

        // Press enter should expand
        Keyboard.sKeydown(doc, Keys.enter(), {}),
        UiFinder.sExists(gui.element(), components.packagesMenu.selector + '.alloy-selected-menu'),
        UiFinder.sExists(gui.element(), components.toolsMenu.selector),

        
        // Step.debugging,
        function () { }
      ];
    }, function () { success(); }, failure);

  }
);