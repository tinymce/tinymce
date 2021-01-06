import { TestLogs } from '@ephox/agar';
import { Arr, Fun, Global, Id, Optional } from '@ephox/katamari';
import { Attribute, Insert, Remove, SelectorFilter, SugarBody, SugarElement, SugarShadowDom } from '@ephox/sugar';
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

const createTarget = (inline: boolean) => SugarElement.fromTag(inline ? 'div' : 'textarea');

const removeTinymceElements = () => {
  // NOTE: Don't remove the link/scripts added, as those are part of the global tinymce which we don't clean up
  const elements = Arr.flatten([
    // Some older versions of tinymce leaves elements behind in the dom
    SelectorFilter.all('.mce-notification,.mce-window,#mce-modal-block'),
    // TinyMCE leaves inline editor content_styles in the dom
    SelectorFilter.children(SugarElement.fromDom(document.head), 'style')
  ]);

  Arr.each(elements, Remove.remove);
};

const setup = (callbacks: Callbacks, settings: Record<string, any>, elementOpt: Optional<SugarElement>): void => {
  const target = elementOpt.getOrThunk(() => createTarget(settings.inline));
  const randomId = Id.generate('tiny-loader');
  Attribute.set(target, 'id', randomId);

  if (!SugarBody.inBody(target)) {
    Insert.append(SugarBody.body(), target);
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
    // eslint-disable-next-line no-console
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

    const targetSettings = SugarShadowDom.isInShadowRoot(target) ? ({ target: target.dom }) : ({ selector: '#' + randomId });

    tinymce.init({
      ...settings,
      ...targetSettings,
      setup: (editor: Editor) => {
        // Execute the setup called by the test.
        settingsSetup(editor);

        editor.once('SkinLoaded', () => {
          setTimeout(() => {
            try {
              callbacks.run(editor, onSuccess, onFailure);
            } catch (e) {
              onFailure(e);
            }
          }, 0);
        });

        editor.once('SkinLoadError', (e) => {
          callbacks.failure(e.message);
        });
      }
    });
  }
};

export {
  setup
};
