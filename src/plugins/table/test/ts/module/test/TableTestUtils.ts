import { Chain } from '@ephox/agar';
import { Cursors } from '@ephox/agar';
import { Mouse } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { TinyDom } from '@ephox/mcagar';

const sOpenToolbarOn = function (editor, selector, path) {
  return Chain.asStep(TinyDom.fromDom(editor.getBody()), [
    UiFinder.cFindIn(selector),
    Cursors.cFollow(path),
    Chain.op(function (target) {
      editor.selection.select(target.dom());
    }),
    Mouse.cClick
  ]);
};

export default {
  sOpenToolbarOn
};