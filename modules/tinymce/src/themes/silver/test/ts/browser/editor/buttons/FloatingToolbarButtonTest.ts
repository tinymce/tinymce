import { Log, Mouse, NamedChain, Pipeline, UiFinder, Assertions, ApproxStructure } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Editor as McEditor } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';
import { cExtractOnlyOne } from '../../../module/UiChainUtils';

UnitTest.asynctest('FloatingToolbarButtonTest', (success, failure) => {
  Theme();

  Pipeline.async({}, [
    Log.chainsAsStep('TBA', 'Register floating toolbar button via editor settings', [
      NamedChain.asChain([
        NamedChain.writeValue('body', Body.body()),
        NamedChain.write('editor', McEditor.cFromSettings({
          toolbar: 'formatting',
          toolbar_grouped: {
            formatting: {
              icon: 'more-drawer',
              tooltip: 'formatting',
              toolbar: 'bold | italic'
            },
          },
          theme: 'silver',
          base_url: '/project/tinymce/js/tinymce'
        })),
        NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
        NamedChain.read('body', Mouse.cClickOn('button[title="formatting"]')),
        NamedChain.direct('body', cExtractOnlyOne('.tox-toolbar__overflow'), 'floatingToolbar'),
        NamedChain.read('floatingToolbar', Assertions.cAssertStructure(
          'Checking structure of floating toolbar',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox-toolbar__overflow') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('button', {
                      attrs: { title: str.is('Bold')}
                    })
                  ]
                }),
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('button', {
                      attrs: { title: str.is('Italic')}
                    })
                  ]
                }),
              ]
            });
          })
        )),
        NamedChain.read('editor', McEditor.cRemove)
      ])
    ])
  ], success, failure);
});
