import { TestLogs } from '@ephox/agar';
import { console, document, setTimeout } from '@ephox/dom-globals';
import { Arr, Fun, Global, Id, Option } from '@ephox/katamari';
import { Attr, Body, Element, Insert, Remove, SelectorFilter, ShadowDom } from '@ephox/sugar';
import { Editor } from '../alien/EditorTypes';

export type SuccessCallback = (v?: any, logs?: TestLogs) => void;
export type FailureCallback = (err: Error | string, logs?: TestLogs) => void;
export type RunCallback = (editor: any, success: SuccessCallback, failure: FailureCallback) => void;

interface Callbacks {
  preInit: (tinymce: any, settings: Record<string, any>) => void;
  run: RunCallback;
  success: SuccessCallback;
  failure: FailureCallback;
}

const createTarget = (inline: boolean) => Element.fromTag(inline ? 'div' : 'textarea');

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

const setup = (callbacks: Callbacks, settings: Record<string, any>, elementOpt: Option<Element>) => {
  const target = elementOpt.getOrThunk(() => createTarget(settings.inline));
  const randomId = Id.generate('tiny-loader');
  Attr.set(target, 'id', randomId);

  if (!Body.inBody(target)) {
    Insert.append(Body.body(), target);
  }

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
  const onFailure = (err: Error | string, logs?: TestLogs) => {
    // tslint:disable-next-line:no-console
    console.log('Tiny Loader error: ', err);
    // Do no teardown so that the failed test still shows the editor. Important for selection
    callbacks.failure(err, logs);
  };

  const settingsSetup = settings.setup !== undefined ? settings.setup : Fun.noop;

  const tinymce = Global.tinymce;
  if (!tinymce) {
    callbacks.failure('Failed to get global tinymce instance');
  } else {
    callbacks.preInit(tinymce, settings);

    const targetSettings = ShadowDom.isInShadowRoot(target) ? ({ target: target.dom() }) : ({ selector: '#' + randomId });

    tinymce.init({
      ...settings,
      ...targetSettings,
      setup(editor: Editor) {
        // Execute the setup called by the test.
        settingsSetup(editor);

        editor.on('SkinLoaded', () => {
          setTimeout(function () {
            try {
              callbacks.run(editor, onSuccess, onFailure);
            } catch (e) {
              onFailure(e);
            }
          }, 0);
        });

        editor.on('SkinLoadError', (e) => {
          callbacks.failure(e.message);
        });
      }
    });
  }
};

export {
  setup
};
