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
import { updateTinymceUrls } from '../loader/Urls';
import { Step, Pipeline } from '@ephox/agar';

type SuccessCallback = () => void;
type FailureCallback = (err: Error | string) => void;
type SetupCallback = (editor, SuccessCallback, FailureCallback) => void;

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

  const onSuccess = () => {
    teardown();
    success();
  };

  const onFailure = (err: Error | string) => {
    console.log('Tiny Loader error: ', err);
    // Do no teardown so that the failed test still shows the editor. Important for selection
    failure(err);
  };

  const settingsSetup = settings.setup !== undefined ? settings.setup : Fun.noop;

  getTinymce().fold(
    () => failure('Failed to get global tinymce instance'),
    (tinymce) => {
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

const setupVersion = (version: string, callback: SetupCallback, settings: Record<string, any>, success: SuccessCallback, failure: FailureCallback) => {
  Pipeline.async({}, [
    TinyVersions.sWithVersion(version, Step.async((next, die) => {
      setup(callback, settings, next, die);
    }))
  ], success, failure);
};

export default {
  setup,
  setupVersion
};
