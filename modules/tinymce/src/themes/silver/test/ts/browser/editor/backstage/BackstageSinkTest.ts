import { Assertions, Keyboard, Keys, Mouse, UiFinder } from '@ephox/agar';
import { AlloyComponent, Attachment, Behaviour, Gui, GuiFactory, Positioning, Representing } from '@ephox/alloy';
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { Fun, Optional, Result } from '@ephox/katamari';
import { Classes, SugarBody, Traverse } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import * as Backstage from 'tinymce/themes/silver/backstage/Backstage';
import * as Options from 'tinymce/themes/silver/ui/core/color/Options';

describe('browser.tinymce.themes.silver.editor.backstage.BackstageSinkTest', () => {
  // We setup an editor without a complete silver theme, so that we can
  // test backstage more directly. Because there isn't a theme, we need to
  // do a few things
  //  (1) register the options that the colorinput uses. This is because this test
  // is checking the backstage instance passed into the ui factory interpreter, and
  // colorinput was the component chosen for testing that. URLInput would have been another,
  // or just a menu button. The chosen component just needs to use the sink.
  //  (2) load the oxide skin. The colorinput relies on some pseudo elements for size,
  // so we need the skin
  //  (3) dispatch "SkinLoaded" event. This is required for the mcagar loader to consider
  // that the editor is ready for testing. Without this, the test won't complete.
  //
  // NOTE: If this approach is causing problems, we can just load silver normally, and create a duplicate
  // backstage, but this approach removes the number of extraneous elements.
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      Options.register(ed);
      ed.on('init', () => {
        const skinUrl = EditorManager.baseURL + '/skins/ui/oxide/skin.min.css';
        ed.ui.styleSheetLoader.load(skinUrl).then(
          () => {
            ed.dispatch('SkinLoaded');
          }
        );
      });
    },
    theme: false
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

  const buildAndAddColorInput = (backstage: Backstage.UiFactoryBackstage): AlloyComponent => {
    const colorInputSpec = backstage.shared.interpreter({
      type: 'colorinput',
      label: Optional.some('color'),
      storageKey: 'test_storage_key',
      name: 'color'
    });

    const colorInputComp = GuiFactory.build(colorInputSpec);
    mothership.add(colorInputComp);
    Representing.setValue(colorInputComp, '#000000');
    return colorInputComp;
  };

  const assertCompEmpty = (label: string, comp: AlloyComponent) => {
    Assertions.assertEq(
      `Ensure that ${label} is empty`,
      0,
      Traverse.childNodesCount(comp.element)
    );
  };

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
        it('getSink', () => {
          const backstage = lazyBackstages().popup;

          const actual = backstage.shared.getSink().getOrDie();
          Assertions.assertEq(
            'Checking class list of popup sink',
            [ 'popup-sink', 'backstage-test-sink' ],
            Classes.get(actual.element)
          );
        });

        it('backstage sink being used by colorinput', async () => {
          const backstage = lazyBackstages().popup;

          const colorInputComp = buildAndAddColorInput(backstage);

          // Check that the sink is empty first.
          assertCompEmpty('Popup sink', popupSink);

          // Now, trigger the color inputs dropdown picker, and check it appears in popup sink.
          Mouse.clickOn(mothership.element, '[aria-label="Color swatch"]');
          const swatch = await UiFinder.pWaitFor<Element>(
            'Waiting for color picker in popup sink',
            popupSink.element,
            '.tox-swatch'
          );

          // Close the color picker.
          Keyboard.keystroke(Keys.escape(), { }, swatch);

          // Check that the sink is empty again, because the picker has closed
          assertCompEmpty('Popup sink', popupSink);

          mothership.remove(colorInputComp);
        });
      });

      context('backstage - dialog', () => {
        it('getSink', () => {
          const backstage = lazyBackstages().dialog;

          const actual = backstage.shared.getSink().getOrDie();
          Assertions.assertEq(
            'Checking class list of dialog sink',
            [ 'dialog-sink', 'backstage-test-sink' ],
            Classes.get(actual.element)
          );
        });

        it('backstage sink being used by colorinput', async () => {
          // The colorinput uses getSink
          const backstage = lazyBackstages().dialog;

          const colorInputComp = buildAndAddColorInput(backstage);

          // Check that the sink is empty first.
          assertCompEmpty('Dialog sink', dialogSink);

          // Now, trigger its dropdown, and check which sink it is appearing inside.
          Mouse.clickOn(mothership.element, '[aria-label="Color swatch"]');
          const swatch = await UiFinder.pWaitFor<Element>(
            'Waiting for color picker in dialog sink',
            dialogSink.element,
            '.tox-swatch'
          );

          // Close the color picker.
          Keyboard.keystroke(Keys.escape(), { }, swatch);

          // Check that the sink is empty again, because the picker has closed
          assertCompEmpty('Dialog sink', dialogSink);

          mothership.remove(colorInputComp);
        });
      });
    });
  });
});
