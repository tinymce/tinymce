import { Optional, Optionals } from '@ephox/katamari';
import { Attribute } from '@ephox/sugar';
import * as BehaviourTypes from '../common/BehaviourTypes';
import * as Behaviour from '../../api/behaviour/Behaviour';
import { Keying } from '../../api/behaviour/Keying';
import { Focusing } from '../../api/behaviour/Focusing';
import { Replacing } from '../../api/behaviour/Replacing';
import { AlloySpec } from '../../api/component/SpecTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as GuiFactory from '../../api/component/GuiFactory';
import { BlockingConfig } from './BlockingSchema';
import { BlockingState } from './BlockingState';

export interface BlockingApis extends BehaviourTypes.BehaviourApisRecord<BlockingConfig, BlockingState> {
  block: typeof block;
  unblock: typeof unblock;
}

// Mark this component as busy, or blocked.
const block = (
  component: AlloyComponent,
  config: BlockingConfig,
  state: BlockingState,
  // This works in conjunction with the 'getRoot' function in the config. To
  // attach a blocker component to the dom, ensure that 'getRoot' returns a
  // component, and this function returns the specification of the component to
  // attach.
  getBusySpec?: (behaviour: Behaviour.AlloyBehaviourRecord) => AlloySpec
) => {
  if (!state.getBlocked()) {
    config.onBlock(component);
  }

  state.setBlocked(true);

  Attribute.set(component.element, 'aria-busy', true);

  let hasNewBlocker = false;
  Optionals.lift2(Optional.from(getBusySpec), config.getRoot(component), (getBusySpec, root) => {
    hasNewBlocker = true;

    const spec = getBusySpec(Behaviour.derive([
      // Trap the "Tab" key and don't let it escape.
      Keying.config({
        mode: 'special',
        onTab: () => Optional.some<boolean>(true),
        onShiftTab: () => Optional.some<boolean>(true)
      }),
      Focusing.config({ })
    ]));
    const blocker = root.getSystem().build(spec);
    Replacing.append(root, GuiFactory.premade(blocker));
    state.setBlocker(blocker, () => Replacing.remove(root, blocker));

    if (blocker.hasConfigured(Keying)) {
      Keying.focusIn(blocker);
    }
  });
  if (!hasNewBlocker) {
    state.clearBlocker();
  }
};

// Mark this component as unblocked, or not busy. This is a noop on a component
// that isn't blocked.
const unblock = (component: AlloyComponent, config: BlockingConfig, state: BlockingState) => {
  if (!state.getBlocked()) {
    return;
  }
  state.setBlocked(false);

  Attribute.remove(component.element, 'aria-busy');
  state.clearBlocker();
  config.onUnblock(component);
};

export const BlockingApis: BlockingApis = {
  block,
  unblock
};