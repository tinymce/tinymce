import { Log, Pipeline, Step, RawAssertions, Waiter, ApproxStructure } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.ReadOnlyModeTest', (success, failure) => {
  Theme();

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

    const sAssertFakeSelection = (expectedState: boolean) => Waiter.sTryUntil('', Step.sync(() => {
      RawAssertions.assertEq('Selected element should have expected state', expectedState, editor.selection.getNode().hasAttribute('data-mce-selected'));
    }), 10, 1000);

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
      ])
    ], onSuccess, onFailure);
  }, {
      base_url: '/project/tinymce/js/tinymce'
    }, success, failure);
});
