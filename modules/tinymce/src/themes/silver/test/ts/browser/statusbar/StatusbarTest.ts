import { ApproxStructure, Assertions, Mouse, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { McEditor, TinyDom } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';
import WordcountPlugin from 'tinymce/plugins/wordcount/Plugin';

describe('browser.tinymce.themes.silver.statusbar.StatusbarTest', () => {
  before(() => {
    WordcountPlugin(5);
  });

  const elementPathSpec: ApproxStructure.Builder<StructAssert> = (s, str, arr) =>
    s.element('div', {
      classes: [ arr.has('tox-statusbar__path') ],
      children: [
        s.element('div', { children: [ s.text(str.is('p')) ] }),
        s.element('div', { children: [ s.text(str.is(' › ')) ] }),
        s.element('div', { children: [ s.text(str.is('strong')) ] }),
        s.element('div', { children: [ s.text(str.is(' › ')) ] }),
        s.element('div', { children: [ s.text(str.is('em')) ] })
      ]
    });

  const brandingSpec: ApproxStructure.Builder<StructAssert> = (s, str, arr) =>
    s.element('span', {
      classes: [ arr.has('tox-statusbar__branding') ],
      children: [
        s.element('a', {
          attrs: {
            'aria-label': str.is('Powered by Tiny')
          },
          children: [
            s.element('svg', {})
          ]
        })
      ]
    });

  const fullStatusbarSpec: ApproxStructure.Builder<StructAssert[]> = (s, str, arr) => [
    s.element('div', {
      classes: [ arr.has('tox-statusbar__text-container') ],
      children: [
        elementPathSpec(s, str, arr),
        s.element('button', {
          classes: [ arr.has('tox-statusbar__wordcount') ],
          children: [ s.text(str.is('2 words')) ]
        }),
        brandingSpec(s, str, arr)
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
        elementPathSpec(s, str, arr),
        brandingSpec(s, str, arr)
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
        elementPathSpec(s, str, arr),
        brandingSpec(s, str, arr)
      ]
    })
  ];

  const makeTest = (config: RawEditorOptions, structureLabel: string, editorStructure: StructAssert) => async () => {
    const editor = await McEditor.pFromSettings<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      ...config
    });
    editor.focus();
    editor.setContent('<p><strong><em>hello world</em></strong></p>');
    await Waiter.pTryUntil('Wait for editor structure', () => Assertions.assertStructure(structureLabel, editorStructure, TinyDom.container(editor)));
    McEditor.remove(editor);
  };

  it('TBA: Full statusbar', makeTest(
    { plugins: 'wordcount' },
    'Full statusbar structure',
    ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('tox-tinymce') ],
      children: [
        s.element('div', {
          classes: [ arr.has('tox-editor-container') ],
          children: [
            s.anything(),
            s.anything(),
            s.element('div', {
              classes: [ arr.has('tox-statusbar') ],
              children: fullStatusbarSpec(s, str, arr)
            })
          ]
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
        s.element('div', {
          classes: [ arr.has('tox-editor-container') ],
          children: [
            s.anything(),
            s.anything(),
            s.element('div', {
              classes: [ arr.has('tox-statusbar') ],
              children: statusbarWithoutWordcountSpec(s, str, arr)
            })
          ]
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
        s.element('div', {
          classes: [ arr.has('tox-editor-container') ],
          children: [
            s.anything(),
            s.anything(),
            s.element('div', {
              classes: [ arr.has('tox-statusbar') ],
              children: statusbarWithoutResizeSpec(s, str, arr)
            })
          ]
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
        s.element('div', {
          classes: [ arr.has('tox-editor-container') ]
        }),
        s.element('div', {
          classes: [ arr.has('tox-view-wrap') ]
        }),
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
          s.element('div', {
            classes: [ arr.has('tox-editor-container') ],
            children: [
              s.anything(),
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
                          s.element('div', { children: [ s.text(str.is(' › ')) ] }),
                          s.element('div', { children: [ s.text(str.is('strong')) ] })
                        ]
                      })
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

    const button = UiFinder.findIn<HTMLButtonElement>(editorContainer, 'button[aria-label="Bold"]').getOrDie();
    Mouse.trueClick(button);
    await Waiter.pTryUntil('', () => Assertions.assertStructure(
      'Check p element path',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tinymce') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-editor-container') ],
            children: [
              s.anything(),
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
