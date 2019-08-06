import { Attr, Css, Element } from '@ephox/sugar';
import { Arr } from '@ephox/katamari';

import { Positioning } from '../../api/behaviour/Positioning';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';
import * as Attachment from '../../api/system/Attachment';
import { SandboxingConfig, SandboxingState } from './SandboxingTypes';

// NOTE: A sandbox should not start as part of the world. It is expected to be
// added to the sink on rebuild.
const rebuild = (sandbox: AlloyComponent, sConfig: SandboxingConfig, sState: SandboxingState, data: AlloySpec) => {
  sState.get().each((data) => {
    // If currently has data, so it hasn't been removed yet. It is
    // being "re-opened"
    Attachment.detachChildren(sandbox);
  });

  const point = sConfig.getAttachPoint(sandbox);
  Attachment.attach(point, sandbox);

  // Must be after the sandbox is in the system
  const built = sandbox.getSystem().build(data);
  Attachment.attach(sandbox, built);
  sState.set(built);
  return built;
};

// Open sandbox transfers focus to the opened menu
const open = (sandbox: AlloyComponent, sConfig: SandboxingConfig, sState: SandboxingState, data) => {
  const newState = rebuild(sandbox, sConfig, sState, data);
  sConfig.onOpen(sandbox, newState);
  return newState;
};

// TODO AP-191 write a test for openWhileCloaked
const openWhileCloaked = (sandbox: AlloyComponent, sConfig: SandboxingConfig, sState: SandboxingState, data, transaction: () => void) => {
  cloak(sandbox, sConfig, sState);
  open(sandbox, sConfig, sState, data);
  transaction();
  decloak(sandbox, sConfig, sState);
};

const close = (sandbox: AlloyComponent, sConfig: SandboxingConfig, sState: SandboxingState) => {
  sState.get().each((data) => {
    Attachment.detachChildren(sandbox);
    Attachment.detach(sandbox);
    sConfig.onClose(sandbox, data);
    sState.clear();
  });
};

const isOpen = (sandbox: AlloyComponent, sConfig: SandboxingConfig, sState: SandboxingState) => {
  return sState.isOpen();
};

const isPartOf = (sandbox: AlloyComponent, sConfig: SandboxingConfig, sState: SandboxingState, queryElem: Element) => {
  return isOpen(sandbox, sConfig, sState) && sState.get().exists((data) => {
    return sConfig.isPartOf(sandbox, data, queryElem);
  });
};

const getState = (sandbox: AlloyComponent, sConfig: SandboxingConfig, sState: SandboxingState) => {
  return sState.get();
};

const store = (sandbox, cssKey, attr, newValue) => {
  Css.getRaw(sandbox.element(), cssKey).fold(() => {
    Attr.remove(sandbox.element(), attr);
  }, (v) => {
    Attr.set(sandbox.element(), attr, v);
  });
  Css.set(sandbox.element(), cssKey, newValue);
};

const restore = (sandbox, cssKey, attr) => {
  if (Attr.has(sandbox.element(), attr)) {
    const oldValue = Attr.get(sandbox.element(), attr);
    Css.set(sandbox.element(), cssKey, oldValue);
  } else {
    Css.remove(sandbox.element(), cssKey);
  }
};

const cloak = (sandbox: AlloyComponent, sConfig: SandboxingConfig, sState: SandboxingState) => {
  const sink = sConfig.getAttachPoint(sandbox);
  // Use the positioning mode of the sink, so that it does not interfere with the sink's positioning
  // We add it here to stop it causing layout problems.
  Css.set(sandbox.element(), 'position', Positioning.getMode(sink));
  store(sandbox, 'visibility', sConfig.cloakVisibilityAttr, 'hidden');
};

const hasPosition = (element: Element) => Arr.exists(['top', 'left', 'right', 'bottom'], (pos) => Css.getRaw(element, pos).isSome());

const decloak = (sandbox: AlloyComponent, sConfig: SandboxingConfig, sState: SandboxingState) => {
  if (!hasPosition(sandbox.element())) {
    // If a position value was not added to the sandbox during cloaking, remove it
    // otherwise certain position values (absolute, relative) will impact the child that _was_ positioned
    Css.remove(sandbox.element(), 'position');
  }

  restore(sandbox, 'visibility', sConfig.cloakVisibilityAttr);
};

export {
  cloak,
  decloak,
  open,
  openWhileCloaked,
  close,
  isOpen,
  isPartOf,
  getState
};
