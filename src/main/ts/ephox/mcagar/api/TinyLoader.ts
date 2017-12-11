import { Fun } from '@ephox/katamari';
import { Id } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';
import { Insert } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Attr } from '@ephox/sugar';
import 'tinymce';

declare const tinymce: any;

tinymce.baseURL = '/project/node_modules/tinymce';

var createTarget = function (inline) {
  var target = Element.fromTag(inline ? 'div' : 'textarea');
  return target;
};

var setup = function (callback, settings, success, failure) {
  var target = createTarget(settings.inline);
  var randomId = Id.generate('tiny-loader');
  Attr.set(target, 'id', randomId);

  Insert.append(Element.fromDom(document.body), target);

  var teardown = function () {
    tinymce.remove();
    Remove.remove(target);
  };

  var onSuccess = function () {
    teardown();
    success();
  };

  var onFailure = function (err) {
    console.log('Tiny Loader error: ', err);
    // Do no teardown so that the failed test still shows the editor. Important for selection
    failure(err);
  };

  var settingsSetup = settings.setup !== undefined ? settings.setup : Fun.noop;

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
};

export default <any> {
  setup: setup
};