import { AlloyComponent, Attachment, Boxes, Disabling, Docking } from '@ephox/alloy';
import { Cell, Singleton, Throttler } from '@ephox/katamari';
import { DomEvent, Scroll, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent } from 'tinymce/core/api/EventTypes';
import { EditorUiApi } from 'tinymce/core/api/ui/Ui';

import * as Events from '../api/Events';
import * as Options from '../api/Options';
import { UiFactoryBackstage } from '../backstage/Backstage';
import * as ReadOnly from '../ReadOnly';
import { ModeRenderInfo, RenderArgs, RenderUiConfig } from '../Render';
import OuterContainer from '../ui/general/OuterContainer';
import { InlineHeader } from '../ui/header/InlineHeader';
import { identifyMenus } from '../ui/menus/menubar/Integration';
import { inline as loadInlineSkin } from '../ui/skin/Loader';
import { setToolbar } from './Toolbars';
import { ReadyUiReferences } from './UiReferences';

const getTargetPosAndBounds = (targetElm: SugarElement, isToolbarTop: boolean) => {
  const bounds = Boxes.box(targetElm);
  return {
    pos: isToolbarTop ? bounds.y : bounds.bottom,
    bounds
  };
};

const setupEvents = (editor: Editor, targetElm: SugarElement, ui: InlineHeader, toolbarPersist: boolean) => {
  const prevPosAndBounds = Cell(getTargetPosAndBounds(targetElm, ui.isPositionedAtTop()));

  const resizeContent = (e: NodeChangeEvent | KeyboardEvent | Event) => {
    const { pos, bounds } = getTargetPosAndBounds(targetElm, ui.isPositionedAtTop());
    const { pos: prevPos, bounds: prevBounds } = prevPosAndBounds.get();

    const hasResized = bounds.height !== prevBounds.height || bounds.width !== prevBounds.width;
    prevPosAndBounds.set({ pos, bounds });

    if (hasResized) {
      Events.fireResizeContent(editor, e);
    }

    if (ui.isVisible()) {
      if (prevPos !== pos) {
        // The proposed toolbar location has moved, so we need to reposition the Ui. This might
        // include things like refreshing any Docking / stickiness for the toolbars
        ui.update(Docking.reset);
      } else if (hasResized) {
        // The proposed toolbar location hasn't moved, but the dimensions of the editor have changed.
        // We use "updateMode" here instead of "update". The primary reason is that "updateMode"
        // only repositions the Ui if it has detected that the docking mode needs to change, which
        // will only happen with `toolbar_location` is set to `auto`.
        ui.updateMode();

        // NOTE: This repositionPopups call is going to be a duplicate if "updateMode" identifies
        // that the mode has changed. We probably need to make it a bit more granular .. so
        // that we can just query if the mode has changed. Otherwise, we're going to end up with
        // situations like this where we are doing a potentially expensive operation
        // (repositionPopups) more than once.
        ui.repositionPopups();
      }
    }
  };

  if (!toolbarPersist) {
    editor.on('activate', ui.show);
    editor.on('deactivate', ui.hide);
  }

  // For both the initial load (SkinLoaded) and any resizes (ResizeWindow), we want to
  // update the positions of the Ui elements (and reset Docking / stickiness)
  editor.on('SkinLoaded ResizeWindow', () => ui.update(Docking.reset));

  editor.on('NodeChange keydown', (e) => {
    requestAnimationFrame(() => resizeContent(e));
  });

  // When the page has been scrolled, we need to update any docking positions. We also
  // want to reposition all the Ui elements if required.
  let lastScrollX = 0;
  const updateUi = Throttler.last(() => ui.update(Docking.refresh), 33);
  editor.on('ScrollWindow', () => {
    const newScrollX = Scroll.get().left;
    if (newScrollX !== lastScrollX) {
      lastScrollX = newScrollX;
      updateUi.throttle();
    }

    ui.updateMode();
  });

  if (Options.isSplitUiMode(editor)) {
    editor.on('ElementScroll', (_args) => {
      // When the scroller containing the editor scrolls, update the Ui positions
      ui.update(Docking.refresh);
    });
  }

  // Bind to async load events and trigger a content resize event if the size has changed
  // This is handling resizing based on anything loading inside the content (e.g. img tags)
  const elementLoad = Singleton.unbindable();
  elementLoad.set(DomEvent.capture(SugarElement.fromDom(editor.getBody()), 'load', (e) => resizeContent(e.raw)));

  editor.on('remove', () => {
    elementLoad.clear();
  });
};
const render = (editor: Editor, uiRefs: ReadyUiReferences, rawUiConfig: RenderUiConfig, backstage: UiFactoryBackstage, args: RenderArgs): ModeRenderInfo => {
  const { mainUi } = uiRefs;

  // This is used to store the reference to the header part of OuterContainer, which is
  // *not* created by this module. This reference is used to make sure that we only bind
  // events for an inline container *once* ... because our show function is just the
  // InlineHeader's show function if this reference is already set. We pass it through to
  // InlineHeader because InlineHeader will depend on it.
  const floatContainer = Singleton.value<AlloyComponent>();
  const targetElm = SugarElement.fromDom(args.targetNode);
  const ui = InlineHeader(editor, targetElm, uiRefs, backstage, floatContainer);
  const toolbarPersist = Options.isToolbarPersist(editor);

  loadInlineSkin(editor);

  const render = () => {
    // Because we set the floatContainer immediately afterwards, this is just telling us
    // if we have already called this code (e.g. show, hide, show) - then don't do anything
    // more than show. It's a pretty messy way of ensuring that all the code that follows
    // this `if` block is only executed once (setting up events etc.). So the first call
    // to `render` will execute it, but the second call won't. This `render` function is
    // used for most of the "show" handlers here, so the function can be invoked either
    // for the first time, or or just because something is being show again, after being
    // toggled to hidden earlier.
    if (floatContainer.isSet()) {
      ui.show();
      return;
    }

    // Set up the header part of OuterContainer. Once configured, the `InlineHeader` code
    // will use it when setting up and updating the Ui. This module uses it mainly just to
    // allow us to call `render` multiple times, but only have it execute the setup code once.
    floatContainer.set(OuterContainer.getHeader(mainUi.outerContainer).getOrDie());

    // `uiContainer` handles *where* the motherhips get added by default. Currently, uiContainer
    // will mostly be the <body> of the document (unless it's a ShadowRoot). When using ui_mode: split,
    // the main mothership (which includes the toolbar) and popup sinks will be added as siblings of
    // the target element, so that they have the same scrolling context / environment
    const uiContainer = Options.getUiContainer(editor);
    // Position the motherships based on the editor Ui options.
    if (Options.isSplitUiMode(editor)) {
      Attachment.attachSystemAfter(targetElm, mainUi.mothership);
      // Only in ui_mode: split, do we have a separate popup sink
      Attachment.attachSystemAfter(targetElm, uiRefs.popupUi.mothership);
    } else {
      Attachment.attachSystem(uiContainer, mainUi.mothership);
    }
    // NOTE: In UiRefs, dialogUi and popupUi refer to the same thing if ui_mode: combined
    Attachment.attachSystem(uiContainer, uiRefs.dialogUi.mothership);

    // Unlike menubar below which uses OuterContainer directly, this level of abstraction is
    // required because of the different types of toolbars available (e.g. multiple vs single)
    setToolbar(editor, uiRefs, rawUiConfig, backstage);

    OuterContainer.setMenubar(
      mainUi.outerContainer,
      identifyMenus(editor, rawUiConfig)
    );

    // Initialise the toolbar - set initial positioning then show
    ui.show();

    setupEvents(editor, targetElm, ui, toolbarPersist);

    editor.nodeChanged();
  };

  editor.on('show', render);
  editor.on('hide', ui.hide);

  if (!toolbarPersist) {
    editor.on('focus', render);
    editor.on('blur', ui.hide);
  }

  editor.on('init', () => {
    if (editor.hasFocus() || toolbarPersist) {
      render();
    }
  });

  ReadOnly.setupReadonlyModeSwitch(editor, uiRefs);

  const api: Partial<EditorUiApi> = {
    show: render,
    hide: ui.hide,
    setEnabled: (state) => {
      ReadOnly.broadcastReadonly(uiRefs, !state);
    },
    isEnabled: () => !Disabling.isDisabled(mainUi.outerContainer)
  };

  return {
    editorContainer: mainUi.outerContainer.element.dom,
    api
  };
};

export {
  render
};
