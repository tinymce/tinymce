import { Assertions, Pipeline, Step } from '@ephox/agar';
import { Merger } from '@ephox/katamari';
import { DomEvent, Element, Html, Insert, Remove } from '@ephox/sugar';
import TestStore from './TestStore';
import * as Attachment from '../../../../../../main/ts/ephox/alloy/api/system/Attachment';
import * as Gui from '../../../../../../main/ts/ephox/alloy/api/system/Gui';
import { document, console } from '@ephox/dom-globals';
import * as Debugging from '../../../../../../main/ts/ephox/alloy/debugging/Debugging';

const setup = (createComponent, f, success, failure) => {
  const store = TestStore();

  const gui = Gui.create();
  Debugging.registerInspector('GuiSetup', gui);

  const doc = Element.fromDom(document);
  const body = Element.fromDom(document.body);

  Attachment.attachSystem(body, gui);

  const component = createComponent(store, doc, body);
  gui.add(component);

  Pipeline.async({}, f(doc, body, gui, component, store), () => {
    Attachment.detachSystem(gui);
    success();
  }, (e) => {
    console.error(e);
    failure(e);
  });
};

const mSetupKeyLogger = (body) => {
  return Step.stateful((_, next, die) => {
    const onKeydown = DomEvent.bind(body, 'keydown', (event) => {
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

const mTeardownKeyLogger = (body, expected) => {
  return Step.stateful((state, next, die) => {
    Assertions.assertEq('Checking key log outside context (on teardown)', expected, state.log);
    state.onKeydown.unbind();
    next({});
  });
};

const mAddStyles = (doc, styles) => {
  return Step.stateful((value, next, die) => {
    const style = Element.fromTag('style');
    const head = Element.fromDom(doc.dom().head);
    Insert.append(head, style);
    Html.set(style, styles.join('\n'));

    next(Merger.deepMerge(value, {
      style
    }));
  });
};

const mRemoveStyles = Step.stateful((value, next, die) => {
  Remove.remove(value.style);
  next(value);
});

export {
  setup,
  mSetupKeyLogger,
  mTeardownKeyLogger,

  mAddStyles,
  mRemoveStyles
};