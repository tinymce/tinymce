import { AlloyComponent, Attachment, Boxes, Disabling } from '@ephox/alloy';
import { Cell, Singleton } from '@ephox/katamari';
import { DomEvent, SugarElement } from '@ephox/sugar';

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
        ui.update(true);
      } else if (hasResized) {
        ui.updateMode();
        ui.repositionPopups();
      }
    }
  };

  if (!toolbarPersist) {
    editor.on('activate', ui.show);
    editor.on('deactivate', ui.hide);
  }

  editor.on('SkinLoaded ResizeWindow', () => ui.update(true));

  editor.on('NodeChange keydown', (e) => {
    requestAnimationFrame(() => resizeContent(e));
  });

  editor.on('ScrollWindow', () => ui.updateMode());

  // Bind to async load events and trigger a content resize event if the size has changed
  const elementLoad = Singleton.unbindable();
  elementLoad.set(DomEvent.capture(SugarElement.fromDom(editor.getBody()), 'load', (e) => resizeContent(e.raw)));

  editor.on('remove', () => {
    elementLoad.clear();
  });
};

// TINY-9226: If ui_of_tomorrow is set, then attach the popup mothership adjacent to the target node
const attachUiMotherships = (editor: Editor, uiRoot: SugarElement<HTMLElement | ShadowRoot>, targetElm: SugarElement<HTMLElement>, uiRefs: ReadyUiReferences) => {
  if (Options.isUiOfTomorrow(editor)) {
    Attachment.attachSystemAfter(targetElm, uiRefs.popupUi.mothership);
  }
  // In UiRefs, dialogUi and popupUi refer to the same thing if ui_of_tomorrow is false
  Attachment.attachSystem(uiRoot, uiRefs.dialogUi.mothership);
};

const render = (editor: Editor, uiRefs: ReadyUiReferences, rawUiConfig: RenderUiConfig, backstage: UiFactoryBackstage, args: RenderArgs): ModeRenderInfo => {
  const { mainUi } = uiRefs;
  const floatContainer = Singleton.value<AlloyComponent>();
  const targetElm = SugarElement.fromDom(args.targetNode);
  const ui = InlineHeader(editor, targetElm, uiRefs, backstage, floatContainer);
  const toolbarPersist = Options.isToolbarPersist(editor);

  loadInlineSkin(editor);

  const render = () => {
    if (floatContainer.isSet()) {
      ui.show();
      return;
    }

    floatContainer.set(OuterContainer.getHeader(mainUi.outerContainer).getOrDie());

    const uiContainer = Options.getUiContainer(editor);
    Attachment.attachSystem(uiContainer, mainUi.mothership);
    attachUiMotherships(editor, uiContainer, targetElm, uiRefs);

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
