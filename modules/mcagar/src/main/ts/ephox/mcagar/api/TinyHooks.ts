import { after, afterEach, before } from '@ephox/bedrock-client';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { Insert, Remove, SugarBody, SugarElement, SugarShadowDom } from '@ephox/sugar';
import 'tinymce';
import { Editor as EditorType } from '../alien/EditorTypes';
import * as Loader from '../loader/Loader';
import { setupTinymceBaseUrl } from '../loader/Urls';

export interface Hook<T extends EditorType> {
  readonly editor: () => T;
}

export interface ShadowRootHook<T extends EditorType> extends Hook<T> {
  readonly shadowRoot: () => SugarElement<ShadowRoot>;
}

const setupHooks = <T extends EditorType = EditorType>(
  settings: Record<string, any>,
  setupModules: Array<() => void>,
  focusOnInit: boolean,
  createElement: () => Optional<SugarElement>,
  teardown = Fun.noop
): Hook<T> => {
  let editor: T;
  let teardownEditor: () => void = Fun.noop;
  let hasFailure = false;

  before((done) => {
    Arr.each(setupModules, Fun.call);
    Loader.setup({
      preInit: setupTinymceBaseUrl,
      run: (ed, success) => {
        editor = ed;
        teardownEditor = success;
        if (focusOnInit) {
          editor.focus();
        }
        done();
      },
      success: Fun.noop,
      failure: done
    }, settings, createElement());
  });

  afterEach(function () {
    if (this.currentTest?.isFailed() === true) {
      hasFailure = true;
    }
  });

  after(() => {
    if (!hasFailure) {
      teardownEditor();
      teardown();
    }
  });

  return {
    editor: () => editor
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

const bddSetupFromElement = <T extends EditorType = EditorType>(settings: Record<string, any>, element: SugarElement, setupModules: Array<() => void> = [], focusOnInit: boolean = false): Hook<T> => {
  return setupHooks(settings, setupModules, focusOnInit, Fun.constant(Optional.some(element)));
};

const bddSetupInShadowRoot = <T extends EditorType = EditorType>(settings: Record<string, any>, setupModules: Array<() => void> = [], focusOnInit: boolean = false): ShadowRootHook<T> => {
  let shadowRoot: SugarElement<ShadowRoot>;
  let editorDiv: SugarElement<HTMLElement>;
  let teardown: () => void = Fun.noop;

  before(function () {
    if (!SugarShadowDom.isSupported()) {
      this.skip();
    }

    const shadowHost = SugarElement.fromTag('div', document);

    Insert.append(SugarBody.body(), shadowHost);
    shadowRoot = SugarElement.fromDom(shadowHost.dom.attachShadow({ mode: 'open' }));
    editorDiv = SugarElement.fromTag('div', document);

    Insert.append(shadowRoot, editorDiv);

    teardown = () => {
      Remove.remove(shadowHost);
    };
  });

  const hooks = setupHooks<T>(settings, setupModules, focusOnInit, () => Optional.from(editorDiv), () => teardown());

  return {
    ...hooks,
    shadowRoot: () => shadowRoot
  };
};

export {
  bddSetup,
  bddSetupLight,
  bddSetupFromElement,
  bddSetupInShadowRoot
};
