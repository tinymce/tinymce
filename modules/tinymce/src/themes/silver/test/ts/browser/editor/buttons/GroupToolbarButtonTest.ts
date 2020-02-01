import { ApproxStructure, Assertions, Chain, Log, Mouse, NamedChain, Pipeline, StructAssert, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Editor as McEditor } from '@ephox/mcagar';
import { Body } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';
import { cExtractOnlyOne } from '../../../module/UiChainUtils';

UnitTest.asynctest('GroupToolbarButtonTest', (success, failure) => {
  Theme();

  const defaultToolbarGroupSettings = {
    toolbar: 'formatting',
    toolbar_groups: {
      formatting: {
        icon: 'more-drawer',
        tooltip: 'Formatting',
        items: 'bold | italic'
      }
    }
  };

  const defaultToolbarGroupStruct = ApproxStructure.build((s, str, arr) => {
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
  });

  const cTestWithEditor = (settings: Record<string, any>, chains: NamedChain[]): Chain<any, any> => {
    return NamedChain.asChain([
      NamedChain.writeValue('body', Body.body()),
      NamedChain.write('editor', McEditor.cFromSettings({
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
        toolbar_mode: 'floating',
        ...settings
      })),
      NamedChain.direct('body', UiFinder.cWaitForVisible('Waiting for menubar', '.tox-menubar'), '_menubar'),
      ...chains,
      NamedChain.read('editor', McEditor.cRemove),
      NamedChain.outputInput
    ]);
  };

  const sTestToolbarGroup = (settings: Record<string, any>, buttonSelector: string, toolbarSelector: string, expectedStruct: StructAssert) => {
    return Chain.asStep({}, [
      cTestWithEditor(settings, [
        NamedChain.read('body', Mouse.cClickOn(buttonSelector)),
        NamedChain.direct('body', cExtractOnlyOne(toolbarSelector), 'toolbarGroup'),
        NamedChain.read('toolbarGroup', Assertions.cAssertStructure(
          'Checking structure of the toolbar group',
          expectedStruct
        ))
      ])
    ]);
  };

  Pipeline.async({}, [
    Log.step('TINY-4229', 'Register floating group toolbar button via editor settings', sTestToolbarGroup(
      defaultToolbarGroupSettings,
      'button[title="Formatting"]',
      '.tox-toolbar__overflow',
      defaultToolbarGroupStruct
    )),
    Log.step('TINY-4229', 'Register floating group toolbar button via editor API', sTestToolbarGroup(
      {
        toolbar: 'alignment',
        setup: (editor) => {
          editor.ui.registry.addGroupToolbarButton('alignment', {
            icon: 'align-left',
            tooltip: 'Alignment',
            items: [
              { name: 'Alignment', items: [ 'alignleft', 'aligncenter', 'alignright' ]}
            ]
          });
        }
      },
      'button[title="Alignment"]',
      '.tox-toolbar__overflow',
      ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('tox-toolbar__overflow') ],
          children: [
            s.element('div', {
              classes: [ arr.has('tox-toolbar__group') ],
              children: [
                s.element('button', {
                  attrs: { title: str.is('Align left')}
                }),
                s.element('button', {
                  attrs: { title: str.is('Align center')}
                }),
                s.element('button', {
                  attrs: { title: str.is('Align right')}
                })
              ]
            })
          ]
        });
      }),
    )),
    Log.step('TINY-4616', 'Group toolbars are ignored when using wrap toolbar mode', Chain.asStep({}, [
      cTestWithEditor({
        ...defaultToolbarGroupSettings,
        toolbar: 'formatting | underline',
        toolbar_mode: 'wrap'
      }, [
        NamedChain.read('body', UiFinder.cNotExists('button[title="Formatting"]')),
        NamedChain.read('body', UiFinder.cExists('button[title="Underline"]')),
      ])
    ]))
  ], success, failure);
});
