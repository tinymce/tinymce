import { Chain, Cursors, Mouse, UiFinder, Step, Assertions } from '@ephox/agar';
import { TinyDom } from '@ephox/mcagar';
import { SelectorFind, Element } from '@ephox/sugar';

const sAssertTableStructure = (editor, structure) => Step.sync(() => {
  const table = SelectorFind.descendant(Element.fromDom(editor.getBody()), 'table').getOrDie('Should exist a table');
  Assertions.assertStructure('Should be a table the expected structure', structure, table);
});

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
  sOpenToolbarOn,
  sAssertTableStructure
};