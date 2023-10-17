import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour, Boxes, Docking, GuiFactory, HotspotAnchorSpec, InlineView, Keying,
  MakeshiftAnchorSpec, ModalDialog, NodeAnchorSpec, SelectionAnchorSpec, SystemEvents
} from '@ephox/alloy';
import { StructureProcessor, StructureSchema } from '@ephox/boulder';
import { Dialog, DialogManager } from '@ephox/bridge';
import { Optional, Singleton, Type } from '@ephox/katamari';
import { SelectorExists, SugarBody, SugarElement, SugarLocation } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { WindowManagerImpl, WindowParams } from 'tinymce/core/api/WindowManager';

import * as Options from '../../api/Options';
import { UiFactoryBackstagePair } from '../../backstage/Backstage';
import * as ScrollingContext from '../../modes/ScrollingContext';
import { formCancelEvent } from '../general/FormEvents';
import { renderDialog } from '../window/SilverDialog';
import { renderInlineDialog } from '../window/SilverInlineDialog';
import { renderUrlDialog } from '../window/SilverUrlDialog';
import * as AlertDialog from './AlertDialog';
import * as ConfirmDialog from './ConfirmDialog';

export interface WindowManagerSetup {
  readonly backstages: UiFactoryBackstagePair;
  readonly editor: Editor;
}

type InlineDialogAnchor = HotspotAnchorSpec | MakeshiftAnchorSpec | NodeAnchorSpec | SelectionAnchorSpec;

const validateData = <T extends Dialog.DialogData>(data: Partial<T>, validator: StructureProcessor) => StructureSchema.getOrDie(StructureSchema.asRaw('data', validator, data));

const isAlertOrConfirmDialog = (target: SugarElement<Node>): boolean =>
  SelectorExists.closest(target, '.tox-alert-dialog') || SelectorExists.closest(target, '.tox-confirm-dialog');

const inlineAdditionalBehaviours = (editor: Editor, isStickyToolbar: boolean, isToolbarLocationTop: boolean): Behaviour.NamedConfiguredBehaviour<any, any>[] => {
  // When using sticky toolbars it already handles the docking behaviours so applying docking would
  // do nothing except add additional processing when scrolling, so we don't want to include it here
  // (Except when the toolbar is located at the bottom since the anchor will be at the top)
  if (isStickyToolbar && isToolbarLocationTop) {
    return [ ];
  } else {
    return [
      Docking.config({
        contextual: {
          lazyContext: () => Optional.some(Boxes.box(SugarElement.fromDom(editor.getContentAreaContainer()))),
          fadeInClass: 'tox-dialog-dock-fadein',
          fadeOutClass: 'tox-dialog-dock-fadeout',
          transitionClass: 'tox-dialog-dock-transition'
        },
        modes: [ 'top' ],
        lazyViewport: (comp) => {
          // If we don't have a special scrolling environment, then just use the default
          // viewport of (window)
          const optScrollingContext = ScrollingContext.detectWhenSplitUiMode(editor, comp.element);
          return optScrollingContext
            .map(
              (sc) => {
                const combinedBounds = ScrollingContext.getBoundsFrom(sc);
                return {
                  bounds: combinedBounds,
                  optScrollEnv: Optional.some({
                    currentScrollTop: sc.element.dom.scrollTop,
                    scrollElmTop: SugarLocation.absolute(sc.element).top
                  })
                };
              }
            ).getOrThunk(
              () => ({
                bounds: Boxes.win(),
                optScrollEnv: Optional.none()
              })
            );
        }
      })
    ];
  }
};

