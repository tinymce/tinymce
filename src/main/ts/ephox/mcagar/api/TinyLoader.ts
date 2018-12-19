import { Fun } from '@ephox/katamari';
import { Id } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Insert } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Attr } from '@ephox/sugar';
import { document, console, setTimeout } from '@ephox/dom-globals';
import 'tinymce';
import { getTinymce } from '../loader/Globals';
import * as TinyVersions from './TinyVersions';
import { updateTinymceUrls, setTinymceBaseUrl } from '../loader/Urls';
import { Step, Pipeline } from '@ephox/agar';
import { registerPlugins, readPlugins, sRegisterPlugins } from '../loader/Plugins';

type SuccessCallback = (v: any, logs?) => void;
type FailureCallback = (err: Error | string, logs?) => void;
type SetupCallback = (editor, SuccessCallback, FailureCallback) => void;
type SetupCallbackStep = <T, U>(editor) => Step<T, U>;

const createTarget = function (inline: boolean) {
  const target = Element.fromTag(inline ? 'div' : 'textarea');
  return target;
};

updateTinymceUrls('tinymce');

const setup = (callback: SetupCallback, settings: Record<string, any>, success: SuccessCallback, failure: FailureCallback) => {
  const target = createTarget(settings.inline);
  const randomId = Id.generate('tiny-loader');
  Attr.set(target, 'id', randomId);

  Insert.append(Element.fromDom(document.body), target);

  const teardown = () => {
    getTinymce().each((tinymce) => tinymce.remove());
    Remove.remove(target);
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
    console.log('Tiny Loader error: ', err);
    // Do no teardown so that the failed test still shows the editor. Important for selection
    failure(err, logs);
  };

  const settingsSetup = settings.setup !== undefined ? settings.setup : Fun.noop;

  getTinymce().fold(
    () => failure('Failed to get global tinymce instance'),
    (tinymce) => {
      if (settings.base_url) {
        setTinymceBaseUrl(tinymce, settings.base_url);
      }

      tinymce.init(Merger.merge(settings, {
        selector: '#' + randomId,
        setup: function(editor) {
          // Execute the setup called by the test.
          settingsSetup(editor);

          editor.on('SkinLoaded', function () {
            setTimeout(function() {
              callback(editor, onSuccess, onFailure);
            }, 0);
          });
        }
      }));
    }
  );
};

const setupVersion = (version: string, testPlugins: string[], callback: SetupCallback, settings: Record<string, any>, success: SuccessCallback, failure: FailureCallback) => {
  const plugins = readPlugins(testPlugins);

  Pipeline.async({}, [
    TinyVersions.sWithVersion(version, Step.async((next, die) => {
      registerPlugins(plugins);
      setup(callback, settings, next, die);
    })),
    sRegisterPlugins(plugins)
  ], success, failure);
};

const sSetupVersion = <T, U>(version: string, testPlugins: string[], callback: SetupCallbackStep, settings: Record<string, any>) => {
  return Step.async((next, die) => {
    return setupVersion(version, testPlugins, (editor, onSuccess, onError) => {
      Pipeline.async({}, [ callback(editor) ], onSuccess, onError);
    }, settings, next, die);
  })
};

export default {
  setup,
  setupVersion,
  sSetupVersion
};
