import { console, document, setTimeout } from '@ephox/dom-globals';
import { Arr, Fun, Global, Id, Merger, Strings, Type } from '@ephox/katamari';
import { Attr, Element, Insert, Remove, SelectorFilter } from '@ephox/sugar';
import 'tinymce';
import { setTinymceBaseUrl } from '../loader/Urls';

type SuccessCallback = (v: any, logs?) => void;
type FailureCallback = (err: Error | string, logs?) => void;
type SetupCallback = (editor, SuccessCallback, FailureCallback) => void;

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

const setupLight = (callback: SetupCallback, settings: Record<string, any>, success: SuccessCallback, failure: FailureCallback) => {
  const nuSettings = Merger.merge({
    toolbar: '',
    menubar: false,
    statusbar: false
  }, settings);
  setup(callback, nuSettings, success, failure);
};

const setup = (callback: SetupCallback, settings: Record<string, any>, success: SuccessCallback, failure: FailureCallback) => {
  const target = createTarget(settings.inline);
  const randomId = Id.generate('tiny-loader');
  Attr.set(target, 'id', randomId);

  Insert.append(Element.fromDom(document.body), target);

  const teardown = () => {
    tinymce.remove();
    Remove.remove(target);
    removeTinymceElements();
  };

  // Agar v. ??? supports logging
  const onSuccess = (v, logs) => {
    teardown();
    // We may want to continue the logs for multiple editor
    // loads in the same test
    success(v, logs);
  };

  // Agar v. ??? supports logging
  const onFailure = (err: Error | string, logs) => {
    // tslint:disable-next-line:no-console
    console.log('Tiny Loader error: ', err);
    // Do no teardown so that the failed test still shows the editor. Important for selection
    failure(err, logs);
  };

  const settingsSetup = settings.setup !== undefined ? settings.setup : Fun.noop;

  const tinymce = Global.tinymce;
  if (!tinymce) {
    failure('Failed to get global tinymce instance');
  } else {
    if (settings.base_url) {
      setTinymceBaseUrl(tinymce, settings.base_url);
    } else if (!Type.isString(tinymce.baseURL) || !Strings.contains(tinymce.baseURL, '/project/')) {
      setTinymceBaseUrl(Global.tinymce, `/project/node_modules/tinymce`);
    }

    tinymce.init(Merger.merge(settings, {
      selector: '#' + randomId,
      setup (editor) {
        // Execute the setup called by the test.
        settingsSetup(editor);

        editor.on('SkinLoaded', function () {
          setTimeout(function () {
            callback(editor, onSuccess, onFailure);
          }, 0);
        });
      }
    }));
  }
};

export default {
  setup,
  setupLight
};
