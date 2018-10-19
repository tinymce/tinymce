import { Log, Pipeline, UiFinder, NamedChain, Assertions, ApproxStructure } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Editor as McagarEditor } from '@ephox/mcagar';

import '../../../../../../silver/main/ts/Theme';
import { Body } from '@ephox/sugar';
import { Result, Arr, Id } from '@ephox/katamari';
import { cCountNumber, cExtractOnlyOne } from '../../../module/UiChainUtils';

UnitTest.asynctest('Editor (Silver) test', (success, failure) => {
  // Theme();

  const cCreateEditorWithToolbar = (toolbarVal) => McagarEditor.cFromSettings({
    toolbar: toolbarVal,
    theme: 'silver',
    skin_url: '/project/js/tinymce/skins/oxide',
  });

  const cAssertIsDefaultToolbar = Assertions.cAssertStructure(
    'Checking structure of tox-toolbar is "default"',
    ApproxStructure.build((s, str, arr) => {
      return s.element('div', {
        classes: [ arr.has('tox-toolbar') ],
        children: Arr.map([ 1, 2, 3, 4, 5, 6], (_) =>
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
    ])
  ], () => success(), failure);
});