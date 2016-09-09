asynctest(
  'DropdownMenuSpecTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.NavigationUtils',
    'ephox.alloy.test.Sinks',
    'ephox.compass.Arr',
    'ephox.knoch.future.Future'
  ],
 
  function (Assertions, FocusTools, GeneralSteps, Keyboard, Keys, Logger, Mouse, Step, UiFinder, Waiter, GuiFactory, GuiSetup, NavigationUtils, Sinks, Arr, Future) {
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
            { type: 'widget', spec: widget, value: 'widget' }
          ],
          'packages-menu': [
            { type: 'item', value: 'sortby', text: 'SortBy' }
          ],
          'sortby-menu': [
            { type: 'item', value: 'strings', text: 'Strings' },
            { type: 'item', value: 'numbers', text: 'Numbers' }
          ],
          'strings-menu': [
            { type: 'item', value: 'versions', text: 'Versions', html: '<b>V</b>ersions' },
            { type: 'item', value: 'alphabetic', text: 'Alphabetic' }
          ],
          'numbers-menu': [
            { type: 'item', value: 'doubled', text: 'Doubled digits' }
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
        about: { label: 'about-item', selector: '[data-alloy-item-value="about"]' },
        sortby: { label: 'sortby-item', selector: '[data-alloy-item-value="sortby"]' },
        strings: { label: 'strings-item', selector: '[data-alloy-item-value="strings"]' },
        numbers: { label: 'numbers-item', selector: '[data-alloy-item-value="numbers"]' },
        doubled: { label: 'doubled-item', selector: '[data-alloy-item-value="doubled"]' },
        versions: { label: 'versions-item', selector: '[data-alloy-item-value="versions"]' },
        widget: { label: 'widget-item', selector: '[data-alloy-item-value="widget"]' },
        widgetOne: { label: 'widget-item:1', selector: '[data-alloy-item-value="widget"] .one' },
        widgetTwo: { label: 'widget-item:2', selector: '[data-alloy-item-value="widget"] .two' },
        widgetThree: { label: 'widget-item:3', selector: '[data-alloy-item-value="widget"] .three' }
      };

      var sTestMenus = function (label, stored, focused, active, background, others) {
        var sCheckBackground = GeneralSteps.sequence(
          Arr.bind(background, function (bg) {
            return [
              UiFinder.sExists(gui.element(), bg.selector),
              UiFinder.sNotExists(gui.element(), bg.selector + '.alloy-selected-menu')
            ];
          })
        );

        var sCheckActive = GeneralSteps.sequence(
          Arr.map(active, function (o) {
            return UiFinder.sExists(gui.element(), o.selector + '.alloy-selected-menu');
          })
        );

        var sCheckOthers = GeneralSteps.sequence(
          Arr.map(others, function (o) {
            return UiFinder.sNotExists(gui.element(), o.selector);
          })
        );

        return Logger.t(
          label, 
          GeneralSteps.sequence([
            Step.sync(function () {
              Assertions.assertEq('Checking all menus are considered', 5, active.concat(background).concat(others).length);
            }),
            store.sAssertEq('checking store', stored),
            FocusTools.sTryOnSelector('Searching for focus on: ' + focused.label, doc, focused.selector),
            sCheckActive,
            sCheckBackground,
            sCheckOthers,
            store.sClear
          ])
        );
      };

      // A bit of dupe with DropdownButtonSpecTest
      return [
        Step.sync(function () {
          dropdown.apis().focus();
        }),

        sTestMenus(
          'Initially',
          [ ],
          components.button,
          [ ], [ ], [ 
            components.toolsMenu,
            components.packagesMenu,
            components.sortbyMenu,
            components.stringsMenu,
            components.numbersMenu
          ]
        ),
        Keyboard.sKeydown(doc, Keys.enter(), { }),

        Waiter.sTryUntil(
          'Wait until dropdown content loads',
          UiFinder.sExists(gui.element(), '[data-alloy-item-value]'),
          100,
          1000
        ),

        sTestMenus(
          'After open',
          [ ],
          components.packages,
          [ components.toolsMenu ], [ ], [ 
            components.packagesMenu,
            components.sortbyMenu,
            components.stringsMenu,
            components.numbersMenu
          ]
        ),

        // Press enter should expand
        Keyboard.sKeydown(doc, Keys.enter(), {}),
        sTestMenus(
          'After expand packages menu',
          [ ],
          components.sortby,
          [ components.packagesMenu ], [ components.toolsMenu ], [ 
            components.sortbyMenu,
            components.stringsMenu,
            components.numbersMenu
          ]
        ),

        // Press left should collapse
        Keyboard.sKeydown(doc, Keys.left(), {}),
        sTestMenus(
          'After collapse packages menu',
          [ ],
          components.packages,
          [ components.toolsMenu ], [ ], [
            components.packagesMenu,
            components.sortbyMenu,
            components.stringsMenu,
            components.numbersMenu
          ]
        ),

        // Press right should expand again
        Keyboard.sKeydown(doc, Keys.right(), {}),
        sTestMenus(
          'After expanding packages menu with right arrow',
          [ ],
          components.sortby,
          [ components.packagesMenu ], [ components.toolsMenu ], [ 
            components.sortbyMenu,
            components.stringsMenu,
            components.numbersMenu
          ]
        ),

        // Press space should expand again
        Keyboard.sKeydown(doc, Keys.space(), {}),
        sTestMenus(
          'After expanding sortby menu with space arrow',
          [ ],
          components.strings,
          [ components.sortbyMenu ], [ components.toolsMenu, components.packagesMenu ], [ 
            components.stringsMenu,
            components.numbersMenu
          ]
        ),

        // Pressing down should focus on numbers
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sTestMenus(
          'After pressing down in sortby menu',
          [ ],
          components.numbers,
          [ components.sortbyMenu ], [ components.toolsMenu, components.packagesMenu ], [ 
            components.stringsMenu,
            components.numbersMenu
          ]
        ),

        // Pressing escape should focus sortby 
        Keyboard.sKeydown(doc, Keys.escape(), { }),
        sTestMenus(
          'After pressing down in sortby menu',
          [ ],
          components.sortby,
          [ components.packagesMenu ], [ components.toolsMenu ], [ 
            components.sortbyMenu,
            components.stringsMenu,
            components.numbersMenu
          ]
        ),
       
        // Pressing right should open up sortby menu
        Keyboard.sKeydown(doc, Keys.right(), { }),
        sTestMenus(
          'After pressing right again after Escape',
          [ ],
          components.strings,
          [ components.sortbyMenu ], [ components.toolsMenu, components.packagesMenu ], [ 
            components.stringsMenu,
            components.numbersMenu
          ]
        ),

        // Pressing down, then enter should open up numbers menu
        Keyboard.sKeydown(doc, Keys.down(), { }),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        sTestMenus(
          'After pressing right again after Escape',
          [ ],
          components.doubled,
          [ components.numbersMenu ], [ components.sortbyMenu, components.toolsMenu, components.packagesMenu ], [ 
            components.stringsMenu
          ]
        ),

        // Pressing enter should trigger doubled
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        sTestMenus(
          'After pressing enter on last level',
          [ 'doubled' ],
          components.doubled,
          [ components.numbersMenu ], [ components.sortbyMenu, components.toolsMenu, components.packagesMenu ], [ 
            components.stringsMenu
          ]
        ),

        // Hover on "strings"
        Mouse.sHoverOn(gui.element(), components.strings.selector),
        sTestMenus(
          'After hovering on "strings"',
          [ ],
          components.versions,
          [ components.stringsMenu ], [ components.sortbyMenu, components.toolsMenu, components.packagesMenu ], [ 
            components.numbersMenu
          ]
        ),

        // Click on "about"
        Mouse.sClickOn(gui.element(), components.about.selector),
        // Menus are somewhat irrelevant here, because the hover would have changed them,
        // not the click
        store.sAssertEq('Checking about fired', [ 'about' ]),
        store.sClear,

        // Hover on "about"
        Mouse.sHoverOn(gui.element(), components.about.selector),
        sTestMenus(
          'After hovering on "strings"',
          [ ],
          components.about,
          [ components.toolsMenu ], [ ], [
            components.packagesMenu,
            components.sortbyMenu,
            components.stringsMenu,
            components.numbersMenu
          ]
        ),

        // Now, let's play with the inline widget
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sTestMenus(
          'After pressing <down> from about',
          [ ],
          components.widget,
          [ components.toolsMenu ], [ ], [
            components.packagesMenu,
            components.sortbyMenu,
            components.stringsMenu,
            components.numbersMenu
          ]
        ),

        // Press enter to go into the inline widget
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        sTestMenus(
          'After pressing <enter> on inline widget',
          [ ],
          components.widgetOne,
          [ components.toolsMenu ], [ ], [
            components.packagesMenu,
            components.sortbyMenu,
            components.stringsMenu,
            components.numbersMenu
          ]
        ),

        NavigationUtils.sequence(
          doc, Keys.right(), {}, [
            components.widgetTwo,
            components.widgetThree,
            components.widgetOne
          ]
        ),

        // Press escape to exit the inline widget
        Keyboard.sKeydown(doc, Keys.escape(), { }),
        sTestMenus(
          'After pressing <escape> inside inline widget',
          [ ],
          components.widget,
          [ components.toolsMenu ], [ ], [
            components.packagesMenu,
            components.sortbyMenu,
            components.stringsMenu,
            components.numbersMenu
          ]
        )
      ];
    }, function () { success(); }, failure);

  }
);