import { Log, Pipeline, UiFinder, Step, Assertions, Keys } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import { Body, Css, Element, Scroll } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('IFrame editor ContextToolbar Position test', (success, failure) => {
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
      const tinyActions = TinyActions(editor);

      const sScrollTo = (x: number, y: number) => Step.sync(() => Scroll.to(x, y, Element.fromDom(editor.getDoc())));

      const sAssertPosition = (position: string, value: number, diff = 5) => Step.sync(() => {
        UiFinder.findIn(Body.body(), '.tox-pop').each((ele) => {
          const styles = parseInt(Css.getRaw(ele, position).getOr('0').replace('px', ''), 10);
          Assertions.assertEq(`Assert toolbar position - ${position} ${styles}px ~= ${value}px`, true, Math.abs(styles - value) <= diff);
        });
      });

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
          tinyApis.sSelect('img', []),
          UiFinder.sWaitForVisible('Waiting for toolbar to appear below content', Body.body(), '.tox-pop.tox-pop--top')
        ])
      ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
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
