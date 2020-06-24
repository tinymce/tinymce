import { Assertions, Pipeline, Step, TestLogs } from '@ephox/agar';
import { Merger } from '@ephox/katamari';
import { Body, Document, DomEvent, Element, EventUnbinder, Html, Insert, Remove, ShadowDom } from '@ephox/sugar';

import { AlloyComponent } from '../component/ComponentApi';
import * as Attachment from '../system/Attachment';
import * as Gui from '../system/Gui';
import { TestStore } from './TestStore';

type RootNode = ShadowDom.RootNode;

interface KeyLoggerState {
  log: string[];
  onKeydown: EventUnbinder;
}

const setupIn = (
  root: RootNode,
  createComponent: (store: TestStore, doc: Element, body: Element) => AlloyComponent,
  f: (doc: RootNode, body: Element, gui: Gui.GuiSystem, component: AlloyComponent, store: TestStore
  ) => Array<Step<any, any>>, success: () => void, failure: (err: any, logs?: TestLogs) => void
) => {
  const store = TestStore();

  const gui = Gui.create();
  const contentContainer = ShadowDom.getContentContainer(root);

  Attachment.attachSystem(contentContainer, gui);

  const component = createComponent(store, root, contentContainer);
  gui.add(component);

  try {
    const steps = f(root, contentContainer, gui, component, store);
    Pipeline.async({}, steps, () => {
      Attachment.detachSystem(gui);
      success();
    }, (e, logs) => {
      failure(e, logs);
    }, TestLogs.init());
  } catch (e) {
    failure(e);
  }
};

/**
 * Setup in the body, run list of untyped Steps, then tear down.
 * Use #guiSetup for type-safe steps.
 *
 * @param createComponent
 * @param f
 * @param success
 * @param failure
 */
const setup = (
  createComponent: (store: TestStore, doc: Element, body: Element) => AlloyComponent,
  f: (doc: Element, body: Element, gui: Gui.GuiSystem, component: AlloyComponent, store: TestStore) => Array<Step<any, any>>,
  success: () => void,
  failure: (err: any, logs?: TestLogs) => void
): void => {
  setupIn(Document.getDocument(), createComponent, f, success, failure);
};

/**
* Setup in a Shadow Root, run list of untyped Steps, then tear down.
*
* @param createComponent
* @param f
* @param success
* @param failure
*/
const setupInShadowRoot = (
  createComponent: (store: TestStore, doc: Element, body: Element) => AlloyComponent,
  f: (doc: Element, body: Element, gui: Gui.GuiSystem, component: AlloyComponent, store: TestStore) => Array<Step<any, any>>,
  success: () => void,
  failure: (err: any, logs?: TestLogs) => void
): void => {
  if (!ShadowDom.isSupported()) {
    return success();
  }
  const sh = Element.fromTag('div');
  Insert.append(Body.body(), sh);
  const sr = Element.fromDom(sh.dom().attachShadow({ mode: 'open' }));
  setupIn(sr, createComponent, f, () => {
    Remove.remove(sh);
    success();
  }, failure);
};

const setupInBodyAndShadowRoot = (
  createComponent: (store: TestStore, doc: Element, body: Element) => AlloyComponent,
  f: (doc: Element, body: Element, gui: Gui.GuiSystem, component: AlloyComponent, store: TestStore) => Array<Step<any, any>>,
  success: () => void,
  failure: (err: any, logs?: TestLogs) => void
): void => {
  setup(createComponent, f, () => {
    setupInShadowRoot(createComponent, f, success, failure);
  }, failure);
};

/**
 * Setup in the body, run a typed Step, then tear down.
 * If you need to run multiple Steps, compose them using the functions in StepSequence.
 *
 * @param createComponent
 * @param f
 * @param success
 * @param failure
 */
const guiSetup = <A, B> (createComponent: (store: TestStore, doc: Element, body: Element) => AlloyComponent,
  f: (doc: Element, body: Element, gui: Gui.GuiSystem, component: AlloyComponent, store: TestStore) => Step<A, B>, success: () => void, failure: (err: any, logs?: TestLogs) => void) => {
  setup(createComponent, (doc, body, gui, component, store) => [ f(doc, body, gui, component, store) ], success, failure);
};

const mSetupKeyLogger = (body: Element) => Step.stateful((oldState: Record<string, any>, next, _die) => {
  const onKeydown: EventUnbinder = DomEvent.bind(body, 'keydown', (event) => {
    newState.log.push('keydown.to.body: ' + event.raw().which);
  });

  const log: string[] = [ ];
  const newState: any = {
    ...oldState,
    log,
    onKeydown
  };
  next(newState);
});

const mTeardownKeyLogger = (body: Element, expected: string[]) => Step.stateful((state: KeyLoggerState, next, _die) => {
  Assertions.assertEq('Checking key log outside context (on teardown)', expected, state.log);
  state.onKeydown.unbind();
  const { onKeydown, log, ...rest } = state;
  next(rest);
});

const mAddStyles = (dos: RootNode, styles: string[]) => Step.stateful((value: any, next, _die) => {
  const style = Element.fromTag('style');
  const head = ShadowDom.getStyleContainer(dos);
  Insert.append(head, style);
  Html.set(style, styles.join('\n'));

  next(Merger.deepMerge(value, {
    style
  }));
});

const mRemoveStyles = Step.stateful((value: any, next, _die) => {
  Remove.remove(value.style);
  next(value);
});

export {
  setup,
  setupInShadowRoot,
  setupInBodyAndShadowRoot,
  guiSetup,
  mSetupKeyLogger,
  mTeardownKeyLogger,

  mAddStyles,
  mRemoveStyles
};