const setup = (extras: WindowManagerSetup): WindowManagerImpl => {
  const editor = extras.editor;
  const isStickyToolbar = Options.isStickyToolbar(editor);

  // Alert and Confirm dialogs are Modal Dialogs
  const alertDialog = AlertDialog.setup(extras.backstages.dialog);
  const confirmDialog = ConfirmDialog.setup(extras.backstages.dialog);

  const open = <T extends Dialog.DialogData>(config: Dialog.DialogSpec<T>, params: WindowParams | undefined, closeWindow: (dialogApi: Dialog.DialogInstanceApi<T>) => void): Dialog.DialogInstanceApi<T> => {
    if (!Type.isUndefined(params)) {
      if (params.inline === 'toolbar') {
        return openInlineDialog(config, extras.backstages.popup.shared.anchors.inlineDialog(), closeWindow, params);
      } else if (params.inline === 'bottom') {
        return openBottomInlineDialog(config, extras.backstages.popup.shared.anchors.inlineBottomDialog(), closeWindow, params);
      } else if (params.inline === 'cursor') {
        return openInlineDialog(config, extras.backstages.popup.shared.anchors.cursor(), closeWindow, params);
      }
    }

    return openModalDialog(config, closeWindow);
  };

  const openUrl = (config: Dialog.UrlDialogSpec, closeWindow: (dialogApi: Dialog.UrlDialogInstanceApi) => void) =>
    openModalUrlDialog(config, closeWindow);

  const openModalUrlDialog = (config: Dialog.UrlDialogSpec, closeWindow: (dialogApi: Dialog.UrlDialogInstanceApi) => void) => {
    const factory = (contents: Dialog.UrlDialog): Dialog.UrlDialogInstanceApi => {
      const dialog = renderUrlDialog(
        contents,
        {
          closeWindow: () => {
            ModalDialog.hide(dialog.dialog);
            closeWindow(dialog.instanceApi);
          }
        },
        editor,
        extras.backstages.dialog
      );

      ModalDialog.show(dialog.dialog);
      return dialog.instanceApi;
    };

    return DialogManager.DialogManager.openUrl(factory, config);
  };

  const openModalDialog = <T extends Dialog.DialogData>(config: Dialog.DialogSpec<T>, closeWindow: (dialogApi: Dialog.DialogInstanceApi<T>) => void): Dialog.DialogInstanceApi<T> => {
    const factory = (contents: Dialog.Dialog<T>, internalInitialData: Partial<T>, dataValidator: StructureProcessor): Dialog.DialogInstanceApi<T> => {
      // We used to validate data here, but it's done by the instanceApi.setData call below.
      const initialData = internalInitialData;

      const dialogInit: DialogManager.DialogInit<T> = {
        dataValidator,
        initialData,
        internalDialog: contents
      };

      const dialog = renderDialog<T>(
        dialogInit,
        {
          redial: DialogManager.DialogManager.redial,
          closeWindow: () => {
            ModalDialog.hide(dialog.dialog);
            closeWindow(dialog.instanceApi);
          }
        },
        extras.backstages.dialog
      );

      ModalDialog.show(dialog.dialog);
      dialog.instanceApi.setData(initialData);
      return dialog.instanceApi;
    };

    return DialogManager.DialogManager.open<T>(factory, config);
  };

  const openInlineDialog = <T extends Dialog.DialogData>(config: Dialog.DialogSpec<T>, anchor: InlineDialogAnchor, closeWindow: (dialogApi: Dialog.DialogInstanceApi<T>) => void, windowParams: WindowParams): Dialog.DialogInstanceApi<T> => {
    const factory = (contents: Dialog.Dialog<T>, internalInitialData: Partial<T>, dataValidator: StructureProcessor): Dialog.DialogInstanceApi<T> => {
      const initialData = validateData<T>(internalInitialData, dataValidator);
      const inlineDialog = Singleton.value<AlloyComponent>();
      const isToolbarLocationTop = extras.backstages.popup.shared.header.isPositionedAtTop();

      const dialogInit = {
        dataValidator,
        initialData,
        internalDialog: contents
      };

      const refreshDocking = () => inlineDialog.on((dialog) => {
        InlineView.reposition(dialog);
        if (!isStickyToolbar || !isToolbarLocationTop) {
          Docking.refresh(dialog);
        }
      });

      const dialogUi = renderInlineDialog<T>(
        dialogInit,
        {
          redial: DialogManager.DialogManager.redial,
          closeWindow: () => {
            inlineDialog.on(InlineView.hide);
            editor.off('ResizeEditor', refreshDocking);
            inlineDialog.clear();
            closeWindow(dialogUi.instanceApi);
          }
        },
        extras.backstages.popup,
        windowParams.ariaAttrs,
        refreshDocking
      );

      const inlineDialogComp = GuiFactory.build(InlineView.sketch({
        lazySink: extras.backstages.popup.shared.getSink,
        dom: {
          tag: 'div',
          classes: [ ]
        },
        // Fires the default dismiss event.
        fireDismissalEventInstead: (windowParams.persistent ? { event: 'doNotDismissYet' } : { }),
        // TINY-9412: The docking behaviour for inline dialogs is inconsistent
        // for toolbar_location: bottom. We need to clarify exactly what the behaviour
        // should be. The intent here might have been that they shouldn't automatically
        // reposition at all because they aren't visually connected to the toolbar
        // (i.e. inline "toolbar" dialogs still display at the top, even when the
        // toolbar_location is bottom), but it's unclear.
        ...isToolbarLocationTop ? { } : { fireRepositionEventInstead: { }},
        inlineBehaviours: Behaviour.derive([
          AddEventsBehaviour.config('window-manager-inline-events', [
            AlloyEvents.run(SystemEvents.dismissRequested(), (_comp, _se) => {
              AlloyTriggers.emit(dialogUi.dialog, formCancelEvent);
            })
          ]),
          ...inlineAdditionalBehaviours(editor, isStickyToolbar, isToolbarLocationTop)
        ]),
        // Treat alert or confirm dialogs as part of the inline dialog
        isExtraPart: (_comp, target) => isAlertOrConfirmDialog(target)
      }));
      inlineDialog.set(inlineDialogComp);

      const getInlineDialogBounds = (): Optional<Boxes.Bounds> => {
        // At the moment the inline dialog is just put anywhere in the body, and docking is what is used to make
        // sure that it stays onscreen
        const elem = editor.inline ? SugarBody.body() : SugarElement.fromDom(editor.getContainer());
        const bounds = Boxes.box(elem);
        return Optional.some(bounds);
      };

      // Position the inline dialog
      InlineView.showWithinBounds(
        inlineDialogComp,
        GuiFactory.premade(dialogUi.dialog),
        { anchor },
        getInlineDialogBounds
      );

      // Refresh the docking position if not using a sticky toolbar
      if (!isStickyToolbar || !isToolbarLocationTop) {
        Docking.refresh(inlineDialogComp);

        // Bind to the editor resize event and update docking as needed. We don't need to worry about
        // 'ResizeWindow` as that's handled by docking already.
        editor.on('ResizeEditor', refreshDocking);
      }

      // Set the initial data in the dialog and focus the first focusable item
      dialogUi.instanceApi.setData(initialData);
      Keying.focusIn(dialogUi.dialog);

      return dialogUi.instanceApi;
    };

    return DialogManager.DialogManager.open<T>(factory, config);
  };

  const openBottomInlineDialog = <T extends Dialog.DialogData>(config: Dialog.DialogSpec<T>, anchor: InlineDialogAnchor, closeWindow: (dialogApi: Dialog.DialogInstanceApi<T>) => void, windowParams: WindowParams): Dialog.DialogInstanceApi<T> => {
    const factory = (contents: Dialog.Dialog<T>, internalInitialData: Partial<T>, dataValidator: StructureProcessor): Dialog.DialogInstanceApi<T> => {
      const initialData = validateData<T>(internalInitialData, dataValidator);
      const inlineDialog = Singleton.value<AlloyComponent>();
      const isToolbarLocationTop = extras.backstages.popup.shared.header.isPositionedAtTop();

      const dialogInit = {
        dataValidator,
        initialData,
        internalDialog: contents
      };

      const refreshDocking = () => inlineDialog.on((dialog) => {
        InlineView.reposition(dialog);
        Docking.refresh(dialog);
      });

      const dialogUi = renderInlineDialog<T>(
        dialogInit,
        {
          redial: DialogManager.DialogManager.redial,
          closeWindow: () => {
            inlineDialog.on(InlineView.hide);
            editor.off('ResizeEditor ScrollWindow ElementScroll', refreshDocking);
            inlineDialog.clear();
            closeWindow(dialogUi.instanceApi);
          }
        },
        extras.backstages.popup,
        windowParams.ariaAttrs,
        refreshDocking
      );

      const inlineDialogComp = GuiFactory.build(InlineView.sketch({
        lazySink: extras.backstages.popup.shared.getSink,
        dom: {
          tag: 'div',
          classes: [ ]
        },
        // Fires the default dismiss event.
        fireDismissalEventInstead: (windowParams.persistent ? { event: 'doNotDismissYet' } : { }),
        ...isToolbarLocationTop ? { } : { fireRepositionEventInstead: { }},
        inlineBehaviours: Behaviour.derive([
          AddEventsBehaviour.config('window-manager-inline-events', [
            AlloyEvents.run(SystemEvents.dismissRequested(), (_comp, _se) => {
              AlloyTriggers.emit(dialogUi.dialog, formCancelEvent);
            })
          ]),
          Docking.config({
            contextual: {
              lazyContext: () => Optional.some(Boxes.box(SugarElement.fromDom(editor.getContentAreaContainer()))),
              fadeInClass: 'tox-dialog-dock-fadein',
              fadeOutClass: 'tox-dialog-dock-fadeout',
              transitionClass: 'tox-dialog-dock-transition'
            },
            modes: [ 'top', 'bottom' ],
            lazyViewport: (comp) => {
              const optScrollingContext = ScrollingContext.detectWhenSplitUiMode(editor, comp.element);
              return optScrollingContext.map((sc) => {
                const combinedBounds = ScrollingContext.getBoundsFrom(sc);
                return {
                  bounds: combinedBounds,
                  optScrollEnv: Optional.some({
                    currentScrollTop: sc.element.dom.scrollTop,
                    scrollElmTop: SugarLocation.absolute(sc.element).top
                  })
                };
              }).getOrThunk(() => ({
                bounds: Boxes.win(),
                optScrollEnv: Optional.none()
              }));
            }
          })
        ]),
        // Treat alert or confirm dialogs as part of the inline dialog
        isExtraPart: (_comp, target) => isAlertOrConfirmDialog(target)
      }));
      inlineDialog.set(inlineDialogComp);

      const getInlineDialogBounds = (): Optional<Boxes.Bounds> => {
        return extras.backstages.popup.shared.getSink().toOptional().bind((s) => {
          const optScrollingContext = ScrollingContext.detectWhenSplitUiMode(editor, s.element);

          // Margin between element and the bottom of the screen or the editor content area container
          const margin = 15;

          const bounds = optScrollingContext.map((sc) => ScrollingContext.getBoundsFrom(sc)).getOr(Boxes.win());
          const contentAreaContainer = Boxes.box(SugarElement.fromDom(editor.getContentAreaContainer()));

          const constrainedBounds = Boxes.constrain(contentAreaContainer, bounds);

          return Optional.some(Boxes.bounds(constrainedBounds.x, constrainedBounds.y, constrainedBounds.width, constrainedBounds.height - margin));
        });
      };

      // Position the inline dialog
      InlineView.showWithinBounds(
        inlineDialogComp,
        GuiFactory.premade(dialogUi.dialog),
        { anchor },
        getInlineDialogBounds
      );

      Docking.refresh(inlineDialogComp);
      editor.on('ResizeEditor ScrollWindow ElementScroll ResizeWindow', refreshDocking);

      // Set the initial data in the dialog and focus the first focusable item
      dialogUi.instanceApi.setData(initialData);
      Keying.focusIn(dialogUi.dialog);

      return dialogUi.instanceApi;
    };

    return DialogManager.DialogManager.open<T>(factory, config);
  };

  const confirm = (message: string, callback: (state: boolean) => void) => {
    confirmDialog.open(message, callback);
  };

  const alert = (message: string, callback: () => void) => {
    alertDialog.open(message, callback);
  };

  const close = <T extends Dialog.DialogData>(instanceApi: Dialog.DialogInstanceApi<T> | Dialog.UrlDialogInstanceApi) => {
    instanceApi.close();
  };

  return {
    open,
    openUrl,
    alert,
    close,
    confirm
  };
};

export {
  setup
};
