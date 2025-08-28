import { Assertions } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import Schema from 'tinymce/core/api/html/Schema';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import * as CefDeleteAction from 'tinymce/core/delete/CefDeleteAction';

import * as ViewBlock from '../../module/test/ViewBlock';

type DeleteActionAdt = CefDeleteAction.DeleteActionAdt;

describe('browser.tinymce.core.delete.CefDeleteActionTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const setHtml = viewBlock.update;

  const baseSchema = Schema();

  beforeEach(() => {
    viewBlock.get().contentEditable = 'true';
  });

  const readAction = (forward: boolean, cursorPath: number[], cursorOffset: number) => {
    const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), cursorPath).getOrDie();
    const rng = document.createRange();
    rng.setStart(container.dom, cursorOffset);
    rng.setEnd(container.dom, cursorOffset);
    return CefDeleteAction.read(viewBlock.get(), forward, rng, baseSchema);
  };

  const assertRemoveElementAction = (actionOpt: Optional<DeleteActionAdt>, elementPath: number[]) => {
    const element = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), elementPath).getOrDie();
    const action = actionOpt.getOrDie();
    const value = actionValue(action) as SugarElement<Element>;
    assert.equal(actionName(action), 'remove', 'Should be expected action type');
    Assertions.assertDomEq('Should be expected element', element, value);
  };

  const assertMoveToElementAction = (actionOpt: Optional<DeleteActionAdt>, elementPath: number[]) => {
    const element = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), elementPath).getOrDie();
    const action = actionOpt.getOrDie();
    const value = actionValue(action) as SugarElement<Element>;
    assert.equal(actionName(action), 'moveToElement', 'Should be expected action type');
    Assertions.assertDomEq('Should be expected element', element, value);
  };

  const assertMoveToPositionAction = (actionOpt: Optional<DeleteActionAdt>, elementPath: number[], offset: number) => {
    const container = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), elementPath).getOrDie();
    const action = actionOpt.getOrDie();
    const value = actionValue(action) as CaretPosition;
    assert.equal(actionName(action), 'moveToPosition', 'Should be expected action type');
    Assertions.assertDomEq('Should be expected container', container, SugarElement.fromDom(value.container()));
    assert.equal(value.offset(), offset, 'Should be expected offset');
  };

  const assertActionNone = (action: Optional<DeleteActionAdt>) => {
    assert.isTrue(action.isNone(), 'Action value should be none');
  };

  const actionName = (action: DeleteActionAdt) => {
    return action.fold(
      Fun.constant('remove'),
      Fun.constant('moveToElement'),
      Fun.constant('moveToPosition')
    );
  };

  const actionValue = (action: DeleteActionAdt) => {
    return action.fold<SugarElement<Node> | CaretPosition>(
      SugarElement.fromDom,
      SugarElement.fromDom,
      Fun.identity
    );
  };

  context('None actions where caret is not near a cef element', () => {
    it('Should be no action since it is not next to ce=false (delete, start block)', () => {
      setHtml('<p>a</p>');
      const actionOpt = readAction(true, [ 0, 0 ], 0);
      assertActionNone(actionOpt);
    });

    it('Should be no action since it is not next to ce=false (backspace, start block)', () => {
      setHtml('<p>a</p>');
      const actionOpt = readAction(false, [ 0, 0 ], 0);
      assertActionNone(actionOpt);
    });

    it('Should be no action since it is not next to ce=false (delete, end block)', () => {
      setHtml('<p>a</p>');
      const actionOpt = readAction(true, [ 0, 0 ], 1);
      assertActionNone(actionOpt);
    });

    it('Should be no action since it is not next to ce=false (backspace, end block)', () => {
      setHtml('<p>a</p>');
      const actionOpt = readAction(false, [ 0, 0 ], 1);
      assertActionNone(actionOpt);
    });

    it('Should be no action since it is not next to ce=false (delete, trailing cef)', () => {
      setHtml('<p>a</p><p contenteditable="false">b</p>');
      const actionOpt = readAction(true, [ 0, 0 ], 0);
      assertActionNone(actionOpt);
    });

    it('Should be no action since its not next to ce=false (backspace, trailing cef)', () => {
      setHtml('<p>a</p><p contenteditable="false">b</p>');
      const actionOpt = readAction(false, [ 0, 0 ], 0);
      assertActionNone(actionOpt);
    });

    it('Should be no action since it is not next to ce=false (delete, leading cef)', () => {
      setHtml('<p contenteditable="false">a</p><p>b</p>');
      const actionOpt = readAction(true, [ 1, 0 ], 1);
      assertActionNone(actionOpt);
    });

    it('Should be no action since it is not next to ce=false (backspace, leading cef)', () => {
      setHtml('<p contenteditable="false">a</p><p>b</p>');
      const actionOpt = readAction(false, [ 1, 0 ], 1);
      assertActionNone(actionOpt);
    });

    it('Should be no action since it is after the last ce=false', () => {
      setHtml('<p contenteditable="false">a</p><p contenteditable="false">b</p>');
      const actionOpt = readAction(true, [], 2);
      assertActionNone(actionOpt);
    });

    it('Should be no action since it is before the first ce=false', () => {
      setHtml('<p contenteditable="false">a</p><p contenteditable="false">b</p>');
      const actionOpt = readAction(false, [], 0);
      assertActionNone(actionOpt);
    });
  });

  context('MoveToElement actions where caret is near a cef element', () => {
    it('Should be moveToElement action since it next to a ce=false (delete, block)', () => {
      setHtml('<p>a</p><p contenteditable="false">b</p>');
      const actionOpt = readAction(true, [ 0, 0 ], 1);
      assertMoveToElementAction(actionOpt, [ 1 ]);
    });

    it('Should be moveToElement action since it next to a ce=false (backspace, block)', () => {
      setHtml('<p contenteditable="false">b</p><p>a</p>');
      const actionOpt = readAction(false, [ 1, 0 ], 0);
      assertMoveToElementAction(actionOpt, [ 0 ]);
    });

    it('Should be moveToElement action since it next to a ce=false (delete, inline)', () => {
      setHtml('<p><em>a</em></p><p contenteditable="false">b</p>');
      const actionOpt = readAction(true, [ 0, 0, 0 ], 1);
      assertMoveToElementAction(actionOpt, [ 1 ]);
    });

    it('Should be moveToElement action since it next to a ce=false (backspace, inline)', () => {
      setHtml('<p contenteditable="false">b</p><p><em>a</em></p>');
      const actionOpt = readAction(false, [ 1, 0, 0 ], 0);
      assertMoveToElementAction(actionOpt, [ 0 ]);
    });

    it('Should be moveToElement since it is delete after ce=false before another ce=false', () => {
      setHtml('<p contenteditable="false">b</p><p data-mce-caret="after"><br></p><p contenteditable="false">b</p>');
      const actionOpt = readAction(true, [ 1 ], 0);
      assertMoveToElementAction(actionOpt, [ 2 ]);
    });

    it('Should be moveToElement since it is backspace before a ce=false element before a ce=false', () => {
      setHtml('<p contenteditable="false">b</p><p data-mce-caret="before"><br></p><p contenteditable="false">b</p>');
      const actionOpt = readAction(false, [ 1 ], 0);
      assertMoveToElementAction(actionOpt, [ 0 ]);
    });
  });

  context('RemoveElement actions where caret is near a cef element', () => {
    it('Should be removeElement action since it next to a ce=false (delete before cefs)', () => {
      setHtml('<p contenteditable="false">a</p><p contenteditable="false">b</p>');
      const actionOpt = readAction(true, [], 0);
      assertRemoveElementAction(actionOpt, [ 0 ]);
    });

    it('Should be removeElement action since it next to a ce=false (delete between cefs)', () => {
      setHtml('<p contenteditable="false">a</p><p contenteditable="false">b</p>');
      const actionOpt = readAction(true, [], 1);
      assertRemoveElementAction(actionOpt, [ 1 ]);
    });

    it('Should be removeElement action since it next to a ce=false (backspace end cefs)', () => {
      setHtml('<p contenteditable="false">a</p><p contenteditable="false">b</p>');
      const actionOpt = readAction(false, [], 2);
      assertRemoveElementAction(actionOpt, [ 1 ]);
    });

    it('Should be removeElement action since it next to a ce=false (backspace between cefs)', () => {
      setHtml('<p contenteditable="false">a</p><p contenteditable="false">b</p>');
      const actionOpt = readAction(false, [], 1);
      assertRemoveElementAction(actionOpt, [ 0 ]);
    });

    it('Should be removeElement since it is backspace after a ce=false', () => {
      setHtml('<p contenteditable="false">b</p><p data-mce-caret="after"><br></p><p contenteditable="false">b</p>');
      const actionOpt = readAction(false, [ 1 ], 0);
      assertRemoveElementAction(actionOpt, [ 0 ]);
    });

    it('Should be removeElement since it is delete before a ce=false', () => {
      setHtml('<p contenteditable="false">b</p><p data-mce-caret="before"><br></p><p contenteditable="false">b</p>');
      const actionOpt = readAction(true, [ 1 ], 0);
      assertRemoveElementAction(actionOpt, [ 2 ]);
    });

    it('Should be removeElement since the block you are deleting from is empty (delete)', () => {
      setHtml('<p contenteditable="false">b</p><p><br></p><p contenteditable="false">b</p>');
      const actionOpt = readAction(true, [ 1 ], 0);
      assertRemoveElementAction(actionOpt, [ 1 ]);
    });

    it('Should be removeElement since the block you are deleting from is empty (backspace)', () => {
      setHtml('<p contenteditable="false">b</p><p><br></p><p contenteditable="false">b</p>');
      const actionOpt = readAction(false, [ 1 ], 0);
      assertRemoveElementAction(actionOpt, [ 1 ]);
    });

    it('Should be removeElement since caret positioned before BR', () => {
      setHtml('<p><span contenteditable="false">A</span>\ufeff<br /><span contenteditable="false">B</span></p>');
      const actionOpt = readAction(true, [ 0 ], 1);
      assertRemoveElementAction(actionOpt, [ 0, 2 ]);
    });

    it('Should be removeElement since caret positioned after BR', () => {
      setHtml('<p><span contenteditable="false">A</span><br />\ufeff<span contenteditable="false">B</span></p>');
      const actionOpt = readAction(false, [ 0 ], 3);
      assertRemoveElementAction(actionOpt, [ 0, 1 ]);
    });
  });

  context('moveToPosition actions where caret is to be moved from cef to normal content between blocks', () => {
    it('Should be moveToPosition action since we are after a ce=false and moving forwards to normal content', () => {
      setHtml('<p contenteditable="false">a</p><p>b</p>');
      const actionOpt = readAction(true, [], 1);
      assertMoveToPositionAction(actionOpt, [ 1, 0 ], 0);
    });

    it('Should be moveToPosition action since we are before a ce=false and moving backwards to normal content', () => {
      setHtml('<p>a</p><p contenteditable="false">b</p>');
      const actionOpt = readAction(false, [], 1);
      assertMoveToPositionAction(actionOpt, [ 0, 0 ], 1);
    });
  });

  context('Delete after inline cef should not do anything', () => {
    it('Should be no action since it is a delete after cef to text', () => {
      setHtml('<p><b contenteditable="false">a</b>b</p>');
      const actionOpt = readAction(true, [ 0 ], 1);
      assertActionNone(actionOpt);
    });

    it('Should be no action since it is a delete after cef to no position', () => {
      setHtml('<p><b contenteditable="false">a</b></p>');
      const actionOpt = readAction(true, [ 0 ], 1);
      assertActionNone(actionOpt);
    });
  });

  context('Backspace before inline cef should not do anything', () => {
    it('Should be no action since it is a backspace before cef to text', () => {
      setHtml('<p>a<b contenteditable="false">b</b></p>');
      const actionOpt = readAction(false, [ 0, 0 ], 1);
      assertActionNone(actionOpt);
    });

    it('Should be no action since it is a backspace before cef to no position', () => {
      setHtml('<p><b contenteditable="false">a</b></p>');
      const actionOpt = readAction(false, [ 0 ], 0);
      assertActionNone(actionOpt);
    });
  });

  context('Backspace/delete into cef table cell should not remove the cell', () => {
    it('Should be no action since it is a backspace before cef to text (backspace)', () => {
      setHtml('<table><tbody><tr><td contenteditable="false">1</td><td>2</td></tr></tbody></table>');
      const actionOpt = readAction(false, [ 0, 0, 0, 1, 0 ], 0);
      assertActionNone(actionOpt);
    });

    it('Should be no action since it is a backspace before cef to text (delete)', () => {
      setHtml('<table><tbody><tr><td>1</td><td contenteditable="false">2</td></tr></tbody></table>');
      const actionOpt = readAction(true, [ 0, 0, 0, 0, 0 ], 1);
      assertActionNone(actionOpt);
    });
  });

  context('Backspace/delete into cef list item should not remove the item', () => {
    it('Should be no action since it is a backspace before cef to text (backspace)', () => {
      setHtml('<ul><li contenteditable="false">1</li><li>2</li></ul>');
      const actionOpt = readAction(false, [ 0, 1, 0 ], 0);
      assertActionNone(actionOpt);
    });

    it('Should be no action since it is a backspace before cef to text (delete)', () => {
      setHtml('<ul><li>1</li><li contenteditable="false">2</li></ul>');
      const actionOpt = readAction(true, [ 0, 0, 0 ], 1);
      assertActionNone(actionOpt);
    });
  });

  context('Should not produce actions if cefs are inline between blocks', () => {
    it('Should be no action since delete from after inline cef to before inline cef is handled by merge', () => {
      setHtml('<p><b contenteditable="false">a</b></p><p><b contenteditable="false">b</b></p>');
      const actionOpt = readAction(true, [ 0 ], 1);
      assertActionNone(actionOpt);
    });

    it('Should be no action since backspace from before inline cef to after inline cef is handled by merge', () => {
      setHtml('<p><b contenteditable="false">a</b></p><p><b contenteditable="false">b</b></p>');
      const actionOpt = readAction(false, [ 1 ], 0);
      assertActionNone(actionOpt);
    });

    it('Should be no action since delete from after inline cef to normal content is handled by merge', () => {
      setHtml('<p><b contenteditable="false">a</b></p><p>b</p>');
      const actionOpt = readAction(true, [ 0 ], 1);
      assertActionNone(actionOpt);
    });

    it('Should be no action since backspace from before inline cef to normal content is handled by merge', () => {
      setHtml('<p>a</p><p><b contenteditable="false">b</b></p>');
      const actionOpt = readAction(false, [ 1 ], 0);
      assertActionNone(actionOpt);
    });
  });
});
