import { Assertions, Chain, Guard, Log, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document, HTMLLabelElement } from '@ephox/dom-globals';
import { Cell } from '@ephox/katamari';
import { Editor as McEditor } from '@ephox/mcagar';
import { Attr, Body, Element, Html, SelectorFind } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

export const cWaitForDialog = (ariaLabel) =>
  Chain.control(
    Chain.fromChainsWith(Body.body(), [
      UiFinder.cWaitFor('Waiting for dialog', '[role="dialog"]'),
      Chain.op((dialog) => {
        if (Attr.has(dialog, 'aria-labelledby')) {
          const labelledby = Attr.get(dialog, 'aria-labelledby');
          const dialogLabel = SelectorFind.descendant<HTMLLabelElement>(dialog, '#' + labelledby).getOrDie('Could not find labelledby');
          Assertions.assertEq('Checking label text', ariaLabel, Html.get(dialogLabel));
        } else {
          throw new Error('Dialog did not have an aria-labelledby');
        }
      })
    ]),
    Guard.addLogging('Looking for dialog with an aria-label: ' + ariaLabel)
  );

UnitTest.asynctest('browser.tinymce.plugins.fullscreen.FullScreenPluginTest', (success, failure) => {
  LinkPlugin();
  FullscreenPlugin();
  SilverTheme();

  const lastEventArgs = Cell(null);

  const cAssertEditorAndLastEvent = (label: string, state: boolean) =>
    Chain.control(
      Chain.fromChains([
        Chain.op((editor) => Assertions.assertEq('Editor isFullscreen', state, editor.plugins.fullscreen.isFullscreen())),
        Chain.op(() => Assertions.assertEq('FullscreenStateChanged event', state, lastEventArgs.get().state))
      ]),
      Guard.addLogging(label)
    );

  const cAssertFullscreenClass = (label: string, shouldExist: boolean) => {
    const selector = shouldExist ? 'root:.tox-fullscreen' : 'root::not(.tox-fullscreen)';
    const label2 = `Body and Html should ${shouldExist ? '' : 'not '}have "tox-fullscreen" class`;
    return Chain.control(
      Chain.fromChains([
        Chain.inject(Body.body()),
        UiFinder.cFindIn(selector),
        Chain.inject(Element.fromDom(document.documentElement)),
        UiFinder.cFindIn(selector)
      ]),
      Guard.addLogging(`${label}: ${label2}`)
    );
  };

  const cCloseOnlyWindow = Chain.control(
    Chain.op((editor: Editor) => {
      const dialogs = () => UiFinder.findAllIn(Body.body(), '[role="dialog"]');
      Assertions.assertEq('One window exists', 1, dialogs().length);
      editor.windowManager.close();
      Assertions.assertEq('No windows exist', 0, dialogs().length);
    }),
    Guard.addLogging('Close window')
  );

  const cSetupEditor = McEditor.cFromSettings({
    plugins: 'fullscreen link',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      lastEventArgs.set(null);
      editor.on('FullscreenStateChanged', (e: Editor) => {
        lastEventArgs.set(e);
      });
    }
  });

  Pipeline.async({}, [
    Log.chainsAsStep('TBA', 'FullScreen: Toggle fullscreen on, open link dialog, insert link, close dialog and toggle fullscreen off', [
      cSetupEditor,
      Chain.fromParent(Chain.identity, [
        cAssertFullscreenClass('Before fullscreen command', false),
        Chain.op((editor: Editor) => editor.execCommand('mceFullScreen', true)),
        cAssertEditorAndLastEvent('After fullscreen command', true),
        cAssertFullscreenClass('After fullscreen command', true),
        Chain.op((editor: Editor) => editor.execCommand('mceLink', true)),
        cWaitForDialog('Insert/Edit Link'),
        cCloseOnlyWindow,
        cAssertFullscreenClass('After window is closed', true),
        Chain.op((editor: Editor) => editor.execCommand('mceFullScreen')),
        cAssertEditorAndLastEvent('After fullscreen toggled', false),
        cAssertFullscreenClass('After fullscreen toggled', false)
      ]),
      McEditor.cRemove
    ]),
    Log.chainsAsStep('TBA', 'FullScreen: Toggle fullscreen and remove editor should clean up classes', [
      cSetupEditor,
      Chain.fromParent(Chain.identity, [
        Chain.op((editor: Editor) => editor.execCommand('mceFullScreen', true)),
        cAssertEditorAndLastEvent('After fullscreen command', true),
        cAssertFullscreenClass('After fullscreen command', true)
      ]),
      McEditor.cRemove,
      cAssertFullscreenClass('After editor is closed', false)
    ])
  ], success, failure);
});
