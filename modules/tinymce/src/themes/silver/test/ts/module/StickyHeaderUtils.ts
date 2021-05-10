import { ApproxStructure, Assertions, Keyboard, Keys, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { Arr, Fun } from '@ephox/katamari';
import { Css, Focus, Scroll, SugarBody, SugarDocument, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import PromisePolyfill from 'tinymce/core/api/util/Promise';
import { ToolbarLocation } from 'tinymce/themes/silver/api/Settings';

const staticPartsOuter = (s: ApproxStructure.StructApi, _str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi): StructAssert[] =>
  // should not change
  [
    s.element('div', {
      classes: [ arr.has('tox-sidebar-wrap') ]
    })
  ];

const staticPartsInner = (s: ApproxStructure.StructApi, _str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi): StructAssert[] =>
  // should not change
  [
    s.element('div', {
      classes: [ arr.has('tox-menubar') ]
    }),
    s.element('div', {}),
    s.element('div', {
      classes: [ arr.has('tox-anchorbar') ]
    })
  ];

const expectedScrollEventBound = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi): StructAssert[] => [
  s.element('div', {
    classes: [
      arr.has('tox-editor-header')
    ],
    children: staticPartsInner(s, str, arr)
  })
];

const pAssertHeaderDocked = async (assertDockedTop: boolean) => {
  const header = UiFinder.findIn(SugarBody.body(), '.tox-editor-header').getOrDie();
  await Waiter.pTryUntil(
    'Wait for header structure',
    () => Assertions.assertStructure(
      `Header should be docked to ${assertDockedTop ? 'top' : 'bottom'}`,
      ApproxStructure.build((s, str, _arr) => s.element('div', {
        styles: {
          position: str.is('fixed'),
          ...assertDockedTop ?
            { top: str.is('0px') } :
            { bottom: str.is('0px') }
        }
      })),
      header
    )
  );
};

const expectedHalfView = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi): StructAssert[] => [
  s.element('div', {
    classes: [
      arr.has('tox-editor-header'),
      arr.not('tox-editor-dock-fadeout')
    ],
    styles: {
      position: str.contains('fixed'),
      width: str.is('398px') // 400px - 1px for each border
      // testing left value maybe flaky
    },
    children: staticPartsInner(s, str, arr)
  })
];

const expectedEditorHidden = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi): StructAssert[] => [
  s.element('div', {
    classes: [
      arr.has('tox-editor-header'),
      arr.has('tox-editor-dock-fadeout'),
      arr.not('tox-editor-dock-fadein')
    ],
    styles: {
      position: str.contains('fixed'),
      width: str.is('398px') // 400px - 1px for each border
      // testing left value maybe flaky
    },
    children: staticPartsInner(s, str, arr)
  })
];

const expectedInFullView = (s, str, arr): StructAssert[] => [
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

const scrollRelativeEditor = (delta: number, scrollRelativeTop: boolean) => {
  const container = UiFinder.findIn(SugarBody.body(), '.tox-tinymce').getOrDie();
  container.dom.scrollIntoView(scrollRelativeTop);
  Scroll.to(0, window.pageYOffset + (scrollRelativeTop ? delta : -delta));
};

const pAssertSinkVisibility = async (label: string, expectedVisibility: 'hidden' | 'visible') => {
  const sink = UiFinder.findIn(SugarBody.body(), '.tox-tinymce-aux').getOrDie();
  await Waiter.pTryUntil(`Wait for sink visibility to be ${expectedVisibility}`, () => {
    const visibility = Css.get(sink, 'visibility');
    assert.equal(visibility, expectedVisibility, label);
  });
};

const pAssertMenuStructure = (label: string, container: SugarElement<HTMLElement>, position: string) => Waiter.pTryUntil(
  `Wait until menus become ${position} positioned`,
  () => Assertions.assertStructure(
    label,
    ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('tox-menu') ],
      styles: {
        position: str.is(position)
      }
    })),
    container
  )
);

// Assume editor height 400
const pTestMenuScroll = async (top: boolean) => {
  const menu = UiFinder.findIn(SugarBody.body(), '[role="menu"]').getOrDie();
  await pAssertMenuStructure('Checking the opened menus default positioning', menu, 'absolute');
  scrollRelativeEditor(200, top);
  await pAssertMenuStructure('When the top of the editor scrolls off screen, menus should become sticky', menu, 'fixed');
  scrollRelativeEditor(500, top);
  await pAssertSinkVisibility('When the editor is scrolled off the screen, sticky menus and toolbars should become HIDDEN', 'hidden');
  scrollRelativeEditor(200, top);
  await pAssertSinkVisibility('When the editor is partially scrolled on screen, sticky menus and toolbars should become VISIBLE', 'visible');
  await pAssertMenuStructure('When the editor is partially viewable, it should still be sticky', menu, 'fixed');
  scrollRelativeEditor(-100, top);
  await pAssertMenuStructure('When the editor is in full view, menus and toolbars should not be sticky', menu, 'absolute');
};

