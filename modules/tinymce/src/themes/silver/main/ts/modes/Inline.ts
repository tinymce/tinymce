import { AlloyComponent, Attachment, Boxes, Disabling } from '@ephox/alloy';
import { Cell, Singleton } from '@ephox/katamari';
import { DomEvent, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent } from 'tinymce/core/api/EventTypes';
import { EditorUiApi } from 'tinymce/core/api/ui/Ui';

import * as Events from '../api/Events';
import { getUiContainer, isToolbarPersist } from '../api/Options';
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

const setupEvents = (editor: Editor, targetElm: SugarElement, ui: InlineUi, toolbarPersist: boolean) => {
  const prevPosAndBounds = Cell(getTargetPosAndBounds(targetElm, ui.isPositionedAtTop()));

  const resizeContent = (e: NodeChangeEvent | KeyboardEvent | Event) => {
    const { pos, bounds } = getTargetPosAndBounds(targetElm, ui.isPositionedAtTop());
    const { pos: prevPos, bounds: prevBounds } = prevPosAndBounds.get();

    const hasResized = bounds.height !== prevBounds.height || bounds.width !== prevBounds.width;
    prevPosAndBounds.set({ pos, bounds });

    // If we have detected that the box of the target element has changed dimensions, then fire
    // "resizeContent"
    if (hasResized) {
      Events.fireResizeContent(editor, e);
    }

    // If we have visible UI, and the position of the target element has moved, recalculate the
    // position of the InlineUi (including docking) and repositionPopups
    if (ui.isVisible()) {
      if (prevPos !== pos) {
        // We are resetting docking, because the target element has changed position.
        ui.update();
      } else if (hasResized) {
        // If we haven't moved position, but we have changed size, then update the docking mode,
        // and only recalculate the position (and repositionPopups) only if the docking mode has changed
        ui.updateMode(true);

        // This repositionPopups call is going to be a duplicate if updateMode identifies
        // that the mode has changed. We probably need to make it a bit more granular .. so
        // that we can just query if the mode has changed. Otherwise, we're going to end up with
        // situations like this where we are doing a potentially expensive operation
        // (repositionPopups) more than once.
        ui.repositionPopups();
      }
    }
  };

  // If we are persisting the toolbar, then the ui doesn't show/hide, and just stays open
  if (!toolbarPersist) {
    editor.on('activate', ui.show);
    editor.on('deactivate', ui.hide);
  }

  // Get initial position and position on resize window. We also reset docking here.
  editor.on('SkinLoaded ResizeWindow', () => ui.update());

  // Check on all nodeChanges and keydown to see if the content has been resized.
  editor.on('NodeChange keydown', (e) => {
    requestAnimationFrame(() => resizeContent(e));
  });

  // This true means it will call update as well (if the docking changes)
  editor.on('ScrollWindow', () => ui.updateMode(true));

  // Bind to async load events and trigger a content resize event if the size has changed
  const elementLoad = Singleton.unbindable();
  // This is handling resizing based on anything loading inside the content (e.g. img tags)
  elementLoad.set(DomEvent.capture(SugarElement.fromDom(editor.getBody()), 'load', (e) => resizeContent(e.raw)));

  editor.on('ElementScroll', (_args) => {
    // The update mode thing only does something if ToolbarLocation is auto
    requestAnimationFrame(() => ui.update());
  });

  editor.on('remove', () => {
    elementLoad.clear();
  });
};

// With two sinks in inline mode, the dialog mothership should be attached to the ui
// root, and the popup mothership should be attached *after* the target node (for inline)
const attachUiMotherships = (uiRoot: SugarElement<HTMLElement | ShadowRoot>, uiRefs: ReadyUiReferences, targetElm: SugarElement<HTMLElement>) => {
  Attachment.attachSystem(uiRoot, uiRefs.dialogUi.mothership);
  Attachment.attachSystemAfter(targetElm, uiRefs.popupUi.mothership);
};

export interface InlineUi {
  readonly isVisible: () => boolean;
  readonly repositionPopups: () => void;

  // So how does update and updateMode and repositionPopups compare?
  // Update also always calls repositionPopups if the toolbar if the UI is visible
  readonly update: () => void;

  // This will call update only if (updateUi is true, and the docking mode has changed)
  // It also changes the current docking
  readonly updateMode: (updateUi: boolean) => void;
  readonly show: () => void;
  readonly hide: () => void;
  readonly isPositionedAtTop: () => boolean;
}

const renderUsingUi = (
  editor: Editor,
  uiRefs: ReadyUiReferences,
  rawUiConfig: RenderUiConfig,
  backstage: UiFactoryBackstage,
  args: RenderArgs,
  makeUi: (
    floatContainer: Singleton.Value<AlloyComponent>,
    targetElm: SugarElement<HTMLElement>
  ) => InlineUi
) => {
  const { mainUi } = uiRefs;

  // This is used to store the reference to the header part of OuterContainer, which is
  // *not* created by this. This reference is leveraged to make sure that we only bind
  // events for an inline container *once* ... because our show function is just the
  // InlineHeader's show function if this reference is already set.
  const floatContainer = Singleton.value<AlloyComponent>();
  const targetElm = SugarElement.fromDom(args.targetNode);
  const ui = makeUi(floatContainer, targetElm);
  const toolbarPersist = isToolbarPersist(editor);

  loadInlineSkin(editor);

  const render = () => {
    // Because we set the floatContainer immediately afterwards, this is just telling us
    // if we have already called this code (e.g. show, hide, show) - then don't do anything
    // more than show. Don't setup the events again.
    if (floatContainer.isSet()) {
      ui.show();
      return;
    }

    floatContainer.set(OuterContainer.getHeader(mainUi.outerContainer).getOrDie());

    // This handles *where* the inline Ui gets added. Currently, uiContainer will mostly
    // be the <body> of the document (unless it's a ShadowRoot)
    const uiContainer = getUiContainer(editor);
    Attachment.attachSystemAfter(targetElm, mainUi.mothership);
    attachUiMotherships(uiContainer, uiRefs, targetElm);

    // Unlike menubar, this has to handle different types of toolbars, so it has a further
    // abstraction.
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

const render = (editor: Editor, uiRefs: ReadyUiReferences, rawUiConfig: RenderUiConfig, backstage: UiFactoryBackstage, args: RenderArgs): ModeRenderInfo => {
  return renderUsingUi(
    editor,
    uiRefs,
    rawUiConfig,
    backstage,
    args,
    (floatContainer: Singleton.Value<AlloyComponent>, targetElm: SugarElement<HTMLElement>) =>
      InlineHeader(editor, targetElm, uiRefs, backstage, floatContainer)
  );
};

export {
  render
};
