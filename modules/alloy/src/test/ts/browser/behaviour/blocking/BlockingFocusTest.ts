import { FocusTools, TestStore } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarDocument, SugarElement } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Blocking } from 'ephox/alloy/api/behaviour/Blocking';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Replacing } from 'ephox/alloy/api/behaviour/Replacing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

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

const makeComponent = (focus: boolean) => (_store: TestStore, _doc: SugarElement<Document>, _body: SugarElement<Node>) => {
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
  const busyComponentClass = 'put-spinner-here';

  const pAssertBusyComponentFocus = (hasFocus: boolean) =>
    FocusTools.pTryOnSelector(
      `Busy component ${hasFocus ? 'has focus' : 'does not have focus'}`,
      SugarDocument.getDocument(),
      hasFocus ? `div.${busyComponentClass}` : `div:not(.${busyComponentClass})`
    );

  context('Config: focus = true', () => {
    const hook = GuiSetup.bddSetup(makeComponent(true));

    it('does focus if busy component has Keying configured', async () => {
      const comp = hook.component();
      Focusing.focus(memFocusDiv.get(comp));
      Blocking.block(comp, (_comp, behaviours) => ({
        dom: {
          tag: 'div',
          classes: [ busyComponentClass ]
        },
        behaviours
      }));
      await pAssertBusyComponentFocus(true);
      Blocking.unblock(comp);
    });

    it('does not focus if busy component does not have Keying configured', async () => {
      const comp = hook.component();
      Focusing.focus(memFocusDiv.get(comp));
      Blocking.block(comp, Fun.constant({ dom: { tag: 'div', classes: [ busyComponentClass ] }}));
      await pAssertBusyComponentFocus(false);
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
          classes: [ busyComponentClass ]
        },
        behaviours
      }));
      await pAssertBusyComponentFocus(false);
      Blocking.unblock(comp);
    });
  });
});