const pAssertEditorContainer = async (isToolbarTop: boolean, expectedPart: ApproxStructure.Builder<StructAssert[]>) => {
  const container = UiFinder.findIn(SugarBody.body(), '.tox-editor-container').getOrDie();
  await Waiter.pTryUntil('Wait for editor structure',
    () => Assertions.assertStructure(
      'for the .tox-editor-container',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-editor-container') ],
        children: isToolbarTop ?
          expectedPart(s, str, arr).concat(staticPartsOuter(s, str, arr)) :
          staticPartsOuter(s, str, arr).concat(expectedPart(s, str, arr))
      })),
      container
    )
  );
};

const pScrollAndAssertStructure = async (isToolbarTop: boolean, scrollYDelta: number, expectedPart: ApproxStructure.Builder<StructAssert[]>) => {
  scrollRelativeEditor(scrollYDelta, isToolbarTop);
  const container = UiFinder.findIn(SugarBody.body(), '.tox-editor-container').getOrDie();
  await Waiter.pTryUntil('Wait until editor docking updated',
    () => Assertions.assertStructure(
      'for the .tox-editor-container',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-editor-container') ],
        children: isToolbarTop ?
          expectedPart(s, str, arr).concat(staticPartsOuter(s, str, arr)) :
          staticPartsOuter(s, str, arr).concat(expectedPart(s, str, arr))
      })),
      container
    )
  );
};

const assertEditorClasses = (docked: boolean) => {
  const container = UiFinder.findIn(SugarBody.body(), '.tox-tinymce').getOrDie();
  Assertions.assertStructure('Check root container classes', ApproxStructure.build((s, _str, arr) => s.element('div', {
    classes: [
      arr.has('tox-tinymce--toolbar-sticky-' + (docked ? 'on' : 'off')),
      arr.not('tox-tinymce--toolbar-sticky-' + (docked ? 'off' : 'on'))
    ]
  })), container);
};

const pAssertHeaderPosition = async (toolbarLocation: ToolbarLocation, value: number) => {
  const isToolbarTop = toolbarLocation === ToolbarLocation.top;
  scrollRelativeEditor(-100, isToolbarTop);
  await Waiter.pWait(100);
  scrollRelativeEditor(200, isToolbarTop);
  const header = UiFinder.findIn(SugarBody.body(), '.tox-editor-header').getOrDie();

  return Waiter.pTryUntil(
    `Wait until head get ${value}px`,
    () => assert.equal(Css.get(header, toolbarLocation), `${value}px`)
  );
};

const pCloseMenus = (numOpenedMenus: number) => {
  const menuArray = Arr.range(numOpenedMenus, Fun.identity);
  return Arr.foldl(menuArray, (p) => p.then(async () => {
    const menuElem = await UiFinder.pWaitForVisible('Wait for selected menu to be visible', SugarBody.body(), '.tox-selected-menu');
    await Waiter.pTryUntil('Wait for menu item to be focused', () => {
      assert.isTrue(Focus.search(menuElem).isSome(), 'Assert menu item is focused');
    });
    const focusedElem = Focus.active(SugarDocument.getDocument()).getOrDie('Could not find active menu item');
    Keyboard.keydown(Keys.escape(), { }, focusedElem);
    await Waiter.pTryUntil('Wait for menu to be closed', () => {
      assert.isFalse(SugarBody.inBody(menuElem), 'Assert menu has been closed');
    });
  }), PromisePolyfill.resolve());
};

const pOpenMenuAndTestScrolling = async (pOpenMenu: () => Promise<void>, numMenusToClose: number, top: boolean) => {
  await pOpenMenu();
  await pTestMenuScroll(top);
  await pCloseMenus(numMenusToClose);
};

export {
  expectedHalfView,
  expectedInFullView,
  expectedEditorHidden,
  expectedScrollEventBound,

  pAssertEditorContainer,
  pOpenMenuAndTestScrolling,
  pScrollAndAssertStructure,
  pAssertHeaderDocked,
  pAssertHeaderPosition,
  assertEditorClasses,
  scrollRelativeEditor
};
