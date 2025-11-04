import { Attachment, Behaviour, Gui, GuiFactory, Positioning } from '@ephox/alloy';
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { Fun, Result } from '@ephox/katamari';
import { Classes, SugarBody } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import * as Backstage from 'tinymce/themes/silver/backstage/Backstage';

describe('browser.tinymce.themes.silver.editor.backstage.BackstageSinkTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, [], true);

  const buildSink = (extraClass: string) => GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ extraClass, 'backstage-test-sink' ]
    },
    behaviours: Behaviour.derive([
      Positioning.config({})
    ])
  });

  const popupSink = buildSink('popup-sink');
  const dialogSink = buildSink('dialog-sink');

  const mothership = Gui.create();
  Classes.add(mothership.element, [ 'tox' ]);
  mothership.add(popupSink);
  mothership.add(dialogSink);

  before(() => {
    Attachment.attachSystem(SugarBody.body(), mothership);
  });

  after(() => {
    Attachment.detachSystem(mothership);
    mothership.destroy();
  });

  context('themeless - init', () => {
    context('testing sinks', () => {
      let lazyBackstages: () => Backstage.UiFactoryBackstagePair = Fun.die(
        'backstages have not yet been setup'
      );

      before(() => {
        const editor = hook.editor();
        lazyBackstages = () => Backstage.init(
          {
            popup: () => Result.value(popupSink),
            dialog: () => Result.value(dialogSink)
          },
          editor,
          Fun.die('No lazy bottom anchor bar in this test'),
          Fun.die('No lazy anchor bar in this test')
        );
      });

      context('backstage - popup', () => {
        it('TINY-11211: Backstage test', async () => {
          const editor = hook.editor();
          editor.mode.register('testmode', {
            activate: Fun.noop,
            deactivate: Fun.noop,
            editorReadOnly: true
          });

          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('mode:design'), { contextType: 'mode', shouldDisable: false });
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('mode:readonly'), { contextType: 'mode', shouldDisable: true });
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('any'), { contextType: 'any', shouldDisable: false });
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('mode:!design'), { contextType: 'mode', shouldDisable: true });
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('mode:!readonly'), { contextType: 'mode', shouldDisable: false });
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('mode:!random'), { contextType: 'mode', shouldDisable: false });

          editor.mode.set('readonly');
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('mode:design'), { contextType: 'mode', shouldDisable: true });
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('mode:readonly'), { contextType: 'mode', shouldDisable: false });
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('mode:!design'), { contextType: 'mode', shouldDisable: false });
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('mode:!readonly'), { contextType: 'mode', shouldDisable: true });
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('mode:!random'), { contextType: 'mode', shouldDisable: false });

          editor.mode.set('testmode');
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('mode:design'), { contextType: 'mode', shouldDisable: true });
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('mode:readonly'), { contextType: 'mode', shouldDisable: true });
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('any'), { contextType: 'any', shouldDisable: false });
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('mode:!design'), { contextType: 'mode', shouldDisable: false });
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('mode:!readonly'), { contextType: 'mode', shouldDisable: false });
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('mode:!random'), { contextType: 'mode', shouldDisable: false });
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('mode:!testmode'), { contextType: 'mode', shouldDisable: true });
        });

        it('TINY-13143: Handle multiple context entries', async () => {
          const editor = hook.editor();
          editor.ui.registry.addContext('context_1', (value) => value === 'test');
          editor.ui.registry.addContext( 'context_2', (value) => value === 'test');

          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('context_1:test,context_2:test'), { contextType: 'context_1,context_2', shouldDisable: false });

          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('context_1:test,context_2:test2'), { contextType: 'context_1,context_2', shouldDisable: true });

          // Ignore empty entry
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('context_1:test,,context_2:test2,'), { contextType: 'context_1,context_2', shouldDisable: true });

          // context_3 is not registered so it is reasonable to expect shouldDisabled:true
          // However, because of the current logic, any unfound context is assumed as mode:design
          assert.deepEqual(lazyBackstages().popup.shared.providers.checkUiComponentContext('context_1:test,context_2:test,context_3:test'), { contextType: 'context_1,context_2,context_3', shouldDisable: false });
        });
      });
    });
  });
});
