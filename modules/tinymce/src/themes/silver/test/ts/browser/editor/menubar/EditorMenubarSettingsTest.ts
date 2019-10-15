import { Log, Pipeline, UiFinder, NamedChain, Assertions, ApproxStructure } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Result, Arr, Id } from '@ephox/katamari';
import { Editor as McagarEditor } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';

import SilverTheme from 'tinymce/themes/silver/Theme';
import { cExtractOnlyOne, cCountNumber } from '../../../module/UiChainUtils';

UnitTest.asynctest('Editor (Silver) test', (success, failure) => {
  SilverTheme();

  const cCreateEditorWithMenubar = (menubar) => McagarEditor.cFromSettings({
    menubar,
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
  });

  const cAssertIsDefaultMenubar = Assertions.cAssertStructure(
    'Checking structure of tox-menubar is "default"',
    ApproxStructure.build((s, str, arr) => {
      return s.element('div', {
        classes: [ arr.has('tox-menubar') ],
        children: Arr.map([ 'File', 'Edit', 'View', 'Format' ], (x) =>
          s.element('button', {
            children: [
              s.element('span', {
                html: str.is(x)
              }),
              // chevron
              s.element('div', { })
            ]
          })
        )
      });
    })
  );

  Pipeline.async({}, [
    Log.chainsAsStep('TBA', 'Testing menubar: false should not create menubar at all', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithMenubar(false)),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for container', '.tox-tinymce'), '_tiny'),
        NamedChain.direct('body', cCountNumber('.tox-menubar'), 'numMenubars'),
        NamedChain.direct('numMenubars', Assertions.cAssertEq('Should be no menubars', 0), Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing menubar: true should create default menubar', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithMenubar(true)),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-menubar'), 'menubar'),
        NamedChain.direct('menubar', cAssertIsDefaultMenubar, Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing menubar: undefined should create default menubar', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithMenubar(undefined)),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-menubar'), 'menubar'),
        NamedChain.direct('menubar', cAssertIsDefaultMenubar, Id.generate('')),
        NamedChain.direct('editor', McagarEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ]),

    Log.chainsAsStep('TBA', 'Testing menubar: "file edit" should create "file edit" menubar', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', cCreateEditorWithMenubar('file edit')),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-menubar'), 'menubar'),
        NamedChain.direct('menubar', Assertions.cAssertStructure(
          'Checking menubar should have just file and edit',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox-menubar') ],
              children: [
                s.element('button', { }),
                s.element('button', { })
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
