import { Log, Pipeline, Step, RawAssertions, ApproxStructure, Mouse, Chain, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import { Element, Css, SelectorFind, Body, Attr } from '@ephox/sugar';

UnitTest.asynctest('browser.tinymce.core.ReadOnlyModeTest', (success, failure) => {
  Theme();
  TablePlugin();

  TinyLoader.setup(function (editor: Editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    const sSetMode = (mode: string) => {
      return Step.label('sSetMode: setting the editor mode to ' + mode, Step.sync(() => {
        editor.mode.set(mode);
      }));
    };

    const sAssertNestedContentEditableTrueDisabled = (state: boolean, offscreen: boolean) => {
      return tinyApis.sAssertContentStructure(
        ApproxStructure.build(function (s, str, arr) {
          const attrs = state ? {
            'contenteditable': str.is('false'),
            'data-mce-contenteditable': str.is('true')
          } : {
            'contenteditable': str.is('true'),
            'data-mce-contenteditable': str.none()
          };

          return s.element('body', {
            children: [
              s.element('div', {
                attrs: {
                  contenteditable: str.is('false')
                },
                children: [
                  s.text(str.is('a')),
                  s.element('span', {
                    attrs,
                  }),
                  s.text(str.is('c'))
                ]
              }),
              ...offscreen ? [ s.element('div', {}) ] : [] // Offscreen cef clone
            ]
          });
        })
      );
    };

    const sAssertFakeSelection = (expectedState: boolean) => Step.sync(() => {
      RawAssertions.assertEq('Selected element should have expected state', expectedState, editor.selection.getNode().hasAttribute('data-mce-selected'));
    });

    const sAssertResizeBars = (expectedState: boolean) => {
      return Step.sync(() => {
        SelectorFind.descendant(Element.fromDom(editor.getDoc().documentElement), '.ephox-snooker-resizer-bar').fold(
          () => {
            RawAssertions.assertEq('Was expecting to find resize bars', expectedState, false);
          },
          (bar) => {
            const actualDisplay = Css.get(bar, 'display');
            const expectedDisplay = expectedState ? 'block' : 'none';
            RawAssertions.assertEq('Should be expected display state on resize bar', expectedDisplay, actualDisplay);
          }
        );
      });
    };

    const sMouseOverTable = Chain.asStep(Element.fromDom(editor.getBody()), [
      UiFinder.cFindIn('table'),
      Mouse.cMouseOver
    ]);

    const sAssertToolbarDisabled = (expectedState: boolean) => Chain.asStep(Body.body(), [
      UiFinder.cFindIn('button[title="Bold"]'),
      Chain.op((elm) => {
        RawAssertions.assertEq('Button should have expected disabled state', expectedState, Attr.has(elm, 'disabled'));
      })
    ]);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Swiching to readonly mode while having cef selection should remove fake selection', [
        sSetMode('design'),
        tinyApis.sSetContent('<div contenteditable="false">CEF</div>'),
        tinyApis.sSelect('div[contenteditable="false"]', []),
        sAssertFakeSelection(true),
        sSetMode('readonly'),
        sAssertFakeSelection(false),
        sSetMode('design'),
        sAssertFakeSelection(true)
      ]),
      Log.stepsAsStep('TBA', 'Selecting cef element while in readonly mode should not add fake selection', [
        sSetMode('design'),
        tinyApis.sSetContent('<div contenteditable="false">CEF</div>'),
        tinyApis.sSelect('div[contenteditable="false"]', []),
        sAssertFakeSelection(true),
        sSetMode('readonly'),
        tinyApis.sSelect('div[contenteditable="false"]', []),
        sAssertFakeSelection(false),
        sSetMode('design'),
        tinyApis.sSelect('div[contenteditable="false"]', []),
        sAssertFakeSelection(true)
      ]),
      Log.stepsAsStep('TBA', 'Setting caret before cef in editor while in readonly mode should not render fake caret', [
        sSetMode('design'),
        tinyApis.sSetContent('<div contenteditable="false">CEF</div>'),
        sSetMode('readonly'),
        tinyApis.sSetCursor([], 0),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('div', {
                  attrs: {
                    contenteditable: str.is('false')
                  },
                  children: [
                    s.text(str.is('CEF')),
                  ]
                })
              ]
            });
          })
        ),
        sSetMode('design'),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('p', {
                  attrs: {
                    'data-mce-caret': str.is('before'),
                    'data-mce-bogus': str.is('all'),
                  },
                  children: [
                    s.element('br', {}),
                  ]
                }),
                s.element('div', {
                  attrs: {
                    contenteditable: str.is('false')
                  },
                  children: [
                    s.text(str.is('CEF')),
                  ]
                }),
                s.element('div', {
                  attrs: {
                    'data-mce-bogus': str.is('all'),
                  },
                  classes: [arr.has('mce-visual-caret'), arr.has('mce-visual-caret-before')]
                })
              ]
            });
          })
        )
      ]),
      Log.stepsAsStep('TBA', 'Swiching to readonly mode on content with nested contenteditable=true should toggle them to contenteditable=false', [
        sSetMode('design'),
        tinyApis.sSetContent('<div contenteditable="false">a<span contenteditable="true">b</span>c</div>'),
        tinyApis.sSelect('div[contenteditable="false"]', []),
        sAssertFakeSelection(true),
        sSetMode('readonly'),
        sAssertNestedContentEditableTrueDisabled(true, true),
        tinyApis.sAssertContent('<div contenteditable="false">a<span contenteditable="true">b</span>c</div>'),
        sAssertFakeSelection(false),
        sSetMode('design'),
        tinyApis.sAssertContent('<div contenteditable="false">a<span contenteditable="true">b</span>c</div>'),
        sAssertNestedContentEditableTrueDisabled(false, true)
      ]),
      Log.stepsAsStep('TBA', 'Setting contents with contenteditable=true should switch them to contenteditable=false while in readonly mode', [
        sSetMode('readonly'),
        tinyApis.sSetContent('<div contenteditable="false">a<span contenteditable="true">b</span>c</div>'),
        sAssertNestedContentEditableTrueDisabled(true, false),
        tinyApis.sAssertContent('<div contenteditable="false">a<span contenteditable="true">b</span>c</div>'),
        sSetMode('design'),
        tinyApis.sAssertContent('<div contenteditable="false">a<span contenteditable="true">b</span>c</div>'),
        tinyApis.sSelect('div[contenteditable="false"]', []),
        sAssertNestedContentEditableTrueDisabled(false, true),
        tinyApis.sSetContent('<div contenteditable="false">a<span contenteditable="true">b</span>c</div>'),
        tinyApis.sSelect('div[contenteditable="false"]', []),
        sAssertNestedContentEditableTrueDisabled(false, true)
      ]),
      Log.stepsAsStep('TBA', 'Resize bars for tables should be hidden while in readonly mode', [
        sSetMode('design'),
        tinyApis.sSetContent('<table><tbody><tr><td>a</td></tr></tbody></table>'),
        tinyApis.sSetCursor([0, 0, 0, 0, 0], 0),
        sMouseOverTable,
        sAssertResizeBars(true),
        sSetMode('readonly'),
        sAssertResizeBars(false),
        sMouseOverTable,
        sAssertResizeBars(false),
        sSetMode('design'),
        sMouseOverTable,
        sAssertResizeBars(true)
      ]),
      Log.stepsAsStep('TBA', 'Context toolbar should hide in readonly mode', [
        sSetMode('design'),
        tinyApis.sSetContent('<table><tbody><tr><td>a</td></tr></tbody></table>'),
        tinyApis.sSetCursor([0, 0, 0, 0, 0], 0),
        UiFinder.sWaitFor('Waited for context toolbar', Body.body(), '.tox-pop'),
        sSetMode('readonly'),
        UiFinder.sNotExists(Body.body(), '.tox-pop'),
        sSetMode('design'),
        tinyApis.sSetContent('<table><tbody><tr><td>a</td></tr></tbody></table>'),
        tinyApis.sSetCursor([0, 0, 0, 0, 0], 0),
        UiFinder.sWaitFor('Waited for context toolbar', Body.body(), '.tox-pop')
      ]),
      Log.stepsAsStep('TBA', 'Main toolbar should disable when switching to readonly mode', [
        sSetMode('design'),
        sAssertToolbarDisabled(false),
        sSetMode('readonly'),
        sAssertToolbarDisabled(true),
        sSetMode('design'),
        sAssertToolbarDisabled(false)
      ]),
      Log.stepsAsStep('TBA', 'Menus should close when switching to readonly mode', [
        sSetMode('design'),
        Chain.asStep(Body.body(), [
          UiFinder.cFindIn('.tox-mbtn:contains("File")'),
          Mouse.cClick
        ]),
        UiFinder.sWaitFor('Waited for menu', Body.body(), '.tox-menu'),
        sSetMode('readonly'),
        UiFinder.sNotExists(Body.body(), '.tox-menu')
      ])
    ], onSuccess, onFailure);
  }, {
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'bold',
      plugins: 'table'
    }, success, failure);
});
