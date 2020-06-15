import { ApproxStructure, Assertions, Log, NamedChain, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Id, Result } from '@ephox/katamari';
import { Editor as McEditor } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';

import Theme from 'tinymce/themes/silver/Theme';
import { cExtractOnlyOne } from '../../../module/UiChainUtils';

UnitTest.asynctest('Editor alignment toolbar buttons test', (success, failure) => {
  Theme();

  Pipeline.async({}, [
    Log.chainsAsStep('TBA', 'Testing toolbar: toolbar alignment buttons', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', McEditor.cFromSettings({
          toolbar: 'alignleft aligncenter alignright alignjustify alignnone',
          theme: 'silver',
          base_url: '/project/tinymce/js/tinymce'
        })),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar'), 'toolbar'),
        NamedChain.direct('toolbar', Assertions.cAssertStructure(
          'Checking toolbar should have just alignment buttons',
          ApproxStructure.build((s, str, arr) => s.element('div', {
            classes: [ arr.has('tox-toolbar') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-toolbar__group') ],
                children: [
                  s.element('button', {
                    attrs: { title: str.is('Align left') }
                  }),
                  s.element('button', {
                    attrs: { title: str.is('Align center') }
                  }),
                  s.element('button', {
                    attrs: { title: str.is('Align right') }
                  }),
                  s.element('button', {
                    attrs: { title: str.is('Justify') }
                  }),
                  s.element('button', {
                    attrs: { title: str.is('No alignment') }
                  })
                ]
              })
            ]
          }))
        ), Id.generate('')),
        NamedChain.direct('editor', McEditor.cRemove, Id.generate('')),
        NamedChain.bundle(Result.value)
      ])
    ])
  ], success, failure);
});
