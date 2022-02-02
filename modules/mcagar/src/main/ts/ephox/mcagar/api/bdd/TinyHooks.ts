import { after, afterEach, before } from '@ephox/bedrock-client';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { Insert, Remove, SugarBody, SugarElement, SugarShadowDom } from '@ephox/sugar';

import { Editor as EditorType } from '../../alien/EditorTypes';
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

const hookNotRun = Fun.die('The setup hooks have not run yet');

const setupHooks = <T extends EditorType = EditorType>(
  settings: Record<string, any>,
  setupModules: Array<() => void>,
  focusOnInit: boolean,
  setupElement: () => Optional<SetupElement>
): Hook<T> => {
  let lazyEditor: () => T = hookNotRun;
  let teardownEditor: () => void = Fun.noop;
  let setup: Optional<SetupElement> = Optional.none();
  let hasFailure = false;

  before(function (done) {
    // TINY-7039: Double the timeout as sometimes 2s wasn't enough for more complex editor loads
    this.timeout(4000);
    setup = setupElement();
    Loader.setup({
      preInit: (tinymce, settings) => {
        setupTinymceBaseUrl(tinymce, settings);
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
  });

  return {
    editor: () => lazyEditor()
  };
};

const bddSetup = <T extends EditorType = EditorType>(settings: Record<string, any>, setupModules: Array<() => void> = [], focusOnInit: boolean = false): Hook<T> => {
  return setupHooks(settings, setupModules, focusOnInit, Optional.none);
};

const bddSetupLight = <T extends EditorType = EditorType>(settings: Record<string, any>, setupModules: Array<() => void> = [], focusOnInit: boolean = false): Hook<T> => {
  return setupHooks({
    toolbar: '',
    menubar: false,
    statusbar: false,
    ...settings
  }, setupModules, focusOnInit, Optional.none);
};

const bddSetupFromElement = <T extends EditorType = EditorType>(settings: Record<string, any>, setupElement: () => SetupElement, setupModules: Array<() => void> = [], focusOnInit: boolean = false): Hook<T> => {
  return setupHooks(settings, setupModules, focusOnInit, () => Optional.some(setupElement()));
};

const bddSetupInShadowRoot = <T extends EditorType = EditorType>(settings: Record<string, any>, setupModules: Array<() => void> = [], focusOnInit: boolean = false): ShadowRootHook<T> => {
  let lazyShadowRoot: () => SugarElement<ShadowRoot> = hookNotRun;
  let editorDiv: Optional<SugarElement<HTMLElement>>;
  let teardown: () => void = Fun.noop;

  before(function () {
    if (!SugarShadowDom.isSupported()) {
      this.skip();
    }

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

  const hooks = setupHooks<T>(settings, setupModules, focusOnInit, () => editorDiv.map((element) => ({ element, teardown })));

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
