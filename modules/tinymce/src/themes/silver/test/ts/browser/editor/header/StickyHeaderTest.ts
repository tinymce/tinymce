import { GeneralSteps, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';

import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import { ToolbarDrawer } from 'tinymce/themes/silver/api/Settings';
import Theme from 'tinymce/themes/silver/Theme';
import * as MenuUtils from '../../../module/MenuUtils';
import * as StickyUtils from '../../../module/StickyHeaderUtils';

UnitTest.asynctest('Editor with sticky toolbar', (success, failure) => {
  Theme();
  FullscreenPlugin();

  const sTestWithToolbarDrawer = (toolbarDrawer: ToolbarDrawer) => {
    return Step.label('Test editor with toolbar_drawer: ' + toolbarDrawer, Step.raw((_, next, die, logs) => {
      TinyLoader.setup((editor, onSuccess, onFailure) => {
        const tinyApis = TinyApis(editor);
        const forceScrollDiv = StickyUtils.createScrollDiv();
        Pipeline.async({}, [
          tinyApis.sFocus,
          // Need to wait for a fraction for some reason on safari,
          // otherwise the initial scrolling doesn't work
          Step.wait(100),
          Step.label('Setup page for scrolling', StickyUtils.sSetupScrolling(forceScrollDiv)),
          Step.label('Checking startup structure', GeneralSteps.sequence([
            StickyUtils.sAssertEditorContainer(StickyUtils.expectedInFullView),
            StickyUtils.sAssertEditorClasses(false)
          ])),
          Step.label('Checking scroll event listeners are bound, scroll by 1px then assert', StickyUtils.sScrollAndAssertStructure(1, StickyUtils.expectedScrollEventBound)),
          Step.label('Scroll to half the editor should have sticky css markings', GeneralSteps.sequence([
            StickyUtils.sScrollAndAssertStructure(300, StickyUtils.expectedHalfView),
            StickyUtils.sAssertEditorClasses(true)
          ])),
          Step.label('Scroll down so the editor is hidden from view, it should have hidden css markings', StickyUtils.sScrollAndAssertStructure(800, StickyUtils.expectedEditorHidden)),
          Step.label('Scroll back to top should not have sticky', GeneralSteps.sequence([
            StickyUtils.sScrollAndAssertStructure(0, StickyUtils.expectedInFullView),
            StickyUtils.sAssertEditorClasses(false)
          ])),

          Step.label('Open align menu and check sticky states', StickyUtils.sOpenMenuAndTestScrolling(MenuUtils.sOpenAlignMenu('open align'), 1)),
          ...toolbarDrawer === ToolbarDrawer.default ? [ ] : [ Step.label('Open the more drawer to reveal items first', MenuUtils.sOpenMore(toolbarDrawer)) ],
          Step.label('Open nested Formats menu Align and check sticky states', StickyUtils.sOpenMenuAndTestScrolling(MenuUtils.sOpenNestedMenus([
            {
              // first open this menu
              label: 'Open nested formats dropdown',
              selector: 'button[aria-label=Formats]'
            },
            {
              // opening the first menu should reveal the next menu which contains Align, open Align
              label: 'Open Align menu item',
              selector: 'div[title=Align][role=menuitem]' // note we are using title instead of aria-label for some items here.
            }
          ]), 2)),
          Step.label('Open menubar Formats menu => Formats => Inline => check sticky states', StickyUtils.sOpenMenuAndTestScrolling(MenuUtils.sOpenNestedMenus([
            {
              label: 'Open menu bar Formats menu',
              selector: 'button:contains(Format)[role=menuitem]'
            },
            {
              label: 'then Formats submenu',
              selector: 'div[title=Formats][role=menuitem]'
            },
            {
              label: 'then Inline submenu',
              selector: 'div[title=Inline][role=menuitem]'
            }
          ]), 3)),
          Step.label('Open text color palette => check sticky states', StickyUtils.sOpenMenuAndTestScrolling(MenuUtils.sOpenNestedMenus([
            {
              label: 'Open splitmenu item, color palette',
              selector: 'div[title="Text color"][aria-expanded=false]'
            }
          ]), 1)),
          ...toolbarDrawer === ToolbarDrawer.default ? [ ] : [ Step.label('Close the more drawer', MenuUtils.sCloseMore(toolbarDrawer)) ],

          Step.label('Toggle fullscreen mode and ensure header moves from docked -> undocked -> docked', GeneralSteps.sequence([
            StickyUtils.sScrollAndAssertStructure(300, StickyUtils.expectedHalfView),
            tinyApis.sExecCommand('mceFullscreen'),
            UiFinder.sWaitForVisible('Wait for fullscreen to be activated', Body.body(), '.tox-fullscreen'),
            StickyUtils.sAssertEditorContainer(StickyUtils.expectedInFullView),
            tinyApis.sExecCommand('mceFullscreen'),
            Waiter.sTryUntil('Wait for fullscreen to be deactivated', UiFinder.sNotExists(Body.body(), '.tox-fullscreen')),
            StickyUtils.sScrollAndAssertStructure(300, StickyUtils.expectedHalfView),
          ])),

          StickyUtils.tearDown(forceScrollDiv)
        ], onSuccess, onFailure, logs);
      },
      {
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
        plugins: 'fullscreen',
        toolbar: 'align | fontsizeselect | fontselect | formatselect | styleselect | insertfile | forecolor | backcolor ',
        resize: 'both',
        min_height: 300,
        min_width: 300,
        height: 400,
        width: 400,
        max_height: 500,
        max_width: 500,
        toolbar_drawer: toolbarDrawer,
        toolbar_sticky: true
      }, next, die);
    }));
  };

  Pipeline.async({}, [
    sTestWithToolbarDrawer(ToolbarDrawer.default),
    sTestWithToolbarDrawer(ToolbarDrawer.floating),
    sTestWithToolbarDrawer(ToolbarDrawer.sliding),
  ], success, failure);
});
