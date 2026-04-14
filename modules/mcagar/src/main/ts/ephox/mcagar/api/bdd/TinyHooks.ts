import { after, afterEach, before } from '@ephox/bedrock-client';
import { Arr, Fun, Optional, Singleton, Type } from '@ephox/katamari';
import { Insert, Remove, SugarBody, SugarElement, SugarHead, TextContent } from '@ephox/sugar';

import type { Editor as EditorType } from '../../alien/EditorTypes';
import * as Loader from '../../loader/Loader';
import { setupTinymceBaseUrl } from '../../loader/Urls';

export interface Hook<T extends EditorType> {
  readonly editor: () => T;
}

export interface ShadowRootHook<T extends EditorType> extends Hook<T> {
  readonly shadowRoot: () => SugarElement<ShadowRoot>;
}

export interface SetupElement {
  readonly element: SugarElement<HTMLElement>;
  readonly teardown: () => void;
}

export interface TinyHookOptions {
  readonly focusOnInit?: boolean;
  readonly fastAnimations?: boolean;
}

const normalizeOptions = (options: TinyHookOptions | boolean): TinyHookOptions => {
  if (Type.isBoolean(options)) {
    return { focusOnInit: options };
  } else {
    return options;
  }
};

const hookNotRun = Fun.die('The setup hooks have not run yet');

const setupFastAnimations = () => {
  const styleState = Singleton.value<SugarElement<HTMLStyleElement>>();

  return {
    setup: (setupElement: Optional<SetupElement>) => {
      const style = SugarElement.fromTag('style');

      // TODO: This should probably be done with CSS custom properties once we have that in oxide
      const css = Arr.map([ 'body', ':host' ], (prefix) => {
        return `${prefix} .tox .tox-sidebar--sliding-growing, ${prefix} .tox .tox-sidebar--sliding-shrinking { transition-duration: 0.01s; }`;
      }).join('\n');
      TextContent.set(style, css);

      setupElement.fold(
        () => Insert.append(SugarHead.head(), style),
        ({ element }) => Insert.prepend(element, style)
      );

      styleState.set(style);
    },
    teardown: () => styleState.get().each(Remove.remove)
  };
};

const setupHooks = <T extends EditorType = EditorType>(
  settings: Record<string, any>,
  setupModules: Array<() => void>,
  hookOptions: TinyHookOptions,
  setupElement: () => Optional<SetupElement>
): Hook<T> => {
  let lazyEditor: () => T = hookNotRun;
  let teardownEditor: () => void = Fun.noop;
  let setup: Optional<SetupElement> = Optional.none();
  let hasFailure = false;
  const { focusOnInit, fastAnimations } = hookOptions;
  const fastAnimationsHooks = setupFastAnimations();

  before(function (done) {
    // The default timeout is 2s, that isn't enough on slow connections
    this.timeout(10000);
    setup = setupElement();

    if (fastAnimations) {
      fastAnimationsHooks.setup(setup);
    }

    Loader.setup({
      preInit: (tinymce, initSettings) => {
        setupTinymceBaseUrl(tinymce, initSettings);
        Arr.each(setupModules, Fun.call);
      },
      run: (ed, success) => {
        lazyEditor = Fun.constant(ed);
        teardownEditor = success;
        if (focusOnInit) {
          ed.focus();
        }
        done();
      },
      success: Fun.noop,
      failure: done
    }, settings, setup.map((s) => s.element));
  });

  afterEach(function () {
    if (this.currentTest?.isFailed() === true) {
      hasFailure = true;
    }
  });

  after(() => {
    if (!hasFailure) {
      teardownEditor();
      setup.each((s) => s.teardown());
    }

    // Cleanup references
    lazyEditor = hookNotRun;
    teardownEditor = Fun.noop;
    setup = Optional.none();

    if (fastAnimations) {
      fastAnimationsHooks.teardown();
    }
  });

  return {
    editor: () => lazyEditor()
  };
};

const bddSetup = <T extends EditorType = EditorType>(
  settings: Record<string, any>,
  setupModules: Array<() => void> = [],
  hookOptions: TinyHookOptions | boolean = {}
): Hook<T> => {
  return setupHooks(settings, setupModules, normalizeOptions(hookOptions), Optional.none);
};

const bddSetupLight = <T extends EditorType = EditorType>(
  settings: Record<string, any>,
  setupModules: Array<() => void> = [],
  hookOptions: TinyHookOptions | boolean = {}
): Hook<T> => {
  return setupHooks({
    toolbar: '',
    menubar: false,
    statusbar: false,
    ...settings
  }, setupModules, normalizeOptions(hookOptions), Optional.none);
};

const bddSetupFromElement = <T extends EditorType = EditorType>(
  settings: Record<string, any>,
  setupElement: () => SetupElement,
  setupModules: Array<() => void> = [],
  hookOptions: TinyHookOptions | boolean = {}
): Hook<T> => {
  return setupHooks(settings, setupModules, normalizeOptions(hookOptions), () => Optional.some(setupElement()));
};

const bddSetupInShadowRoot = <T extends EditorType = EditorType>(
  settings: Record<string, any>,
  setupModules: Array<() => void> = [],
  hookOptions: TinyHookOptions | boolean = {}
): ShadowRootHook<T> => {
  let lazyShadowRoot: () => SugarElement<ShadowRoot> = hookNotRun;
  let editorDiv: Optional<SugarElement<HTMLElement>>;
  let teardown: () => void = Fun.noop;

  before(() => {
    const shadowHost = SugarElement.fromTag('div', document);

    Insert.append(SugarBody.body(), shadowHost);
    const sr = SugarElement.fromDom(shadowHost.dom.attachShadow({ mode: 'open' }));
    const div: SugarElement<HTMLElement> = SugarElement.fromTag('div', document);

    Insert.append(sr, div);

    lazyShadowRoot = Fun.constant(sr);
    editorDiv = Optional.some(div);
    teardown = () => {
      Remove.remove(shadowHost);

      // Cleanup references
      lazyShadowRoot = hookNotRun;
      editorDiv = Optional.none();
      teardown = Fun.noop;
    };
  });

  const hooks = setupHooks<T>(settings, setupModules, normalizeOptions(hookOptions), () => editorDiv.map((element) => ({ element, teardown })));

  return {
    ...hooks,
    shadowRoot: () => lazyShadowRoot()
  };
};

export {
  bddSetup,
  bddSetupLight,
  bddSetupFromElement,
  bddSetupInShadowRoot
};
