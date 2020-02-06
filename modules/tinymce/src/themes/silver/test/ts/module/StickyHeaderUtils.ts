import { ApproxStructure, Assertions, Chain, GeneralSteps, Guard, Keyboard, Keys, Logger, NamedChain, Step, StructAssert, UiFinder } from '@ephox/agar';
import { document, window } from '@ephox/dom-globals';
import { Body, Css, Element, Focus, Scroll, SelectorFind } from '@ephox/sugar';

const staticPartsOuter = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi): StructAssert[] => {
  // should not change
  return [
    s.element('div', {
      classes: [ arr.has('tox-sidebar-wrap') ]
    })
  ];
};

const staticPartsInner = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi): StructAssert[] => {
  // should not change
  return [
    s.element('div', {
      classes: [ arr.has('tox-menubar') ]
    }),
    s.element('div', {}),
    s.element('div', {
      classes: [ arr.has('tox-anchorbar') ]
    }),
  ];
};

const expectedScrollEventBound = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi): StructAssert[] => {
  return [
    s.element('div', {
      classes: [
        arr.has('tox-editor-header')
      ],
      children: staticPartsInner(s, str, arr)
    })
  ];
};

const sAssertHeaderDocked = (assertDockedTop: boolean) => Chain.asStep(Body.body(), [
  UiFinder.cFindIn('.tox-editor-header'),
  Chain.control(
    Assertions.cAssertStructure(
      `Header should be docked to ${assertDockedTop ? 'top' : 'bottom'}`,
      ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          styles: {
            position: str.is('fixed'),
            ...assertDockedTop ?
              { top: str.is('0px') } :
              { bottom: str.is('0px') }
          }
        });
      })
    ),
    Guard.tryUntil('Wait for header structure')
  )
]);

const expectedHalfView = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi): StructAssert[] => {
  return [
    s.element('div', {
      classes: [
        arr.has('tox-editor-header'),
        arr.not('tox-editor-dock-fadeout'),
      ],
      styles: {
        position: str.contains('fixed'),
        width: str.is('398px') // 400px - 1px for each border
        // testing left value maybe flaky
      },
      children: staticPartsInner(s, str, arr)
    })
  ];
};

const expectedEditorHidden = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi): StructAssert[] => {
  return [
    s.element('div', {
      classes: [
        arr.has('tox-editor-header'),
        arr.has('tox-editor-dock-fadeout'),
        arr.not('tox-editor-dock-fadein'),
      ],
      styles: {
        position: str.contains('fixed'),
        width: str.is('398px') // 400px - 1px for each border
        // testing left value maybe flaky
      },
      children: staticPartsInner(s, str, arr)
    })
  ];
};

const expectedInFullView = (s, str, arr): StructAssert[] => {
  return [
    s.element('div', {
      classes: [
        arr.has('tox-editor-header'),
        arr.not('tox-editor-dock-fadeout')
      ],
      styles: {
        position: str.none(),
        width: str.none()
      },
      children: staticPartsInner(s, str, arr)
    })
  ];
};

const cScrollRelativeEditor = (delta: number, scrollRelativeTop: boolean) => Chain.op(() => {
  const editorContainer = SelectorFind.descendant(Body.body(), '.tox-tinymce').getOrDie();
  editorContainer.dom().scrollIntoView(scrollRelativeTop);
  Scroll.to(0, window.pageYOffset + (scrollRelativeTop ? delta : -delta));
});

const cAssertSinkVisibility = (label: string, visibility: 'hidden' | 'visible') => NamedChain.asChain([
  NamedChain.writeValue('body', Body.body()),
  NamedChain.direct('body', UiFinder.cFindIn( '.tox-tinymce-aux'), 'sink'),
  NamedChain.direct('sink', Chain.control(
      Chain.fromChains([
        Chain.mapper((sink) =>  Css.get(sink, 'visibility')),
        Assertions.cAssertEq(label, visibility)
      ]),
      Guard.tryUntil(`Wait for sink visibility to be ${visibility}`)
    ), '_'),
  NamedChain.outputInput
]);

const cAssertMenuStructure = (label: string, position: string) => {
  return Chain.control(
    Assertions.cAssertStructure(
      label,
      ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('tox-menu') ],
          styles: {
            position: str.is(position)
          }
        });
      })
    ),
    Guard.tryUntil(`Wait until menus become ${position} positioned`)
  );
};

