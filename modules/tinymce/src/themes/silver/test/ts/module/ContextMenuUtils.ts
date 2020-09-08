import { Chain, UiFinder } from '@ephox/agar';
import { Assert } from '@ephox/bedrock-client';
import { TinyUi } from '@ephox/mcagar';
import { Css, SugarBody } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

const sOpenContextMenu = (tinyUi: TinyUi, editor: Editor, selector: string) => Chain.asStep(editor, [
  tinyUi.cTriggerContextMenu('trigger context menu', selector, '.tox-silver-sink .tox-menu.tox-collection [role="menuitem"]'),
  Chain.wait(0)
]);

const sAssertContentMenuPosition = (left: number, top: number, diff: number = 3) => Chain.asStep(SugarBody.body(), [
  UiFinder.cFindIn('.tox-silver-sink .tox-menu.tox-collection'),
  Chain.op((menu) => {
    const topStyle = parseInt(Css.getRaw(menu, 'top').getOr('0').replace('px', ''), 10);
    const leftStyle = parseInt(Css.getRaw(menu, 'left').getOr('0').replace('px', ''), 10);
    Assert.eq(`Assert context menu top position - ${topStyle}px ~= ${top}px`, true, Math.abs(topStyle - top) <= diff);
    Assert.eq(`Assert context menu left position - ${leftStyle}px ~= ${left}px`, true, Math.abs(leftStyle - left) <= diff);
  })
]);

export {
  sOpenContextMenu,
  sAssertContentMenuPosition
};
