/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun } from '@ephox/katamari';
import { Element, Focus, Node } from '@ephox/sugar';
import Delay from 'tinymce/core/api/util/Delay';

// There are numerous problems with Google Keyboard when we need to switch focus back from a toolbar item / dialog to
// the content for editing. The major problem is to do with autocomplete. Android Google Keyboard (not Swift) seems to
// remember the things that you've typed into the input, and then adds them to whatever you type in the content once you give it
// focus, as long as the keyboard has stayed up.

// We tried turning autocomplete off, and then turning it back on again with a setTimeout, and although it fixed the problem,
// the autcomplete on didn't start working immediately. Maurizio also pointed out that it was probably keyboard specific
// (and he was right) autocomplete off, and then turn it back on in an attempt to stop this happening. It works, but the
// autocomplete on part takes a while to start working again.

// Then we tried everyone's favourite setTimeout solution. This appears to work because it looks like the bug might
// be caused by the fact that the autocomplete cache is maintained while in the same event queue. As soon as we
// disconnect the stack, it looks like it is fixed. That makes some level of sense.
const autocompleteHack = function (/* iBody */) {
  return function (f) {
    Delay.setTimeout(function () {
      f();
    }, 0);
  };
};

const resume = function (cWin) {
  cWin.focus();
  const iBody = Element.fromDom(cWin.document.body);

  const inInput = Focus.active().exists(function (elem) {
    return Arr.contains([ 'input', 'textarea' ], Node.name(elem));
  });

  const transaction = inInput ? autocompleteHack() : Fun.apply;

  transaction(function () {
    // If we don't blur before focusing the content, a previous focus in something like a statebutton
    // which represents the chosen font colour can stop the keyboard from appearing. Therefore, we blur
    // first.
    Focus.active().each(Focus.blur);
    Focus.focus(iBody);
  });
};

export default {
  resume
};