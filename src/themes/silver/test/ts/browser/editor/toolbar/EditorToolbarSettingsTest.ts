import { Log, Pipeline, UiFinder, NamedChain, Assertions, ApproxStructure } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Editor as McagarEditor } from '@ephox/mcagar';

import '../../../../../../silver/main/ts/Theme';
import { Body } from '@ephox/sugar';
import { Result, Arr, Id } from '@ephox/katamari';
import { cCountNumber, cExtractOnlyOne } from '../../../module/UiChainUtils';

UnitTest.asynctest('Editor (Silver) test', (success, failure) => {
  // Theme();

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
        classes: [ arr.has('tox-toolbar') ],
        children: Arr.map([ 1, 2, 3, 4, 5], (_) => // Technically meant to be 6 groups by default but the link and image plugins aren't loaded here so whatever
          s.element('div', { classes: [ arr.has('tox-toolbar__group') ] }))
      });
    })
  );

  Pipeline.async({}, [
    Log.chainsAsStep('TBA', 'Testing toolbar: false should not create toolbar at all', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithToolbar(false)),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cCountNumber('.tox-toolbar'), 'numToolbars'),
        NamedChain.direct('numToolbars', Assertions.cAssertEq('Should be no toolbars', 0), Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing toolbar: true should create default toolbar', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithToolbar(true)),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.direct('toolbar', cAssertIsDefaultToolbar, Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing toolbar: undefined should create default toolbar', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithToolbar(undefined)),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.direct('toolbar', cAssertIsDefaultToolbar, Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing toolbar: "bold italic" should create "bold italic" toolbar', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithToolbar('bold italic')),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.direct('toolbar', Assertions.cAssertStructure(
          'Checking toolbar should have just bold and italic',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox-toolbar') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('button', { }),
                    s.element('button', { })
                  ]
                })
              ]
            });
          })
        ), Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing toolbar: "bold italic | stufffffed | strikethrough underline" should create "bold italic | strikethrough underline" toolbar', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithToolbar('bold italic | stufffffed | strikethrough underline')),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.direct('toolbar', Assertions.cAssertStructure(
          'Checking toolbar should have just bold and italic',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox-toolbar') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('button', { }),
                    s.element('button', { })
                  ]
                }),
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('button', { }),
                    s.element('button', { })
                  ]
                })
              ]
            });
          })
        ), Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing toolbar: ["bold italic", "underline"] should create "bold italic | underline" toolbar', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithToolbar(['bold italic', 'underline'])),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.direct('toolbar', Assertions.cAssertStructure(
          'Checking toolbar should have just bold italic and underline',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox-toolbar') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('button', { }),
                    s.element('button', { })
                  ]
                }),
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('button', { })
                  ]
                })
              ]
            });
          })
        ), Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing toolbar: ["bold"] should create "bold" toolbar', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithToolbar(['bold'])),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.direct('toolbar', Assertions.cAssertStructure(
          'Checking toolbar should have just bold and italic',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox-toolbar') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('button', { })
                  ]
                })
              ]
            });
          })
        ), Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing toolbar: empty array should not create toolbar at all', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithToolbar([])),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cCountNumber('.tox-toolbar'), 'numToolbars'),
        NamedChain.direct('numToolbars', Assertions.cAssertEq('Should be no toolbars', 0), Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing multiple toolbars: toolbar: "link", toolbar1: "bold italic underline" and toolbar2: "strikethrough" should create "bold italic underline | strikethrough" toolbar', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithToolbar('link', 'bold italic underline', 'strikethrough')),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.direct('toolbar', Assertions.cAssertStructure(
          'Checking toolbar should have just bold and italic',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox-toolbar') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('button', { }),
                    s.element('button', { }),
                    s.element('button', { })
                  ]
                }),
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('button', { })
                  ]
                })
              ]
            });
          })
        ), Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing multiple toolbars: toolbar1: "bold italic underline" and toolbar2: ["strikethrough"] should create "bold italic underline" toolbar and ignore toolbar2', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithToolbar(true, 'bold italic underline', ['strikethrough'])),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.direct('toolbar', Assertions.cAssertStructure(
          'Checking toolbar should have just bold and italic',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox-toolbar') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('button', { }),
                    s.element('button', { }),
                    s.element('button', { })
                  ]
                })
              ]
            });
          })
        ), Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing multiple toolbars: toolbar: false and toolbar2: "bold italic" should create "bold italic" toolbar and ignore toolbar', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithToolbar(false, false, 'bold italic')),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.direct('toolbar', Assertions.cAssertStructure(
          'Checking toolbar should have just bold and italic',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox-toolbar') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('button', { }),
                    s.element('button', { })
                  ]
                })
              ]
            });
          })
        ), Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing multiple toolbars: toolbar: empty array and toolbar1: "bold italic" and toolbar2: "strikethrough" should create "bold italic | strikethrough" toolbar and ignore toolbar', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithToolbar([], 'bold italic', 'strikethrough')),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.direct('toolbar', Assertions.cAssertStructure(
          'Checking toolbar should have just bold and italic',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox-toolbar') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('button', { }),
                    s.element('button', { })
                  ]
                }),
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('button', { })
                  ]
                })
              ]
            });
          })
        ), Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing multiple toolbars: toolbar1: false and toolbar2: "bold italic underline" should create "bold italic underline toolbar and ignore toolbar1', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithToolbar(true, false, 'bold italic underline')),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.direct('toolbar', Assertions.cAssertStructure(
          'Checking toolbar should have just bold and italic',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox-toolbar') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('button', { }),
                    s.element('button', { }),
                    s.element('button', { })
                  ]
                })
              ]
            });
          })
        ), Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing multiple toolbars: toolbar1: "bold italic underline" and toolbar9: "strikethrough" should create "bold italic underline | strikethrough" toolbar', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithToolbar(true, 'bold italic underline', false, 'strikethrough')),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.direct('toolbar', Assertions.cAssertStructure(
          'Checking toolbar should have just bold and italic',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox-toolbar') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('button', { }),
                    s.element('button', { }),
                    s.element('button', { })
                  ]
                }),
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('button', { })
                  ]
                })
              ]
            });
          })
        ), Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing multiple toolbars: toolbar1: [] and toolbar2: false should create default toolbar', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithToolbar(true, [], false)),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.direct('toolbar', cAssertIsDefaultToolbar, Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing multiple toolbars: toolbar25: "bold italic underline" should create default toolbar', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithToolbar(true, false, false, false, 'bold italic underline')),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.direct('toolbar', cAssertIsDefaultToolbar, Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ])
  ], () => success(), failure);
});