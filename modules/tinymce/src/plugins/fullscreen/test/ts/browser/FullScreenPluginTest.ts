import { UiFinder, Assertions, Chain, Guard, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { Cell } from '@ephox/katamari';
import { TinyLoader } from '@ephox/mcagar';
import { Element, Body, Attr, SelectorFind, Html } from '@ephox/sugar';

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
          const dialogLabel = SelectorFind.descendant(dialog, '#' + labelledby).getOrDie('Could not find labelledby');
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

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const lastEventArgs = Cell(null);

    editor.on('FullscreenStateChanged', function (e) {
      lastEventArgs.set(e);
    });

    const cAssertEditorAndLastEvent = (label, state) =>
      Chain.control(
        Chain.fromChains([
          Chain.op(() => Assertions.assertEq('Editor isFullscreen', state, editor.plugins.fullscreen.isFullscreen())),
          Chain.op(() => Assertions.assertEq('FullscreenStateChanged event', state, lastEventArgs.get().state))
        ]),
        Guard.addLogging(label)
      );

    const cAssertFullscreenClass = (label, shouldExist) => {
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

    const cCloseOnlyWindow =  Chain.control(
      Chain.op(() => {
        const dialogs = () => UiFinder.findAllIn(Body.body(), '[role="dialog"]');
        Assertions.assertEq('One window exists', 1, dialogs().length);
        editor.windowManager.close();
        Assertions.assertEq('No windows exist', 0, dialogs().length);
      }),
      Guard.addLogging('Close window')
    );

    Chain.pipeline(
      Log.chains('TBA', 'FullScreen: Toggle fullscreen on, open link dialog, insert link, close dialog and toggle fullscreen off', [
        cAssertFullscreenClass('Before fullscreen command', false),
        Chain.op(() => editor.execCommand('mceFullScreen', true)),
        cAssertEditorAndLastEvent('After fullscreen command', true),
        cAssertFullscreenClass('After fullscreen command', true),
        Chain.op(() => editor.execCommand('mceLink', true)),
        cWaitForDialog('Insert/Edit Link'),
        cCloseOnlyWindow,
        cAssertFullscreenClass('After window is closed', true),
        Chain.op(() => editor.execCommand('mceFullScreen')),
        cAssertEditorAndLastEvent('After fullscreen toggled', false),
        cAssertFullscreenClass('After fullscreen toggled', false),
      ])
    , onSuccess, onFailure);
  }, {
    plugins: 'fullscreen link',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
