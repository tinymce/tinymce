import { FocusTools, GeneralSteps, Keyboard, Keys, Logger, Mouse, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Future, Obj, Result, Option } from '@ephox/katamari';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import { Container } from 'ephox/alloy/api/ui/Container';
import { Dropdown } from 'ephox/alloy/api/ui/Dropdown';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as NavigationUtils from 'ephox/alloy/test/NavigationUtils';

UnitTest.asynctest('DropdownMenuTest', (success, failure) => {

  const sink = Memento.record(
    Container.sketch({
      containerBehaviours: Behaviour.derive([
        Positioning.config({
          useFixed: true
        })
      ])
    })
  );

  GuiSetup.setup((store, doc, body) => {
    const makeFlow = (v) => {
      return Container.sketch({
        dom: {
          tag: 'span',
          innerHtml: ' ' + v + ' ',
          classes: [ v ]
        },
        containerBehaviours: Behaviour.derive([
          Focusing.config({ })
        ])
      });
    };

    const widget = Container.sketch({
      containerBehaviours: Behaviour.derive([
        Keying.config({
          mode: 'flow',
          selector: 'span'
        })
      ]),
      components: Arr.map([
        'one',
        'two',
        'three'
      ], makeFlow)
    });

    const testData = {
      primary: 'tools-menu',
      menus: Obj.map({
        'tools-menu': {
          value: 'tools-menu-value',
          text: 'Tools Menu',
          items: Arr.map([
            { type: 'item', data: { value: 'packages', meta: { text: 'Packages' } }, hasSubmenu: true },
            { type: 'item', data: { value: 'about', meta: { text: 'About' } } },
            { type: 'widget', widget, data: { value: 'widget', meta: { } } }
          ], TestDropdownMenu.renderItem)
        },
        'packages': { // menu name should be triggering parent item so TieredMenuSpec path works
          value: 'packages-menu-value',
          text: 'Packages Menu',
          items: Arr.map([
            { type: 'item', data: { value: 'sortby', meta: { text: 'SortBy' } }, hasSubmenu: true }
          ], TestDropdownMenu.renderItem)
        },
        'sortby': {
          value: 'sortby-menu-value',
          text: 'Sortby Menu',
          items: Arr.map([
            { type: 'item', data: { value: 'strings', meta: { text: 'Strings' } }, hasSubmenu: true },
            { type: 'item', data: { value: 'numbers', meta: { text: 'Numbers' } }, hasSubmenu: true }
          ], TestDropdownMenu.renderItem)
        },
        'strings': {
          value: 'strings-menu-value',
          text: 'Strings Menu',
          items: Arr.map([
            { type: 'item', data: { value: 'versions', meta: { text: 'Versions', html: '<b>V</b>ersions' } } },
            { type: 'item', data: { value: 'alphabetic', meta: { text: 'Alphabetic' } } }
          ], TestDropdownMenu.renderItem)
        },
        'numbers': {
          value: 'numbers-menu-value',
          text: 'Numbers Menu',
          items: Arr.map([
            { type: 'item', data: { value: 'doubled', meta: { text: 'Doubled digits' } }, hasSubmenu: false }
          ], TestDropdownMenu.renderItem)
        }
      }, TestDropdownMenu.renderMenu),
      expansions: {
        packages: 'packages',
        sortby: 'sortby',
        strings: 'strings',
        numbers: 'numbers'
      }
    };

    const c = GuiFactory.build(
      Dropdown.sketch({
        uid: 'test-dropdown',
        dom: {
          tag: 'div',
          innerHtml: '+',
          classes: [ 'dropdown-button' ]
        },

        toggleClass: 'alloy-selected',

        components: [ ],

        lazySink (c) {
          TestDropdownMenu.assertLazySinkArgs('div', 'dropdown-button', c);
          return Result.value(sink.get(c));
        },

        parts: {
          menu: TestDropdownMenu.part(store)
        },

        fetch () {
          return Future.pure(testData).map((d) => {
            return Option.from(TieredMenu.tieredData(d.primary, d.menus, d.expansions));
          });
        }
      })
    );

    return c;

  }, (doc, body, gui, dropdown, store) => {
    gui.add(
      GuiFactory.build(sink.asSpec())
    );

    const focusables = {
      toolsMenu: { label: 'tools-menu', selector: '.menu[aria-label="Tools Menu"]' },
      packagesMenu: { label: 'packages-menu', selector: '.menu[aria-label="Packages Menu"]' },
      sortbyMenu: { label: 'sortby-menu', selector: '.menu[aria-label="Sortby Menu"]' },
      stringsMenu: { label: 'strings-menu', selector: '.menu[aria-label="Strings Menu"]' },
      numbersMenu: { label: 'numbers-menu', selector: '.menu[aria-label="Numbers Menu"]' },

      button: { label: 'dropdown-button', selector: '.dropdown-button' },

      packages: { label: 'packages-item', selector: 'li:contains("Packages")' },
      about: { label: 'about-item', selector: 'li:contains("About")' },
      sortby: { label: 'sortby-item', selector: 'li:contains("SortBy")' },
      strings: { label: 'strings-item', selector: 'li:contains("Strings")' },
      numbers: { label: 'numbers-item', selector: 'li:contains("Numbers")' },
      doubled: { label: 'doubled-item', selector: 'li:contains("Doubled")' },
      versions: { label: 'versions-item', selector: 'li:contains("Versions")' },

      widget: { label: 'widget-item', selector: '.item-widget' },
      widgetOne: { label: 'widget-item:1', selector: '.item-widget .one' },
      widgetTwo: { label: 'widget-item:2', selector: '.item-widget .two' },
      widgetThree: { label: 'widget-item:3', selector: '.item-widget .three' }
    };

    const sTestMenus = (label, stored, focused, active, background, others) => {
      const sCheckBackground = GeneralSteps.sequence(
        Arr.bind(background, (bg) => {
          return [
            UiFinder.sExists(gui.element(), bg.selector),
            UiFinder.sNotExists(gui.element(), bg.selector + '.selected-menu')
          ];
        })
      );

      const sCheckActive = GeneralSteps.sequence(
        Arr.map(active, (o) => {
          return UiFinder.sExists(gui.element(), o.selector + '.selected-menu');
        })
      );

      const sCheckOthers = GeneralSteps.sequence(
        Arr.map(others, (o) => {
          return UiFinder.sNotExists(gui.element(), o.selector);
        })
      );

      return Logger.t(
        label,
        GeneralSteps.sequence([
          store.sAssertEq('checking store', stored),
          FocusTools.sTryOnSelector('Searching for focus on: ' + focused.label, doc, focused.selector),
          sCheckActive,
          sCheckBackground,
          sCheckOthers,
          store.sClear,
          Step.wait(0)
        ])
      );
    };

    // A bit of dupe with DropdownButtonSpecTest
    return [
      Step.sync(() => {
        Focusing.focus(dropdown);
      }),

      sTestMenus(
        'Initially',
        [ ],
        focusables.button,
        [ ], [ ], [
          focusables.toolsMenu,
          focusables.packagesMenu,
          focusables.sortbyMenu,
          focusables.stringsMenu,
          focusables.numbersMenu
        ]
      ),
      Keyboard.sKeydown(doc, Keys.enter(), { }),

      Waiter.sTryUntil(
        'Wait until dropdown content loads',
        UiFinder.sExists(gui.element(), '.menu'),
        100,
        1000
      ),

      sTestMenus(
        'After open',
        [ ],
        focusables.packages,
        [ focusables.toolsMenu ], [ ], [
          focusables.packagesMenu,
          focusables.sortbyMenu,
          focusables.stringsMenu,
          focusables.numbersMenu
        ]
      ),

      // Press enter should expand
      Keyboard.sKeydown(doc, Keys.enter(), {}),
      sTestMenus(
        'After expand packages menu',
        [ ],
        focusables.sortby,
        [ focusables.packagesMenu ], [ focusables.toolsMenu ], [
          focusables.sortbyMenu,
          focusables.stringsMenu,
          focusables.numbersMenu
        ]
      ),

      // Press left should collapse
      Keyboard.sKeydown(doc, Keys.left(), {}),
      sTestMenus(
        'After collapse packages menu',
        [ ],
        focusables.packages,
        [ focusables.toolsMenu ], [ ], [
          focusables.packagesMenu,
          focusables.sortbyMenu,
          focusables.stringsMenu,
          focusables.numbersMenu
        ]
      ),

      // Press right should expand again
      Keyboard.sKeydown(doc, Keys.right(), {}),
      sTestMenus(
        'After expanding packages menu with right arrow',
        [ ],
        focusables.sortby,
        [ focusables.packagesMenu ], [ focusables.toolsMenu ], [
          focusables.sortbyMenu,
          focusables.stringsMenu,
          focusables.numbersMenu
        ]
      ),

      // Press space should expand again
      Keyboard.sKeydown(doc, Keys.space(), {}),
      sTestMenus(
        'After expanding sortby menu with space arrow',
        [ ],
        focusables.strings,
        [ focusables.sortbyMenu ], [ focusables.toolsMenu, focusables.packagesMenu ], [
          focusables.stringsMenu,
          focusables.numbersMenu
        ]
      ),

      // Pressing down should focus on numbers
      Keyboard.sKeydown(doc, Keys.down(), { }),
      sTestMenus(
        'After pressing down in sortby menu',
        [ ],
        focusables.numbers,
        [ focusables.sortbyMenu ], [ focusables.toolsMenu, focusables.packagesMenu ], [
          focusables.stringsMenu,
          focusables.numbersMenu
        ]
      ),

      // Pressing escape should focus sortby
      Keyboard.sKeydown(doc, Keys.escape(), { }),
      sTestMenus(
        'After pressing down in sortby menu',
        [ ],
        focusables.sortby,
        [ focusables.packagesMenu ], [ focusables.toolsMenu ], [
          focusables.sortbyMenu,
          focusables.stringsMenu,
          focusables.numbersMenu
        ]
      ),

      // Pressing right should open up sortby menu
      Keyboard.sKeydown(doc, Keys.right(), { }),
      sTestMenus(
        'After pressing right again after Escape',
        [ ],
        focusables.strings,
        [ focusables.sortbyMenu ], [ focusables.toolsMenu, focusables.packagesMenu ], [
          focusables.stringsMenu,
          focusables.numbersMenu
        ]
      ),

      // Pressing down, then enter should open up numbers menu
      Keyboard.sKeydown(doc, Keys.down(), { }),
      Keyboard.sKeydown(doc, Keys.enter(), { }),
      sTestMenus(
        'After pressing right again after Escape',
        [ ],
        focusables.doubled,
        [ focusables.numbersMenu ], [ focusables.sortbyMenu, focusables.toolsMenu, focusables.packagesMenu ], [
          focusables.stringsMenu
        ]
      ),

      // Pressing enter should trigger doubled
      Keyboard.sKeydown(doc, Keys.enter(), { }),
      sTestMenus(
        'After pressing enter on last level',
        [ 'dropdown.menu.execute: doubled' ],
        focusables.doubled,
        [ focusables.numbersMenu ], [ focusables.sortbyMenu, focusables.toolsMenu, focusables.packagesMenu ], [
          focusables.stringsMenu
        ]
      ),

      // Hover on "strings"
      Mouse.sHoverOn(gui.element(), focusables.strings.selector),
      sTestMenus(
        'After hovering on "strings" (should only expand)',
        [ ],
        focusables.strings,
        [ focusables.sortbyMenu ], [ focusables.toolsMenu, focusables.packagesMenu ], [
          focusables.numbersMenu
        ]
      ),

      // Click on "about"
      Mouse.sClickOn(gui.element(), focusables.about.selector),
      // Menus are somewhat irrelevant here, because the hover would have changed them,
      // not the click
      store.sAssertEq('Checking about fired', [ 'dropdown.menu.execute: about' ]),
      store.sClear,

      // Hover on "about"
      Mouse.sHoverOn(gui.element(), focusables.about.selector),
      sTestMenus(
        'After hovering on "strings"',
        [ ],
        focusables.about,
        [ focusables.toolsMenu ], [ ], [
          focusables.packagesMenu,
          focusables.sortbyMenu,
          focusables.stringsMenu,
          focusables.numbersMenu
        ]
      ),

      // Pressing right on "about" does nothing
      Keyboard.sKeydown(doc, Keys.right(), { }),
      sTestMenus(
        'Pressing <right> on "about" does nothing',
        [ ],
        focusables.about,
        [ focusables.toolsMenu ], [ ], [
          focusables.packagesMenu,
          focusables.sortbyMenu,
          focusables.stringsMenu,
          focusables.numbersMenu
        ]
      ),

      // Now, let's play with the inline widget
      Keyboard.sKeydown(doc, Keys.tab(), { }),
      sTestMenus(
        'After pressing <tab> from about',
        [ ],
        focusables.widget,
        [ focusables.toolsMenu ], [ ], [
          focusables.packagesMenu,
          focusables.sortbyMenu,
          focusables.stringsMenu,
          focusables.numbersMenu
        ]
      ),

      // Press enter to go into the inline widget
      Keyboard.sKeydown(doc, Keys.enter(), { }),
      sTestMenus(
        'After pressing <enter> on inline widget',
        [ ],
        focusables.widgetOne,
        [ focusables.toolsMenu ], [ ], [
          focusables.packagesMenu,
          focusables.sortbyMenu,
          focusables.stringsMenu,
          focusables.numbersMenu
        ]
      ),

      NavigationUtils.sequence(
        doc, Keys.right(), {}, [
          focusables.widgetTwo,
          focusables.widgetThree,
          focusables.widgetOne
        ]
      ),

      // Press escape to exit the inline widget
      Keyboard.sKeydown(doc, Keys.escape(), { }),
      sTestMenus(
        'After pressing <escape> inside inline widget',
        [ ],
        focusables.widget,
        [ focusables.toolsMenu ], [ ], [
          focusables.packagesMenu,
          focusables.sortbyMenu,
          focusables.stringsMenu,
          focusables.numbersMenu
        ]
      )
    ];
  }, () => { success(); }, failure);
});
