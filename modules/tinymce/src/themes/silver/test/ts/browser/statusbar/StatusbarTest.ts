import { ApproxStructure, Assertions, Mouse, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { McEditor, TinyDom } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorSettings } from 'tinymce/core/api/SettingsTypes';
import WordcountPlugin from 'tinymce/plugins/wordcount/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.statusbar.StatusbarTest', () => {
  before(() => {
    Theme();
    WordcountPlugin(5);
  });

  const fullStatusbarSpec: ApproxStructure.Builder<StructAssert[]> = (s, str, arr) => [
    s.element('div', {
      classes: [ arr.has('tox-statusbar__text-container') ],
      children: [
        s.element('div', {
          classes: [ arr.has('tox-statusbar__path') ],
          children: [
            s.element('div', { children: [ s.text(str.is('p')) ] }),
            s.element('div', { children: [ s.text(str.is(' » ')) ] }),
            s.element('div', { children: [ s.text(str.is('strong')) ] })
          ]
        }),
        s.element('button', {
          classes: [ arr.has('tox-statusbar__wordcount') ],
          children: [ s.text(str.is('2 words')) ]
        }),
        s.element('span', {
          classes: [ arr.has('tox-statusbar__branding') ],
          children: [
            s.element('a', { children: [ s.text(str.is('Powered by Tiny')) ] })
          ]
        })
      ]
    }),
    s.element('div', {
      classes: [ arr.has('tox-statusbar__resize-handle') ]
    })
  ];

  const statusbarWithoutWordcountSpec: ApproxStructure.Builder<StructAssert[]> = (s, str, arr) => [
    s.element('div', {
      classes: [ arr.has('tox-statusbar__text-container') ],
      children: [
        s.element('div', {
          classes: [ arr.has('tox-statusbar__path') ],
          children: [
            s.element('div', { children: [ s.text(str.is('p')) ] }),
            s.element('div', { children: [ s.text(str.is(' » ')) ] }),
            s.element('div', { children: [ s.text(str.is('strong')) ] })
          ]
        }),
        s.element('span', {
          classes: [ arr.has('tox-statusbar__branding') ],
          children: [
            s.element('a', { children: [ s.text(str.is('Powered by Tiny')) ] })
          ]
        })
      ]
    }),
    s.element('div', {
      classes: [ arr.has('tox-statusbar__resize-handle') ]
    })
  ];

  const statusbarWithoutResizeSpec: ApproxStructure.Builder<StructAssert[]> = (s, str, arr) => [
    s.element('div', {
      classes: [ arr.has('tox-statusbar__text-container') ],
      children: [
        s.element('div', {
          classes: [ arr.has('tox-statusbar__path') ],
          children: [
            s.element('div', { children: [ s.text(str.is('p')) ] }),
            s.element('div', { children: [ s.text(str.is(' » ')) ] }),
            s.element('div', { children: [ s.text(str.is('strong')) ] })
          ]
        }),
        s.element('span', {
          classes: [ arr.has('tox-statusbar__branding') ],
          children: [
            s.element('a', { children: [ s.text(str.is('Powered by Tiny')) ] })
          ]
        })
      ]
    })
  ];

  const makeTest = (config: RawEditorSettings, structureLabel: string, editorStructure: StructAssert) => async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      ...config
    });
    editor.focus();
    editor.setContent('<p><strong>hello world</strong></p>');
    await Waiter.pTryUntil('Wait for editor structure', () => Assertions.assertStructure(structureLabel, editorStructure, TinyDom.container(editor)));
    McEditor.remove(editor);
  };

  it('TBA: Full statusbar', makeTest(
    { plugins: 'wordcount' },
    'Full statusbar structure',
    ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('tox-tinymce') ],
      children: [
        s.anything(),
        s.element('div', {
          classes: [ arr.has('tox-statusbar') ],
          children: fullStatusbarSpec(s, str, arr)
        }),
        s.theRest()
      ]
    }))
  ));

  it('TBA: Statusbar without wordcount', makeTest(
    { },
    'Statusbar structure without wordcount',
    ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('tox-tinymce') ],
      children: [
        s.anything(),
        s.element('div', {
          classes: [ arr.has('tox-statusbar') ],
          children: statusbarWithoutWordcountSpec(s, str, arr)
        }),
        s.theRest()
      ]
    }))
  ));

  it('TBA: Statusbar without resize', makeTest(
    { resize: false },
    'Statusbar structure without resize',
    ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('tox-tinymce') ],
      children: [
        s.anything(),
        s.element('div', {
          classes: [ arr.has('tox-statusbar') ],
          children: statusbarWithoutResizeSpec(s, str, arr)
        }),
        s.theRest()
      ]
    }))
  ));

  it('TBA: Remove statusbar', makeTest(
    { statusbar: false },
    'Editor without statusbar',
    ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('tox-tinymce') ],
      children: [
        s.anything(),
        s.element('div', {
          classes: [ arr.has('tox-throbber') ]
        })
      ]
    }))
  ));

  it('TBA: Full statusbar - check element path on content change', async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'bold',
      resize: false,
      branding: false
    });
    editor.focus();
    editor.setContent('<p><strong>hello world</strong></p>');
    const editorContainer = TinyDom.container(editor);

    await Waiter.pTryUntil('', () => Assertions.assertStructure(
      'Check p>strong element path',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tinymce') ],
        children: [
          s.anything(),
          s.element('div', {
            classes: [ arr.has('tox-statusbar') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-statusbar__text-container') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-statusbar__path') ],
                    children: [
                      s.element('div', { children: [ s.text(str.is('p')) ] }),
                      s.element('div', { children: [ s.text(str.is(' » ')) ] }),
                      s.element('div', { children: [ s.text(str.is('strong')) ] })
                    ]
                  })
                ]
              })
            ]
          }),
          s.theRest()
        ]
      })),
      editorContainer
    ));

    const button = UiFinder.findIn(editorContainer, 'button[aria-label="Bold"]').getOrDie();
    Mouse.trueClick(button);
    await Waiter.pTryUntil('', () => Assertions.assertStructure(
      'Check p element path',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tinymce') ],
        children: [
          s.anything(),
          s.element('div', {
            classes: [ arr.has('tox-statusbar') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-statusbar__text-container') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-statusbar__path') ],
                    children: [
                      s.element('div', { children: [ s.text(str.is('p')) ] })
                    ]
                  })
                ]
              })
            ]
          }),
          s.theRest()
        ]
      })),
      editorContainer
    ));

    McEditor.remove(editor);
  });
});