// Assume editor height 400
const sTestMenuScroll = (top: boolean) => Chain.asStep(Body.body(), [
  UiFinder.cFindIn('[role="menu"]'),
  cAssertMenuStructure('Checking the opened menus default positioning', 'absolute'),
  cScrollRelativeEditor(200, top),
  cAssertMenuStructure('When the top of the editor scrolls off screen, menus should become sticky', 'fixed'),
  cScrollRelativeEditor(500, top),
  cAssertSinkVisibility('When the editor is scrolled off the screen, sticky menus and toolbars should become HIDDEN', 'hidden'),
  cScrollRelativeEditor(200, top),
  cAssertSinkVisibility('When the editor is partially scrolled on screen, sticky menus and toolbars should become VISIBLE', 'visible'),
  cAssertMenuStructure('When the editor is partially viewable, it should still be sticky', 'fixed'),
  cScrollRelativeEditor(-100, top),
  cAssertMenuStructure('When the editor is in full view, menus and toolbars should not be sticky', 'absolute')
]);

const sAssertEditorContainer = (isToolbarTop: boolean, expectedPart: (s, str, arr) => StructAssert[]) => Chain.asStep(Body.body(), [
  UiFinder.cFindIn('.tox-editor-container'),
  Chain.control(
    Assertions.cAssertStructure(
      `for the .tox-editor-container`,
      ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('tox-editor-container') ],
          children: isToolbarTop ?
            expectedPart(s, str, arr).concat(staticPartsOuter(s, str, arr)) :
            staticPartsOuter(s, str, arr).concat(expectedPart(s, str, arr))
        });
      })
    ),
    Guard.tryUntil('Wait for editor structure')
  )
]);

const sScrollAndAssertStructure = (isToolbarTop: boolean, scrollY: number, expectedPart: (s, str, arr) => StructAssert[]) => Chain.asStep(Body.body(), [
  cScrollRelativeEditor(scrollY, isToolbarTop),
  UiFinder.cFindIn('.tox-editor-container'),
  Chain.control(
    Assertions.cAssertStructure(
      `for the .tox-editor-container`,
      ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('tox-editor-container') ],
          children: isToolbarTop ?
            expectedPart(s, str, arr).concat(staticPartsOuter(s, str, arr)) :
            staticPartsOuter(s, str, arr).concat(expectedPart(s, str, arr))
        });
      })
    ),
    Guard.tryUntil('Wait until editor docking updated')
  )
]);

const sAssertEditorClasses = (docked: boolean) => Chain.asStep(Body.body(), [
  UiFinder.cFindIn('.tox-tinymce'),
  Assertions.cAssertStructure('Check root container classes', ApproxStructure.build((s, str, arr) => {
    return s.element('div', {
      classes: [
        arr.has('tox-tinymce--toolbar-sticky-' + (docked ? 'on' : 'off')),
        arr.not('tox-tinymce--toolbar-sticky-' + (docked ? 'off' : 'on'))
      ]
    });
  }))
]);

const sCloseMenus = (numOpenedMenus: number) => Logger.t('Close all opened menus', GeneralSteps.sequenceRepeat(
  numOpenedMenus,
  Chain.asStep(Body.body(), [
    UiFinder.cWaitForVisible('Wait for selected menu to be visible', '.tox-selected-menu'),
    Chain.control(
      Chain.op((menuElem) => Assertions.assertEq('Assert menu item is focused', true, Focus.search(menuElem).isSome())),
      Guard.tryUntil('Wait for menu item to be focused')
    ),
    Chain.op(() => {
      const focusedElem = Focus.active(Element.fromDom(document)).getOrDie('Could not find active menu item');
      Keyboard.keydown(Keys.escape(), { }, focusedElem);
    }),
    Chain.control(
      Chain.op((menuElem) => Assertions.assertEq('Assert menu has been closed', false, Body.inBody(menuElem))),
      Guard.tryUntil('Wait for menu to be closed')
    )
  ])
));

const sOpenMenuAndTestScrolling = (sOpenMenu: Step<any, any>, numMenusToClose: number, top: boolean) => {
  return Logger.t('Begin opening the menu ', GeneralSteps.sequence([
    sOpenMenu,
    sTestMenuScroll(top),
    sCloseMenus(numMenusToClose)
  ]));
};

export {
  expectedHalfView,
  expectedInFullView,
  expectedEditorHidden,
  expectedScrollEventBound,

  sAssertEditorContainer,
  sOpenMenuAndTestScrolling,
  sScrollAndAssertStructure,
  sAssertHeaderDocked,
  sAssertEditorClasses
};
