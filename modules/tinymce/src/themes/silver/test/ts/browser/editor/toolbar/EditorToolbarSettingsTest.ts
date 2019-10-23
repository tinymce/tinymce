import { ApproxStructure, Assertions, Log, NamedChain3 as NamedChain, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { HTMLElement, Element as DomElement } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { Editor as McagarEditor } from '@ephox/mcagar';
import { Body, Element } from '@ephox/sugar';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { cCountNumber, cExtractOnlyOne } from '../../../module/UiChainUtils';

UnitTest.asynctest('Editor (Silver) test', (success, failure) => {
  SilverTheme();

  const cCreateEditorWithToolbar = (toolbarVal, toolbarVal1?, toolbarVal2?, toolbarVal9?, toolbarVal20?) => McagarEditor.cFromSettings({
    toolbar: toolbarVal,
    toolbar1: toolbarVal1,
    toolbar2: toolbarVal2,
    toolbar9: toolbarVal9,
    toolbar20: toolbarVal20,
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  });

  const cAssertIsDefaultToolbar = Assertions.cAssertStructure(
    'Checking structure of tox-toolbar is "default"',
    ApproxStructure.build((s, str, arr) => {
      return s.element('div', {
        classes: [arr.has('tox-toolbar')],
        children: Arr.map([1, 2, 3, 4, 5], (_) => // Technically meant to be 6 groups by default but the link and image plugins aren't loaded here so whatever
          s.element('div', { classes: [arr.has('tox-toolbar__group')] }))
      });
    })
  );

  type ETST = {
    body: Element<HTMLElement>;
    editor: any; // TODO better type
    numToolbars: number;
    toolbar: Element<DomElement>;
    'multiple-toolbars': Element<DomElement>;
  };

  Pipeline.async({}, [
    Log.chainsAsStep('TBA', 'Testing toolbar: false should not create toolbar at all', [
      NamedChain.asEffectChain<ETST>()([
        NamedChain.inject(Body.body(), 'body'),
        NamedChain.write(cCreateEditorWithToolbar(false), 'editor'),
        NamedChain.read('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar')),
        NamedChain.direct('body', cCountNumber('.tox-toolbar'), 'numToolbars'),
        NamedChain.read('numToolbars', Assertions.cAssertEq('Should be no toolbars', 0)),
        NamedChain.read('editor', McagarEditor.cRemove),
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing toolbar: true should create default toolbar', [
      NamedChain.asEffectChain<ETST>()([
        NamedChain.inject(Body.body(), 'body'),
        NamedChain.write(cCreateEditorWithToolbar(true), 'editor'),
        NamedChain.read('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar')),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.read('toolbar', cAssertIsDefaultToolbar),
        NamedChain.read('editor', McagarEditor.cRemove),
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing toolbar: undefined should create default toolbar', [
      NamedChain.asEffectChain<ETST>()([
        NamedChain.inject(Body.body(), 'body'),
        NamedChain.write(cCreateEditorWithToolbar(undefined), 'editor'),
        NamedChain.read('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar')),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.read('toolbar', cAssertIsDefaultToolbar),
        NamedChain.read('editor', McagarEditor.cRemove),
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing toolbar: "bold italic" should create "bold italic" toolbar', [
      NamedChain.asEffectChain<ETST>()([
        NamedChain.inject(Body.body(), 'body'),
        NamedChain.write(cCreateEditorWithToolbar('bold italic'), 'editor'),
        NamedChain.read('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar')),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.read('toolbar', Assertions.cAssertStructure(
          'Checking toolbar should have just bold and italic',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [arr.has('tox-toolbar')],
              children: [
                s.element('div', {
                  classes: [arr.has('tox-toolbar__group')],
                  children: [
                    s.element('button', {}),
                    s.element('button', {})
                  ]
                })
              ]
            });
          })
        )),
        NamedChain.read('editor', McagarEditor.cRemove),
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing toolbar: "bold italic | stufffffed | strikethrough underline" should create "bold italic | strikethrough underline" toolbar', [
      NamedChain.asEffectChain<ETST>()([
        NamedChain.inject(Body.body(), 'body'),
        NamedChain.write(cCreateEditorWithToolbar('bold italic | stufffffed | strikethrough underline'), 'editor'),
        NamedChain.read('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar')),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.read('toolbar', Assertions.cAssertStructure(
          'Checking toolbar should have bold, italic, strikethrough and underline',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [arr.has('tox-toolbar')],
              children: [
                s.element('div', {
                  classes: [arr.has('tox-toolbar__group')],
                  children: [
                    s.element('button', {}),
                    s.element('button', {})
                  ]
                }),
                s.element('div', {
                  classes: [arr.has('tox-toolbar__group')],
                  children: [
                    s.element('button', {}),
                    s.element('button', {})
                  ]
                })
              ]
            });
          })
        )),
        NamedChain.read('editor', McagarEditor.cRemove),
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing toolbar: ["bold italic", "underline | strikethrough"] should create "bold italic" and "underline | strikethrough" toolbars', [
      NamedChain.asEffectChain<ETST>()([
        NamedChain.inject(Body.body(), 'body'),
        NamedChain.write(cCreateEditorWithToolbar(['bold italic', 'underline | strikethrough']), 'editor'),
        NamedChain.read('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar')),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar-overlord'), 'multiple-toolbars'),
        NamedChain.direct('body', cCountNumber('.tox-toolbar'), 'numToolbars'),
        NamedChain.read('numToolbars', Assertions.cAssertEq('Should be two toolbars', 2)),
        NamedChain.read('multiple-toolbars', Assertions.cAssertStructure(
          'Checking toolbar1 should have bold italic and and toolbar 2 should have underline',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [arr.has('tox-toolbar-overlord')],
              children: [
                s.element('div', {
                  classes: [arr.has('tox-toolbar')],
                  children: [
                    s.element('div', {
                      classes: [arr.has('tox-toolbar__group')],
                      children: [
                        s.element('button', {}),
                        s.element('button', {})
                      ]
                    }),
                  ]
                }),
                s.element('div', {
                  classes: [arr.has('tox-toolbar')],
                  children: [
                    s.element('div', {
                      classes: [arr.has('tox-toolbar__group')],
                      children: [
                        s.element('button', {})
                      ]
                    }),
                    s.element('div', {
                      classes: [arr.has('tox-toolbar__group')],
                      children: [
                        s.element('button', {})
                      ]
                    })
                  ]
                })
              ]
            });
          })
        )),
        NamedChain.read('editor', McagarEditor.cRemove),
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing toolbar: ["bold"] should create "bold" toolbar', [
      NamedChain.asEffectChain<ETST>()([
        NamedChain.inject(Body.body(), 'body'),
        NamedChain.write(cCreateEditorWithToolbar(['bold']), 'editor'),
        NamedChain.read('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar')),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar-overlord'), 'multiple-toolbars'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.read('multiple-toolbars', Assertions.cAssertStructure(
          'Checking toolbar should have just bold',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [arr.has('tox-toolbar-overlord')],
              children: [
                s.element('div', {
                  classes: [arr.has('tox-toolbar')],
                  children: [
                    s.element('div', {
                      classes: [arr.has('tox-toolbar__group')],
                      children: [
                        s.element('button', {}),
                      ]
                    })
                  ]
                }),
              ]
            });
          })
        )),
        NamedChain.read('editor', McagarEditor.cRemove),
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing toolbar: empty array should not create toolbar at all', [
      NamedChain.asEffectChain<ETST>()([
        NamedChain.inject(Body.body(), 'body'),
        NamedChain.write(cCreateEditorWithToolbar([]), 'editor'),
        NamedChain.read('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar')),
        NamedChain.direct('body', cCountNumber('.tox-toolbar'), 'numToolbars'),
        NamedChain.read('numToolbars', Assertions.cAssertEq('Should be no toolbars', 0)),
        NamedChain.read('editor', McagarEditor.cRemove),
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing multiple toolbars: toolbar: "link", toolbar1: "bold italic underline" and toolbar2: "strikethrough" should create a "bold italic underline" toolbar and a "strikethrough" toolbar', [
      NamedChain.asEffectChain<ETST>()([
        NamedChain.inject(Body.body(), 'body'),
        NamedChain.write(cCreateEditorWithToolbar('link', 'bold italic underline', 'strikethrough'), 'editor'),
        NamedChain.read('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar')),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar-overlord'), 'multiple-toolbars'),
        NamedChain.direct('body', cCountNumber('.tox-toolbar'), 'numToolbars'),
        NamedChain.read('numToolbars', Assertions.cAssertEq('Should be two toolbars', 2)),
        NamedChain.read('multiple-toolbars', Assertions.cAssertStructure(
          'Checking toolbar should have just bold and italic',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [arr.has('tox-toolbar-overlord')],
              children: [
                s.element('div', {
                  classes: [arr.has('tox-toolbar')],
                  children: [
                    s.element('div', {
                      classes: [arr.has('tox-toolbar__group')],
                      children: [
                        s.element('button', {}),
                        s.element('button', {}),
                        s.element('button', {})
                      ]
                    }),
                  ]
                }),
                s.element('div', {
                  classes: [arr.has('tox-toolbar')],
                  children: [
                    s.element('div', {
                      classes: [arr.has('tox-toolbar__group')],
                      children: [
                        s.element('button', {})
                      ]
                    })
                  ]
                })
              ]
            });
          })
        )),
        NamedChain.read('editor', McagarEditor.cRemove),
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing multiple toolbars: toolbar1: "bold italic underline" and toolbar2: ["strikethrough"] should create "bold italic underline" toolbar and ignore toolbar2', [
      NamedChain.asEffectChain<ETST>()([
        NamedChain.inject(Body.body(), 'body'),
        NamedChain.write(cCreateEditorWithToolbar(true, 'bold italic underline', ['strikethrough']), 'editor'),
        NamedChain.read('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar')),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar-overlord'), 'multiple-toolbars'),
        NamedChain.read('body', cExtractOnlyOne('.tox-toolbar')),
        NamedChain.read('multiple-toolbars', Assertions.cAssertStructure(
          'Checking toolbar should have just bold, italic and underline',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [arr.has('tox-toolbar-overlord')],
              children: [
                s.element('div', {
                  classes: [arr.has('tox-toolbar')],
                  children: [
                    s.element('div', {
                      classes: [arr.has('tox-toolbar__group')],
                      children: [
                        s.element('button', {}),
                        s.element('button', {}),
                        s.element('button', {}),
                      ]
                    }),
                  ]
                })
              ]
            });
          })
        )),
        NamedChain.read('editor', McagarEditor.cRemove),
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing multiple toolbars: toolbar: false and toolbar2: "bold italic" should create "bold italic" toolbar and ignore toolbar', [
      NamedChain.asEffectChain<ETST>()([
        NamedChain.inject(Body.body(), 'body'),
        NamedChain.write(cCreateEditorWithToolbar(false, false, 'bold italic'), 'editor'),
        NamedChain.read('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar')),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar-overlord'), 'multiple-toolbars'),
        NamedChain.read('body', cExtractOnlyOne('.tox-toolbar')),
        NamedChain.read('multiple-toolbars', Assertions.cAssertStructure(
          'Checking toolbar should have just bold and italic',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [arr.has('tox-toolbar-overlord')],
              children: [
                s.element('div', {
                  classes: [arr.has('tox-toolbar')],
                  children: [
                    s.element('div', {
                      classes: [arr.has('tox-toolbar__group')],
                      children: [
                        s.element('button', {}),
                        s.element('button', {}),
                      ]
                    }),
                  ]
                })
              ]
            });
          })
        )),
        NamedChain.read('editor', McagarEditor.cRemove),
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing multiple toolbars: toolbar: empty array and toolbar1: "bold italic" and toolbar2: "strikethrough" should create a "bold italic" toolbar and a "strikethrough" toolbar and ignore toolbar', [
      NamedChain.asEffectChain<ETST>()([
        NamedChain.inject(Body.body(), 'body'),
        NamedChain.write(cCreateEditorWithToolbar([], 'bold italic', 'strikethrough'), 'editor'),
        NamedChain.read('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar')),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar-overlord'), 'multiple-toolbars'),
        NamedChain.direct('body', cCountNumber('.tox-toolbar'), 'numToolbars'),
        NamedChain.read('numToolbars', Assertions.cAssertEq('Should be two toolbars', 2)),
        NamedChain.read('multiple-toolbars', Assertions.cAssertStructure(
          'Checking toolbar 1 should have bold and italic and toolbar 2 should have strikethrough',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [arr.has('tox-toolbar-overlord')],
              children: [
                s.element('div', {
                  classes: [arr.has('tox-toolbar')],
                  children: [
                    s.element('div', {
                      classes: [arr.has('tox-toolbar__group')],
                      children: [
                        s.element('button', {}),
                        s.element('button', {}),
                      ]
                    }),
                  ]
                }),
                s.element('div', {
                  classes: [arr.has('tox-toolbar')],
                  children: [
                    s.element('div', {
                      classes: [arr.has('tox-toolbar__group')],
                      children: [
                        s.element('button', {})
                      ]
                    })
                  ]
                })
              ]
            });
          })
        )),
        NamedChain.read('editor', McagarEditor.cRemove),
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing multiple toolbars: toolbar1: false and toolbar2: "bold italic underline" should create "bold italic underline toolbar and ignore toolbar1', [
      NamedChain.asEffectChain<ETST>()([
        NamedChain.inject(Body.body(), 'body'),
        NamedChain.write(cCreateEditorWithToolbar(true, false, 'bold italic underline'), 'editor'),
        NamedChain.read('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar')),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar-overlord'), 'multiple-toolbars'),
        NamedChain.read('body', cExtractOnlyOne('.tox-toolbar')),
        NamedChain.read('multiple-toolbars', Assertions.cAssertStructure(
          'Checking toolbar should have just bold, italic and underline',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [arr.has('tox-toolbar-overlord')],
              children: [
                s.element('div', {
                  classes: [arr.has('tox-toolbar')],
                  children: [
                    s.element('div', {
                      classes: [arr.has('tox-toolbar__group')],
                      children: [
                        s.element('button', {}),
                        s.element('button', {}),
                        s.element('button', {})
                      ]
                    }),
                  ]
                })
              ]
            });
          })
        )),
        NamedChain.read('editor', McagarEditor.cRemove),
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing multiple toolbars: toolbar1: "bold italic | underline" and toolbar9: "strikethrough" should create a "bold italic | underline" toolbar and a "strikethrough" toolbar', [
      NamedChain.asEffectChain<ETST>()([
        NamedChain.inject(Body.body(), 'body'),
        NamedChain.write(cCreateEditorWithToolbar(true, 'bold italic | underline', false, 'strikethrough'), 'editor'),
        NamedChain.read('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar')),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar-overlord'), 'multiple-toolbars'),
        NamedChain.direct('body', cCountNumber('.tox-toolbar'), 'numToolbars'),
        NamedChain.read('numToolbars', Assertions.cAssertEq('Should be two toolbars', 2)),
        NamedChain.read('multiple-toolbars', Assertions.cAssertStructure(
          'Checking toolbar 1 should have bold, italic and underline and toolbar 2 should have strikethrough',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [arr.has('tox-toolbar-overlord')],
              children: [
                s.element('div', {
                  classes: [arr.has('tox-toolbar')],
                  children: [
                    s.element('div', {
                      classes: [arr.has('tox-toolbar__group')],
                      children: [
                        s.element('button', {}),
                        s.element('button', {}),
                      ]
                    }),
                    s.element('div', {
                      classes: [arr.has('tox-toolbar__group')],
                      children: [
                        s.element('button', {}),
                      ]
                    })
                  ]
                }),
                s.element('div', {
                  classes: [arr.has('tox-toolbar')],
                  children: [
                    s.element('div', {
                      classes: [arr.has('tox-toolbar__group')],
                      children: [
                        s.element('button', {})
                      ]
                    })
                  ]
                })
              ]
            });
          })
        )),
        NamedChain.read('editor', McagarEditor.cRemove),
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing multiple toolbars: toolbar1: [] and toolbar2: false should create default toolbar', [
      NamedChain.asEffectChain<ETST>()([
        NamedChain.inject(Body.body(), 'body'),
        NamedChain.write(cCreateEditorWithToolbar(true, [], false), 'editor'),
        NamedChain.read('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar')),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.read('toolbar', cAssertIsDefaultToolbar),
        NamedChain.read('editor', McagarEditor.cRemove),
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing multiple toolbars: toolbar25: "bold italic underline" should create default toolbar', [
      NamedChain.asEffectChain<ETST>()([
        NamedChain.inject(Body.body(), 'body'),
        NamedChain.write(cCreateEditorWithToolbar(true, false, false, false, 'bold italic underline'), 'editor'),
        NamedChain.read('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar')),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.read('toolbar', cAssertIsDefaultToolbar),
        NamedChain.read('editor', McagarEditor.cRemove),
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing invalid toolbar type should not create a toolbar at all', [
      NamedChain.asEffectChain<ETST>()([
        NamedChain.inject(Body.body(), 'body'),
        NamedChain.write(cCreateEditorWithToolbar(1), 'editor'),
        NamedChain.read('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar')),
        NamedChain.direct('body', cCountNumber('.tox-toolbar'), 'numToolbars'),
        NamedChain.read('numToolbars', Assertions.cAssertEq('Should be no toolbars', 0)),
        NamedChain.read('editor', McagarEditor.cRemove),
      ])
    ]),

    Log.chainsAsStep('TBA', `Testing toolbar with toolbar group names: toolbar: [ { name: 'history', items: [ 'undo', 'redo' ] }, { name: 'formatting', items: [ 'bold', 'italic' ] } ] should create a "undo redo | bold italic" toolbar`, [
      NamedChain.asEffectChain<ETST>()([
        NamedChain.inject(Body.body(), 'body'),
        NamedChain.write(cCreateEditorWithToolbar([{ name: 'history', items: ['undo', 'redo'] }, { name: 'formatting', items: ['bold', 'italic'] }]), 'editor'),
        NamedChain.read('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar')),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.read('toolbar', Assertions.cAssertStructure(
          'Checking toolbar should have undo, redo, bold and italic',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [arr.has('tox-toolbar')],
              children: [
                s.element('div', {
                  classes: [arr.has('tox-toolbar__group')],
                  attrs: {
                    title: str.is('history')
                  },
                  children: [
                    s.element('button', {}),
                    s.element('button', {})
                  ]
                }),
                s.element('div', {
                  classes: [arr.has('tox-toolbar__group')],
                  attrs: {
                    title: str.is('formatting')
                  },
                  children: [
                    s.element('button', {}),
                    s.element('button', {})
                  ]
                })
              ]
            });
          })
        )),
        NamedChain.read('editor', McagarEditor.cRemove),
      ])
    ])
  ], () => success(), failure);
});
