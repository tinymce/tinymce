import { after, before } from '@ephox/bedrock-client';
import { TinyDom } from '@ephox/mcagar';
import { Insert, Remove, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

const createScrollDiv = (height: number) =>
  SugarElement.fromHtml<HTMLElement>(`<div style="height: ${height}px;" tabindex="0" class="scroll-div"></div>`);

const setup = (editor: Editor, amount: number) => {
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

const bddSetup = (lazyEditor: () => Editor, amount: number) => {
  let teardownScroll: () => void;
  before(() => {
    teardownScroll = setup(lazyEditor(), amount);
  });

  after(() => {
    teardownScroll();
  });
};

export {
  setup,
  bddSetup
};
