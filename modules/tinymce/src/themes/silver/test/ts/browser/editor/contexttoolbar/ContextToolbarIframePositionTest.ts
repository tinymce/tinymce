import { Log, Pipeline, UiFinder, Step, Assertions, Keys, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyActions, TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { Body, Css, Element, Scroll } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { window } from '@ephox/dom-globals';

UnitTest.asynctest('IFrame editor ContextToolbar Position test', (success, failure) => {
  FullscreenPlugin();
  SilverTheme();

  interface Scenario {
    label: string;
    content: string;
    contentStyles?: string;
    cursor: {
      elementPath: number[];
      offset: number;
    };
    classes: string;
  }

  const imageSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFElEQVR42mNk+A+ERADGUYX0VQgAXAYT9xTSUocAAAAASUVORK5CYII=';

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const tinyApis = TinyApis(editor);
      const tinyUi = TinyUi(editor);
      const tinyActions = TinyActions(editor);

      const sScrollTo = (x: number, y: number) => Step.sync(() => Scroll.to(x, y, Element.fromDom(editor.getDoc())));

      const sAssertPosition = (position: string, value: number, diff = 5) => Waiter.sTryUntil('Wait for toolbar to be positioned', Step.sync(() => {
        UiFinder.findIn(Body.body(), '.tox-pop').each((ele) => {
          const styles = parseInt(Css.getRaw(ele, position).getOr('0').replace('px', ''), 10);
          Assertions.assertEq(`Assert toolbar position - ${position} ${styles}px ~= ${value}px`, true, Math.abs(styles - value) <= diff);
        });
      }), 10, 1000);

      const sAssertFullscreenPosition = (position: string, value: number, diff = 5) => Waiter.sTryUntil('Wait for toolbar to be positioned', Step.sync(() => {
        UiFinder.findIn(Body.body(), '.tox-pop').each((ele) => {
          // The context toolbar is positioned relative to the sink, so the value can change between browsers due to different default styles
          // as such we can't reliably test using the actual top/bottom position, so use the bounding client rect instead.
          const pos = ele.dom().getBoundingClientRect();
          Assertions.assertEq(`Assert toolbar position - ${position} ${pos[position]}px ~= ${value}px`, true, Math.abs(pos[position] - value) <= diff);
        });
      }), 10, 1000);

      const sTestPositionWhileScrolling = (scenario: Scenario) => {
        return Log.stepsAsStep('TBA', scenario.label, [
          tinyApis.sSetContent(
            '<p style="height: 100px"></p>' +
            '<p style="height: 100px"></p>' +
            '<p style="height: 100px"></p>' +
            `<p style="height: 25px;${scenario.contentStyles || ''}">${scenario.content}</p>` +
            '<p style="height: 100px"></p>' +
            '<p style="height: 100px"></p>' +
            '<p style="height: 100px"></p>'
          ),
          tinyApis.sFocus,
          sScrollTo(0, 200),
          tinyApis.sSetCursor(scenario.cursor.elementPath, scenario.cursor.offset),
          UiFinder.sWaitForVisible('Waiting for toolbar to appear above content', Body.body(), '.tox-pop.tox-pop--bottom' + scenario.classes),
          sAssertPosition('bottom', 232),

          // Position the link at the top of the viewport, just below the toolbar
          sScrollTo(0, 300),
          UiFinder.sWaitForVisible('Waiting for toolbar to appear below content', Body.body(), '.tox-pop.tox-pop--top' + scenario.classes),
          sAssertPosition('top', -289),

          // Position the behind the menu/toolbar and check the context toolbar is hidden
          sScrollTo(0, 400),
          UiFinder.sWaitForHidden('Waiting for toolbar to be hidden', Body.body(), '.tox-pop'),

          // Position the element back into view
          sScrollTo(0, 200),
          UiFinder.sWaitForVisible('Waiting for toolbar to appear above content', Body.body(), '.tox-pop.tox-pop--bottom' + scenario.classes),
          sAssertPosition('bottom', 232),

          // Position the element off the top of the screen and check the context toolbar is hidden
          sScrollTo(0, 600),
          UiFinder.sWaitForHidden('Waiting for toolbar to be hidden', Body.body(), '.tox-pop'),
        ]);
      };

      const fullscreenSelector = '.tox.tox-fullscreen';
      const fullscreenButtonSelector = 'button[aria-label="Fullscreen"]';

      Pipeline.async({ }, [
        tinyApis.sFocus,
        Log.stepsAsStep('TBA', 'Context toolbar selection position while scrolling', [
          // north/south
          sTestPositionWhileScrolling({
            label: 'north to south to hidden',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit <a href="http://tiny.cloud">link</a>',
            cursor: {
              elementPath: [ 3, 1, 0 ],
              offset: 1
            },
            classes: ''
          }),

          // northeast/southeast
          sTestPositionWhileScrolling({
            label: 'northeast to southeast to hidden',
            content: '<a href="http://tiny.cloud">link</a> Lorem ipsum dolor sit amet, consectetur adipiscing elit',
            cursor: {
              elementPath: [ 3, 0, 0 ],
              offset: 1
            },
            classes: '.tox-pop--align-left'
          }),

          // northeast/southeast
          sTestPositionWhileScrolling({
            label: 'northwest to southwest to hidden',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit <a href="http://tiny.cloud">link</a>',
            contentStyles: 'text-align: right',
            cursor: {
              elementPath: [ 3, 1, 0 ],
              offset: 4
            },
            classes: '.tox-pop--align-right'
          })
        ]),

        Log.stepsAsStep('TBA', 'Context toolbar falls back to positioning inside the content', [
          tinyApis.sSetContent(`<p><img src="${imageSrc}" style="height: 380px; width: 100px"></p>`),
          tinyApis.sSelect('img', []),
          UiFinder.sWaitForVisible('Waiting for toolbar to appear to top inside content', Body.body(), '.tox-pop.tox-pop--top'),
          sAssertPosition('bottom', 269),
          tinyApis.sSetCursor([0], 1),
          tinyActions.sContentKeystroke(Keys.enter()),
          tinyActions.sContentKeystroke(Keys.enter()),
          tinyApis.sNodeChanged,
          tinyApis.sSelect('img', []),
          UiFinder.sWaitForVisible('Waiting for toolbar to appear below content', Body.body(), '.tox-pop.tox-pop--top'),
          sAssertPosition('top', -56),
        ]),

        Log.stepsAsStep('TINY-4023', 'Context toolbar is visible in fullscreen mode', [
          tinyUi.sClickOnToolbar('Trigger fullscreen', fullscreenButtonSelector),
          tinyUi.sWaitForUi('Wait for fullscreen to be triggered', fullscreenSelector),
          tinyApis.sSetContent(`<p><img src="${imageSrc}" style="height: 380px; width: 100px"></p>`),
          tinyApis.sSelect('img', []),
          UiFinder.sWaitForVisible('Waiting for toolbar to appear to top inside content', Body.body(), '.tox-pop.tox-pop--top'),
          sAssertFullscreenPosition('top', 470),
          UiFinder.sWaitForVisible('Check toolbar is still visible', Body.body(), '.tox-pop.tox-pop--top'),
          tinyUi.sClickOnToolbar('Press fullscreen button', fullscreenButtonSelector),
          Waiter.sTryUntil('Wait for fullscreen to turn off', UiFinder.sNotExists(Body.body(), fullscreenSelector)),
        ]),

        Log.stepsAsStep('TBA', 'Context toolbar should hide when scrolled out of view', [
          Step.sync(() => {
            Css.setAll(Element.fromDom(editor.getContainer()), {
              'margin-bottom': '5000px'
            });
          }),
          tinyApis.sSetContent('<p><a href="http://tiny.cloud">link</a></p>'),
          tinyApis.sSetCursor([0, 0, 0], 1),
          UiFinder.sWaitForVisible('Waiting for toolbar to appear below content', Body.body(), '.tox-pop.tox-pop--top'),
          Step.wait(250), // TODO: Find out why Safari fails without this wait
          Step.sync(() => {
            window.scrollTo(0, 2000);
          }),
          UiFinder.sWaitForHidden('Waiting for toolbar to be hidden', Body.body(), '.tox-pop'),
        ]),
      ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
      plugins: 'fullscreen',
      toolbar: 'fullscreen',
      height: 400,
      base_url: '/project/tinymce/js/tinymce',
      content_style: 'body, p { margin: 0; }',
      setup: (ed: Editor) => {
        ed.ui.registry.addButton('alpha', {
          text: 'Alpha',
          onAction: () => {}
        });
        ed.ui.registry.addContextToolbar('test-selection-toolbar', {
          predicate: (node) => node.nodeName && node.nodeName.toLowerCase() === 'a',
          items: 'alpha'
        });
        ed.ui.registry.addContextToolbar('test-node-toolbar', {
          predicate: (node) => node.nodeName && node.nodeName.toLowerCase() === 'img',
          items: 'alpha',
          position: 'node'
        });
      }
    },
    () => {
      success();
    },
    failure
  );
});
