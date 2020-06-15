import { Assertions, Log, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Body, Css, Element, Location, Scroll } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('Inline editor ContextToolbar Position test', (success, failure) => {
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

  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const tinyApis = TinyApis(editor);

      const sScrollTo = (x: number, y: number) => Step.sync(() => {
        const editorPos = Location.absolute(Element.fromDom(editor.getContentAreaContainer()));
        // Note: Add 100px for the top para
        Scroll.to(editorPos.left() + x, editorPos.top() + 100 + y);
      });

      const sAssertPosition = (position: string, direction: string, value: number, diff = 5) => Waiter.sTryUntil('Wait for toolbar to be positioned', Step.sync(() => {
        UiFinder.findIn(Body.body(), '.tox-pop').each((ele) => {
          const posStyle = Css.get(ele, 'position');
          const dirStyle = parseInt(Css.getRaw(ele, direction).getOr('0').replace('px', ''), 10);
          Assertions.assertEq('Assert toolbar positioning', position, posStyle);
          Assertions.assertEq(`Assert toolbar position - ${direction} ${dirStyle}px ~= ${value}px`, true, Math.abs(dirStyle - value) <= diff);
        });
      }), 10, 1000);

      const sTestPositionWhileScrolling = (scenario: Scenario) => Log.stepsAsStep('TBA', scenario.label, [
        tinyApis.sSetContent(`<p style="height: 100px"></p><p style="height: 25px;${scenario.contentStyles || ''}">${scenario.content}</p><p style="height: 100px"></p>`),
        sScrollTo(0, -250),
        tinyApis.sSetCursor(scenario.cursor.elementPath, scenario.cursor.offset),
        UiFinder.sWaitForVisible('Waiting for toolbar to appear above content', Body.body(), '.tox-pop.tox-pop--bottom' + scenario.classes),
        sAssertPosition('absolute', 'bottom', 1637),

        // Position the link at the top of the viewport, just below the toolbar
        sScrollTo(0, -80),
        UiFinder.sWaitForVisible('Waiting for toolbar to appear below content', Body.body(), '.tox-pop.tox-pop--top' + scenario.classes),
        sAssertPosition('fixed', 'top', 109),

        // Position the element offscreen and check the toolbar is hidden
        sScrollTo(0, 100),
        UiFinder.sWaitForHidden('Waiting for toolbar to be hidden', Body.body(), '.tox-pop'),

        // Position the element back into view
        sScrollTo(0, -250),
        UiFinder.sWaitForVisible('Waiting for toolbar to appear above content', Body.body(), '.tox-pop.tox-pop--bottom' + scenario.classes),
        sAssertPosition('absolute', 'bottom', 1637),

        // Position the element behind the docked toolbar and check the toolbar is hidden
        sScrollTo(0, -10),
        UiFinder.sWaitForHidden('Waiting for toolbar to be hidden', Body.body(), '.tox-pop')
      ]);

      Pipeline.async({ }, [
        Step.sync(() => {
          Css.setAll(Element.fromDom(editor.getContentAreaContainer()), {
            'margin-top': '1500px',
            'margin-bottom': '1500px'
          });
        }),
        tinyApis.sFocus(),

        Log.stepsAsStep('TBA', 'Context toolbar position', [
          tinyApis.sSetContent('<p><a href="http://tiny.cloud">link</a></p>'),
          sScrollTo(0, -250),
          tinyApis.sSetCursor([ 0, 0, 0 ], 1),
          UiFinder.sWaitForVisible('Waiting for toolbar to appear below the content area container', Body.body(), '.tox-pop.tox-pop--top.tox-pop--align-left'),
          sAssertPosition('absolute', 'top', -1489)
        ]),

        Log.stepsAsStep('TBA', 'Context toolbar position while scrolling', [
          // north/south
          sTestPositionWhileScrolling({
            label: 'north to south to hidden',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit <a href="http://tiny.cloud">link</a>',
            cursor: {
              elementPath: [ 1, 1, 0 ],
              offset: 1
            },
            classes: ''
          }),

          // northeast/southeast
          sTestPositionWhileScrolling({
            label: 'northeast to southeast to hidden',
            content: '<a href="http://tiny.cloud">link</a> Lorem ipsum dolor sit amet, consectetur adipiscing elit',
            cursor: {
              elementPath: [ 1, 0, 0 ],
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
              elementPath: [ 1, 1, 0 ],
              offset: 4
            },
            classes: '.tox-pop--align-right'
          })
        ])
      ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
      inline: true,
      base_url: '/project/tinymce/js/tinymce',
      content_style: 'p { margin: 0; }',
      setup: (ed: Editor) => {
        ed.ui.registry.addButton('alpha', {
          text: 'Alpha',
          onAction: () => {}
        });
        ed.ui.registry.addContextToolbar('test-toolbar', {
          predicate: (node) => node.nodeName && node.nodeName.toLowerCase() === 'a',
          items: 'alpha'
        });
      }
    },
    () => {
      success();
    },
    failure
  );
});
