import Positioning from '../../api/behaviour/Positioning';
import Attachment from '../../api/system/Attachment';
import { Future } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';
import { Css } from '@ephox/sugar';

// NOTE: A sandbox should not start as part of the world. It is expected to be
// added to the sink on rebuild.
var rebuild = function (sandbox, sConfig, sState, data) {
  sState.get().each(function (data) {
    // If currently has data, so it hasn't been removed yet. It is
    // being "re-opened"
    Attachment.detachChildren(sandbox);
  });

  var point = sConfig.getAttachPoint()();
  Attachment.attach(point, sandbox);

  // Must be after the sandbox is in the system
  var built = sandbox.getSystem().build(data);
  Attachment.attach(sandbox, built);
  sState.set(built);
  return built;
};

// Open sandbox transfers focus to the opened menu
var open = function (sandbox, sConfig, sState, data) {
  var state = rebuild(sandbox, sConfig, sState, data);
  sConfig.onOpen()(sandbox, state);
  return state;
};

var close = function (sandbox, sConfig, sState) {
  sState.get().each(function (data) {
    Attachment.detachChildren(sandbox);
    Attachment.detach(sandbox);
    sConfig.onClose()(sandbox, data);
    sState.clear();
  });
};

var isOpen = function (sandbox, sConfig, sState) {
  return sState.isOpen();
};

var isPartOf = function (sandbox, sConfig, sState, queryElem) {
  return isOpen(sandbox, sConfig, sState) && sState.get().exists(function (data) {
    return sConfig.isPartOf()(sandbox, data, queryElem);
  });
};

var getState = function (sandbox, sConfig, sState) {
  return sState.get();
};

var store = function (sandbox, cssKey, attr, newValue) {
  Css.getRaw(sandbox.element(), cssKey).fold(function () {
    Attr.remove(sandbox.element(), attr);
  }, function (v) {
    Attr.set(sandbox.element(), attr, v);
  });
  Css.set(sandbox.element(), cssKey, newValue);
};

var restore = function (sandbox, cssKey, attr) {
  if (Attr.has(sandbox.element(), attr)) {
    var oldValue = Attr.get(sandbox.element(), attr);
    Css.set(sandbox.element(), cssKey, oldValue);
  } else {
    Css.remove(sandbox.element(), cssKey);
  }
};

var cloak = function (sandbox, sConfig, sState) {
  var sink = sConfig.getAttachPoint()();
  // Use the positioning mode of the sink, so that it does not interfere with the sink's positioning
  // We add it here to stop it causing layout problems.
  Css.set(sandbox.element(), 'position', Positioning.getMode(sink));
  store(sandbox, 'visibility', sConfig.cloakVisibilityAttr(), 'hidden');
};

var decloak = function (sandbox, sConfig, sState) {
  restore(sandbox, 'visibility', sConfig.cloakVisibilityAttr());
};

export default <any> {
  cloak: cloak,
  decloak: decloak,
  open: open,
  close: close,
  isOpen: isOpen,
  isPartOf: isPartOf,
  getState: getState
};