import { TestLogs } from '@ephox/agar';
import { console, document, setTimeout } from '@ephox/dom-globals';
import { Arr, Fun, Global, Id } from '@ephox/katamari';
import { Attr, Element, Insert, Remove, SelectorFilter } from '@ephox/sugar';

export type SuccessCallback = (v?: any, logs?: TestLogs) => void;
export type FailureCallback = (err: Error | string, logs?) => void;
export type RunCallback = (editor: any, SuccessCallback, FailureCallback) => void;

interface Callbacks {
  preInit: (tinymce: any, settings: Record<string, any>) => void;
  run: RunCallback;
  success: SuccessCallback;
  failure: FailureCallback;
}

const createTarget = function (inline: boolean) {
  const target = Element.fromTag(inline ? 'div' : 'textarea');
  return target;
};

const removeTinymceElements = () => {
  // NOTE: Don't remove the link/scripts added, as those are part of the global tinymce which we don't clean up
  const elements = Arr.flatten([
    // Some older versions of tinymce leaves elements behind in the dom
    SelectorFilter.all('.mce-notification,.mce-window,#mce-modal-block'),
    // TinyMCE leaves inline editor content_styles in the dom
    SelectorFilter.children(Element.fromDom(document.head), 'style')
  ]);

  Arr.each(elements, Remove.remove);
};

const setup = (callbacks: Callbacks, settings: Record<string, any>) => {
  const nuSettings: Record<string, any> = {
    toolbar_drawer: false,
    ...settings
  };

  const target = createTarget(nuSettings.inline);
  const randomId = Id.generate('tiny-loader');
  Attr.set(target, 'id', randomId);

  Insert.append(Element.fromDom(document.body), target);

  const teardown = () => {
    tinymce.remove();
    Remove.remove(target);
    removeTinymceElements();
  };

  // Agar v. ??? supports logging
  const onSuccess = (v?: any, logs?: TestLogs) => {
    teardown();
    // We may want to continue the logs for multiple editor
    // loads in the same test
    callbacks.success(v, logs);
  };

  // Agar v. ??? supports logging
  const onFailure = (err: Error | string, logs) => {
    // tslint:disable-next-line:no-console
    console.log('Tiny Loader error: ', err);
    // Do no teardown so that the failed test still shows the editor. Important for selection
    callbacks.failure(err, logs);
  };

  const settingsSetup = nuSettings.setup !== undefined ? nuSettings.setup : Fun.noop;

  const tinymce = Global.tinymce;
  if (!tinymce) {
    callbacks.failure('Failed to get global tinymce instance');
  } else {
    callbacks.preInit(tinymce, settings);

    tinymce.init({
      ...nuSettings,
      selector: '#' + randomId,
      setup (editor) {
        // Execute the setup called by the test.
        settingsSetup(editor);

        editor.on('SkinLoaded', function () {
          setTimeout(function () {
            callbacks.run(editor, onSuccess, onFailure);
          }, 0);
        });
      }
    });
  }
};

export {
  setup
};
