import { Assertions, Pipeline, Step, TestLogs, TestStore } from '@ephox/agar';
import { Fun, Global, Merger, Obj, Optional, Type } from '@ephox/katamari';
import { DomEvent, EventUnbinder, Html, Insert, Remove, SugarBody, SugarDocument, SugarElement, SugarShadowDom, Traverse } from '@ephox/sugar';

import { AlloyComponent } from '../component/ComponentApi';
import * as Attachment from '../system/Attachment';
import * as Gui from '../system/Gui';

type RootNode = SugarShadowDom.RootNode;
type ContentContainer<T extends RootNode> = T extends ShadowRoot ? ShadowRoot : HTMLElement;

export interface KeyLoggerState {
  readonly log: string[];
  readonly onKeydown: EventUnbinder;
}

interface StyleState {
  readonly style: SugarElement<HTMLStyleElement>;
}

interface SetupRootElement<T extends RootNode> {
  readonly root: T;
  readonly teardown: () => void;
}

export interface Hook<T extends RootNode, U = string> {
  readonly root: () => T;
  readonly body: () => SugarElement<Node>;
  readonly gui: () => Gui.GuiSystem;
  readonly component: () => AlloyComponent;
  readonly store: () => TestStore<U>;
}

const setupIn = <T extends RootNode, U = string>(
  root: T,
  createComponent: (store: TestStore<U>, doc: T, body: SugarElement<ContentContainer<T>>) => AlloyComponent,
  f: (doc: T, body: SugarElement<ContentContainer<T>>, gui: Gui.GuiSystem, component: AlloyComponent, store: TestStore<U>) => Array<Step<any, any>>,
  success: () => void,
  failure: (err: any, logs?: TestLogs) => void
) => {
  const store = TestStore<U>();

  const gui = Gui.create();
  const contentContainer = SugarShadowDom.getContentContainer(root) as SugarElement<ContentContainer<T>>;

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

const bddSetupIn = <T extends RootNode, U = string>(
  setupRoot: () => SetupRootElement<T>,
  createComponent: (store: TestStore<U>, doc: T, body: SugarElement<Node>) => AlloyComponent,
  createGui?: () => Gui.GuiSystem,
  skip: () => boolean = Fun.never
): Hook<T, U> => {
  let state: Record<string, any> = {};
  let teardown: () => void = Fun.noop;
  let hasFailure = false;

  // Note: Don't use bedrock imports here so as to avoid requiring bedrock as a
  // dependency. It'll still work the same, but we'll be missing the types.
  Global.before(function (this: any) {
    if (skip()) {
      this.skip();
    }

    const store = TestStore<U>();
    const setup = setupRoot();
    teardown = setup.teardown;
    const root = setup.root;
    const contentContainer = SugarShadowDom.getContentContainer(root);
    const gui = Type.isNullable(createGui) ? Gui.create() : createGui();

    // Attach the gui if needed
    if (Traverse.parent(gui.element).isNone()) {
      Attachment.attachSystem(contentContainer, gui);
    }

    const component = createComponent(store, root, contentContainer);
    gui.add(component);

    state = {
      root,
      body: contentContainer,
      gui,
      component,
      store
    };
  });

  Global.afterEach(function (this: any) {
    if (this.currentTest?.isFailed() === true) {
      hasFailure = true;
    }
  });

  Global.after(() => {
    if (!hasFailure) {
      Obj.get(state, 'gui').each(Attachment.detachSystem);
      teardown();
    }
    state = {};
  });

  const lazyGet = (name: string) => () => Obj.get(state, name).getOrDie('The setup hooks have not run yet');
  return {
    root: lazyGet('root'),
    body: lazyGet('body'),
    gui: lazyGet('gui'),
    component: lazyGet('component'),
    store: lazyGet('store')
  };
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
const setup = <T = string>(
  createComponent: (store: TestStore<T>, doc: SugarElement<Document>, body: SugarElement<HTMLElement>) => AlloyComponent,
  f: (doc: SugarElement<Document>, body: SugarElement<HTMLElement>, gui: Gui.GuiSystem, component: AlloyComponent, store: TestStore<T>) => Array<Step<any, any>>,
  success: () => void,
  failure: (err: any, logs?: TestLogs) => void
): void => {
  setupIn(SugarDocument.getDocument(), createComponent, f, success, failure);
};

const bddSetup = <T = string>(
  createComponent: (store: TestStore<T>, doc: SugarElement<Document>, body: SugarElement<Node>) => AlloyComponent,
  createGui?: () => Gui.GuiSystem
): Hook<SugarElement<Document>, T> =>
  bddSetupIn(() => ({
    root: SugarDocument.getDocument(),
    teardown: Fun.noop
  }), createComponent, createGui);

/**
 * Setup in a Shadow Root, run list of untyped Steps, then tear down.
 *
 * @param createComponent
 * @param f
 * @param success
 * @param failure
 */
const setupInShadowRoot = <T = string>(
  createComponent: (store: TestStore<T>, doc: SugarElement<ShadowRoot>, body: SugarElement<Node>) => AlloyComponent,
  f: (doc: SugarElement<ShadowRoot>, body: SugarElement<Node>, gui: Gui.GuiSystem, component: AlloyComponent, store: TestStore<T>) => Array<Step<any, any>>,
  success: () => void,
  failure: (err: any, logs?: TestLogs) => void
): void => {
  if (!SugarShadowDom.isSupported()) {
    return success();
  }
  const sh = SugarElement.fromTag('div');
  Insert.append(SugarBody.body(), sh);
  const sr = SugarElement.fromDom(sh.dom.attachShadow({ mode: 'open' }));
  setupIn(sr, createComponent, f, () => {
    Remove.remove(sh);
    success();
  }, failure);
};

const bddSetupInShadowRoot = <T = string>(
  createComponent: (store: TestStore<T>, doc: SugarElement<ShadowRoot>, body: SugarElement<Node>) => AlloyComponent,
  createGui?: () => Gui.GuiSystem
): Hook<SugarElement<ShadowRoot>, T> => {
  return bddSetupIn(() => {
    const sh = SugarElement.fromTag('div');
    Insert.append(SugarBody.body(), sh);
    const sr = SugarElement.fromDom(sh.dom.attachShadow({ mode: 'open' }));
    return {
      root: sr,
      teardown: () => Remove.remove(sh)
    };
  }, createComponent, createGui, () => !SugarShadowDom.isSupported());
};

const setupInBodyAndShadowRoot = <T = string>(
  createComponent: (store: TestStore<T>, doc: RootNode, body: SugarElement<Node>) => AlloyComponent,
  f: (doc: RootNode, body: SugarElement<Node>, gui: Gui.GuiSystem, component: AlloyComponent, store: TestStore<T>) => Array<Step<any, any>>,
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
const guiSetup = <A, B, C = string> (createComponent: (store: TestStore<C>, doc: SugarElement<Document>, body: SugarElement<HTMLElement>) => AlloyComponent,
  f: (doc: SugarElement<Document>, body: SugarElement<HTMLElement>, gui: Gui.GuiSystem, component: AlloyComponent, store: TestStore<C>) => Step<A, B>,
  success: () => void, failure: (err: any, logs?: TestLogs) => void): void => {
  setup(createComponent, (doc, body, gui, component, store) => [
    f(doc, body, gui, component, store)
  ], success, failure);
};

const setupKeyLogger = (body: SugarElement<Node>): KeyLoggerState => {
  const onKeydown: EventUnbinder = DomEvent.bind(body, 'keydown', (event) => {
    newState.log.push('keydown.to.body: ' + event.raw.which);
  });

  const log: string[] = [ ];
  const newState = {
    log,
    onKeydown
  };
  return newState;
};

const teardownKeyLogger = (state: KeyLoggerState, expected: string[]): void => {
  Assertions.assertEq('Checking key log outside context (on teardown)', expected, state.log);
  state.onKeydown.unbind();
};

const addStyles = (dos: RootNode, styles: string[]): SugarElement<HTMLStyleElement> => {
  const style = SugarElement.fromTag('style');
  const head = SugarShadowDom.getStyleContainer(dos);
  Insert.append(head, style);
  Html.set(style, styles.join('\n'));

  return style;
};

const removeStyles = (style: SugarElement<HTMLStyleElement>): void =>
  Remove.remove(style);

const bddAddStyles = (dos: RootNode, styles: string[]): void => {
  let style = Optional.none<SugarElement<HTMLStyleElement>>();

  // Note: Don't use bedrock imports here so as to avoid requiring bedrock as a
  // dependency. It'll still work the same, but we'll be missing the types.
  Global.before(() => {
    style = Optional.some(addStyles(dos, styles));
  });

  Global.after(() => {
    style.each(Remove.remove);
    style = Optional.none();
  });
};

const mSetupKeyLogger = <T>(body: SugarElement<Node>): Step<T, T & KeyLoggerState> => Step.stateful((oldState, next, _die) => {
  next({
    ...oldState,
    ...setupKeyLogger(body)
  });
});

const mTeardownKeyLogger = <T>(body: SugarElement<Node>, expected: string[]): Step<T & KeyLoggerState, T> => Step.stateful((state, next, _die) => {
  teardownKeyLogger(state, expected);
  const { onKeydown, log, ...rest } = state;
  next(rest as unknown as T);
});

const mAddStyles = <T>(dos: RootNode, styles: string[]): Step<T, T & StyleState> => Step.stateful((value, next, _die) => {
  next(Merger.deepMerge(value, {
    style: addStyles(dos, styles)
  }));
});

const mRemoveStyles = Step.stateful((value: StyleState, next, _die) => {
  removeStyles(value.style);
  next(value);
});

export {
  setup,
  setupInShadowRoot,
  setupInBodyAndShadowRoot,
  guiSetup,

  bddSetup,
  bddSetupInShadowRoot,

  setupKeyLogger,
  teardownKeyLogger,
  addStyles,
  removeStyles,

  bddAddStyles,

  mSetupKeyLogger,
  mTeardownKeyLogger,
  mAddStyles,
  mRemoveStyles
};
