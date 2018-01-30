import { Assertions, Pipeline, Step } from '@ephox/agar';
import { Attachment, Gui } from '@ephox/alloy';
import { Merger } from '@ephox/katamari';
import { DomEvent, Element, Html, Insert, Remove } from '@ephox/sugar';

import TestStore from './TestStore';

const setup = function (createComponent, f, success, failure) {
  const store = TestStore();

  const gui = Gui.create();

  const doc = Element.fromDom(document);
  const body = Element.fromDom(document.body);

  Attachment.attachSystem(body, gui);

  const component = createComponent(store, doc, body);
  gui.add(component);

  Pipeline.async({}, f(doc, body, gui, component, store), function () {
    Attachment.detachSystem(gui);
    success();
  }, function (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
    failure(e);
  });
};

const mSetupKeyLogger = function (body) {
  return Step.stateful(function (_, next, die) {
    const onKeydown = DomEvent.bind(body, 'keydown', function (event) {
      newState.log.push('keydown.to.body: ' + event.raw().which);
    });

    const log = [ ];
    const newState = {
      log,
      onKeydown
    };
    next(newState);
  });
};

const mTeardownKeyLogger = function (body, expected) {
  return Step.stateful(function (state, next, die) {
    Assertions.assertEq('Checking key log outside context (on teardown)', expected, state.log);
    state.onKeydown.unbind();
    next({});
  });
};

const mAddStyles = function (doc, styles) {
  return Step.stateful(function (value, next, die) {
    const style = Element.fromTag('style');
    const head = Element.fromDom(doc.dom().head);
    Insert.append(head, style);
    Html.set(style, styles.join('\n'));

    next(Merger.deepMerge(value, {
      style
    }));
  });
};

const mRemoveStyles = Step.stateful(function (value, next, die) {
  Remove.remove(value.style);
  next(value);
});

export default {
  setup,
  mSetupKeyLogger,
  mTeardownKeyLogger,

  mAddStyles,
  mRemoveStyles
};