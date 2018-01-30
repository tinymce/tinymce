import { Assertions, Chain, GeneralSteps, Mouse, Pipeline, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyDom, TinyLoader } from '@ephox/mcagar';

import Theme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('tinymce.themes.modern.test.browser.SidebarTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const dialogRoot = TinyDom.fromDom(document.body);
  let state = [];

  Theme();

  const storeEvent = function (name) {
    return function (api) {
      state.push({
        name,
        element: api.element()
      });
    };
  };

  const cWaitForToolbar = Chain.fromChainsWith(dialogRoot, [
    UiFinder.cWaitFor('Sidebar toolbar', '.mce-sidebar-toolbar')
  ]);

  const cFindButton = function (ariaLabel) {
    return UiFinder.cFindIn('div[aria-label="' + ariaLabel + '"]');
  };

  const cClickButton = function (ariaLabel) {
    return Chain.fromChains([
      cFindButton(ariaLabel),
      Mouse.cTrueClick
    ]);
  };

  const sClickButton = function (ariaLabel) {
    return Chain.asStep({}, [
      cWaitForToolbar,
      cClickButton(ariaLabel)
    ]);
  };

  const sResetState = Step.sync(function () {
    state = [];
  });

  const sAssertEventNames = function (expectedNames) {
    return Step.sync(function () {
      const actualNames = state.map(function (state) {
        return state.name;
      });

      Assertions.assertEq('Names need to be equal', expectedNames, actualNames);
    });
  };

  const getSidebarElement = function (index) {
    const sidebarPanelElms = document.querySelectorAll('.mce-sidebar-panel > .mce-container-body');
    const flippedIndex = sidebarPanelElms.length - 1 - index;
    return sidebarPanelElms ? sidebarPanelElms[flippedIndex] : null;
  };

  const sAssertPanelElements = function (expectedPanelIndexes) {
    return Step.sync(function () {
      state.forEach(function (state, i) {
        const actualElement = state.element;
        const expectedElement = getSidebarElement(expectedPanelIndexes[i]);
        Assertions.assertEq('Elements need to be equal', true, expectedElement === actualElement);
      });
    });
  };

  const sAssertPanelVisibility = function (visibleStates) {
    return Step.sync(function () {
      visibleStates.forEach(function (visibleState, i) {
        const panelElement: any = getSidebarElement(i).parentNode;
        Assertions.assertEq('Visibility need to be equal', visibleState, panelElement.style.display !== 'none');
      });
    });
  };

  const sClickAndAssertEvents = function (tooltip, expectedNames, expectedPanelIndexes) {
    return GeneralSteps.sequence([
      sResetState,
      sClickButton(tooltip),
      sAssertEventNames(expectedNames),
      sAssertPanelElements(expectedPanelIndexes)
    ]);
  };

  const sAssertButtonIcon = function (tooltip, expectedIcon) {
    return Chain.asStep({}, [
      cWaitForToolbar,
      cFindButton(tooltip),
      UiFinder.cFindIn('i'),
      Chain.op(function (iconElm) {
        const className = iconElm.dom().className;
        Assertions.assertEq('Needs to have icon class: ' + expectedIcon, true, className.indexOf('mce-i-' + expectedIcon) !== -1);
      })
    ]);
  };

  const normalizeUrlString = function (urlString) {
    return urlString.replace(/\"/g, '');
  };

  const sAssertButtonIconImage = function (tooltip, expectedIconUrl) {
    return Chain.asStep({}, [
      cWaitForToolbar,
      cFindButton(tooltip),
      UiFinder.cFindIn('i'),
      Chain.op(function (iconElm) {
        const actualUrl = normalizeUrlString(iconElm.dom().style.backgroundImage);
        Assertions.assertEq('Needs to have correct icon url', 'url(' + expectedIconUrl + ')', actualUrl);
      })
    ]);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, [
      sAssertButtonIcon('My sidebar 1', 'bold'),
      sAssertButtonIcon('My sidebar 2', 'italic'),
      sAssertButtonIconImage('My sidebar 3', 'about:blank'),
      sClickAndAssertEvents('My sidebar 1', ['mysidebar1:render', 'mysidebar1:show'], [0, 0]),
      sAssertPanelVisibility([true]),
      sClickAndAssertEvents('My sidebar 2', ['mysidebar1:hide', 'mysidebar2:render', 'mysidebar2:show'], [0, 1, 1]),
      sAssertPanelVisibility([false, true]),
      sClickAndAssertEvents('My sidebar 3', ['mysidebar2:hide', 'mysidebar3:render', 'mysidebar3:show'], [1, 2, 2]),
      sAssertPanelVisibility([false, false, true]),
      sClickAndAssertEvents('My sidebar 3', ['mysidebar3:hide'], [2]),
      sAssertPanelVisibility([false, false, false])
    ], onSuccess, onFailure);
  }, {
    theme: 'modern',
    setup (editor) {
      editor.addSidebar('mysidebar1', {
        tooltip: 'My sidebar 1',
        icon: 'bold',
        onrender: storeEvent('mysidebar1:render'),
        onshow: storeEvent('mysidebar1:show'),
        onhide: storeEvent('mysidebar1:hide')
      });

      editor.addSidebar('mysidebar2', {
        tooltip: 'My sidebar 2',
        icon: 'italic',
        onrender: storeEvent('mysidebar2:render'),
        onshow: storeEvent('mysidebar2:show'),
        onhide: storeEvent('mysidebar2:hide')
      });

      editor.addSidebar('mysidebar3', {
        tooltip: 'My sidebar 3',
        image: 'about:blank',
        onrender: storeEvent('mysidebar3:render'),
        onshow: storeEvent('mysidebar3:show'),
        onhide: storeEvent('mysidebar3:hide')
      });
    },
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
