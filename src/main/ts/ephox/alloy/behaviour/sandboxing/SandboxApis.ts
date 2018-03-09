import { Attr, Css } from '@ephox/sugar';

import { Positioning } from '../../api/behaviour/Positioning';
import * as Attachment from '../../api/system/Attachment';

// NOTE: A sandbox should not start as part of the world. It is expected to be
// added to the sink on rebuild.
const rebuild = function (sandbox, sConfig, sState, data) {
  sState.get().each(function (data) {
    // If currently has data, so it hasn't been removed yet. It is
    // being "re-opened"
    Attachment.detachChildren(sandbox);
  });

  const point = sConfig.getAttachPoint()();
  Attachment.attach(point, sandbox);

  // Must be after the sandbox is in the system
  const built = sandbox.getSystem().build(data);
  Attachment.attach(sandbox, built);
  sState.set(built);
  return built;
};

// Open sandbox transfers focus to the opened menu
const open = function (sandbox, sConfig, sState, data) {
  const state = rebuild(sandbox, sConfig, sState, data);
  sConfig.onOpen()(sandbox, state);
  return state;
};

const close = function (sandbox, sConfig, sState) {
  sState.get().each(function (data) {
    Attachment.detachChildren(sandbox);
    Attachment.detach(sandbox);
    sConfig.onClose()(sandbox, data);
    sState.clear();
  });
};

const isOpen = function (sandbox, sConfig, sState) {
  return sState.isOpen();
};

const isPartOf = function (sandbox, sConfig, sState, queryElem) {
  return isOpen(sandbox, sConfig, sState) && sState.get().exists(function (data) {
    return sConfig.isPartOf()(sandbox, data, queryElem);
  });
};

const getState = function (sandbox, sConfig, sState) {
  return sState.get();
};

const store = function (sandbox, cssKey, attr, newValue) {
  Css.getRaw(sandbox.element(), cssKey).fold(function () {
    Attr.remove(sandbox.element(), attr);
  }, function (v) {
    Attr.set(sandbox.element(), attr, v);
  });
  Css.set(sandbox.element(), cssKey, newValue);
};

const restore = function (sandbox, cssKey, attr) {
  if (Attr.has(sandbox.element(), attr)) {
    const oldValue = Attr.get(sandbox.element(), attr);
    Css.set(sandbox.element(), cssKey, oldValue);
  } else {
    Css.remove(sandbox.element(), cssKey);
  }
};

const cloak = function (sandbox, sConfig, sState) {
  const sink = sConfig.getAttachPoint()();
  // Use the positioning mode of the sink, so that it does not interfere with the sink's positioning
  // We add it here to stop it causing layout problems.
  Css.set(sandbox.element(), 'position', Positioning.getMode(sink));
  store(sandbox, 'visibility', sConfig.cloakVisibilityAttr(), 'hidden');
};

const decloak = function (sandbox, sConfig, sState) {
  restore(sandbox, 'visibility', sConfig.cloakVisibilityAttr());
};

export {
  cloak,
  decloak,
  open,
  close,
  isOpen,
  isPartOf,
  getState
};