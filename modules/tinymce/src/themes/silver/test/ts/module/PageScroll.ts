import { after, before } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Insert, Remove, SugarElement } from '@ephox/sugar';
import { TinyDom } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

const createScrollDiv = (height: number) =>
  SugarElement.fromHtml<HTMLElement>(`<div style="height: ${height}px;" tabindex="0" class="scroll-div"></div>`);

const setup = (editor: Editor, amount: number): VoidFunction => {
  const target = editor.inline ? TinyDom.body(editor) : TinyDom.container(editor);

  const divBefore = createScrollDiv(amount);
  const divAfter = createScrollDiv(amount);

  Insert.before(target, divBefore);
  Insert.after(target, divAfter);

  return () => {
    Remove.remove(divBefore);
    Remove.remove(divAfter);
  };
};

const bddSetup = (lazyEditor: () => Editor, amount: number): void => {
  let teardownScroll: () => void = Fun.noop;
  before(() => {
    teardownScroll = setup(lazyEditor(), amount);
  });

  after(() => {
    teardownScroll();
    teardownScroll = Fun.noop;
  });
};

export {
  setup,
  bddSetup
};
