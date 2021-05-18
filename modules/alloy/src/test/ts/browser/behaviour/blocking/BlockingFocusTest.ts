import { FocusTools } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarDocument, SugarElement } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Blocking } from 'ephox/alloy/api/behaviour/Blocking';
import { Replacing } from 'ephox/alloy/api/behaviour/Replacing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import { Focusing } from 'ephox/alloy/api/Main';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { TestStore } from 'ephox/alloy/api/testhelpers/TestHelpers';

const memBlockRoot = Memento.record({
  dom: {
    tag: 'div'
  },
  behaviours: Behaviour.derive([
    Replacing.config({})
  ])
});

const memFocusDiv = Memento.record({
  dom: {
    tag: 'div',
    classes: [ 'focus-div' ]
  },
  behaviours: Behaviour.derive([
    Focusing.config({})
  ])
});

const makeComponent = (focus: boolean = true) => (_store: TestStore, _doc: SugarElement<Document>, _body: SugarElement<Node>) => {
  const component = GuiFactory.build({
    dom: {
      tag: 'div'
    },
    components: [
      memBlockRoot.asSpec(),
      memFocusDiv.asSpec()
    ],
    behaviours: Behaviour.derive([
      Blocking.config({
        focus,
        getRoot: () => memBlockRoot.getOpt(component),
      })
    ])
  });

  return component;
};

describe('browser.alloy.behaviour.blocking.BlockingFocusTest', () => {
  context('Config: focus = true', () => {
    const hook = GuiSetup.bddSetup(makeComponent(true));

    it('does focus if busy component has Keying configured', async () => {
      const comp = hook.component();
      Focusing.focus(memFocusDiv.get(comp));
      Blocking.block(comp, (_comp, behaviours) => ({
        dom: {
          tag: 'div',
          classes: [ 'put-spinner-here' ]
        },
        behaviours
      }));
      await FocusTools.pTryOnSelector('Busy component has focus', SugarDocument.getDocument(), 'div.put-spinner-here');
      Blocking.unblock(comp);
    });

    it('does not focus if busy component does not have Keying configured', async () => {
      const comp = hook.component();
      Focusing.focus(memFocusDiv.get(comp));
      Blocking.block(comp, Fun.constant({ dom: { tag: 'div', classes: [ 'put-spinner-here' ] }}));
      await FocusTools.pTryOnSelector('Busy component has focus', SugarDocument.getDocument(), 'div.focus-div');
      Blocking.unblock(comp);
    });
  });

  context('Config: focus = false', () => {
    const hook = GuiSetup.bddSetup(makeComponent(false));

    it('does not focus the busy component', async () => {
      const comp = hook.component();
      Focusing.focus(memFocusDiv.get(comp));
      Blocking.block(comp, (_comp, behaviours) => ({
        dom: {
          tag: 'div',
          classes: [ 'put-spinner-here' ]
        },
        behaviours
      }));
      await FocusTools.pTryOnSelector('Busy component has focus', SugarDocument.getDocument(), 'div.focus-div');
      Blocking.unblock(comp);
    });
  });
});
