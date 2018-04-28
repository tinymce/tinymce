import { Arr, Fun, Obj } from '@ephox/katamari';

import TinyChannels from '../channels/TinyChannels';

const fontSizes = [ 'x-small', 'small', 'medium', 'large', 'x-large' ];

const fireChange = function (realm, command, state) {
  realm.system().broadcastOn([ TinyChannels.formatChanged() ], {
    command,
    state
  });
};

const init = function (realm, editor) {
  const allFormats = Obj.keys(editor.formatter.get());
  Arr.each(allFormats, function (command) {
    editor.formatter.formatChanged(command, function (state) {
      fireChange(realm, command, state);
    });
  });

  Arr.each([ 'ul', 'ol' ], function (command) {
    editor.selection.selectorChanged(command, function (state, data) {
      fireChange(realm, command, state);
    });
  });
};

export default {
  init,
  fontSizes: Fun.constant(fontSizes)
};