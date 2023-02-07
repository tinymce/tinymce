import { AlloyComponent, Boxes, Channels, Docking, OffsetOrigin, VerticalDir } from '@ephox/alloy';
import { Arr, Cell, Fun, Optional, Singleton } from '@ephox/katamari';
import { Attribute, Compare, Css, Height, SugarBody, SugarElement, SugarLocation, Traverse, Width } from '@ephox/sugar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';

import * as Options from '../../api/Options';
import { UiFactoryBackstage } from '../../backstage/Backstage';
import { ReadyUiReferences } from '../../modes/UiReferences';
import OuterContainer from '../general/OuterContainer';
import * as EditorSize from '../sizing/EditorSize';
import * as Utils from '../sizing/Utils';

export interface InlineHeader {
  readonly isVisible: () => boolean;
  readonly isPositionedAtTop: () => boolean;
  readonly show: () => void;
  readonly hide: () => void;
  readonly update: () => void;
  readonly updateMode: () => void;
  readonly repositionPopups: () => void;
}

const { ToolbarLocation, ToolbarMode } = Options;

export const InlineHeader = (
  editor: Editor,
  targetElm: SugarElement<HTMLElement>,
  uiRefs: ReadyUiReferences,
  backstage: UiFactoryBackstage,
  floatContainer: Singleton.Value<AlloyComponent>
): InlineHeader => {
  const { mainUi, uiMotherships } = uiRefs;
  const DOM = DOMUtils.DOM;
  const useFixedToolbarContainer = Options.useFixedContainer(editor);
  const isSticky = Options.isStickyToolbar(editor);
  const editorMaxWidthOpt = Options.getMaxWidthOption(editor).or(EditorSize.getWidth(editor));
  const headerBackstage = backstage.shared.header;
  const isPositionedAtTop = headerBackstage.isPositionedAtTop;

  const toolbarMode = Options.getToolbarMode(editor);
  const isSplitToolbar = toolbarMode === ToolbarMode.sliding || toolbarMode === ToolbarMode.floating;

  const visible = Cell(false);

  const isVisible = () => visible.get() && !editor.removed;

  // Calculate the toolbar offset when using a split toolbar drawer
  const calcToolbarOffset = (toolbar: Optional<AlloyComponent>) => isSplitToolbar ?
    toolbar.fold(Fun.constant(0), (tbar) =>
      // If we have an overflow toolbar, we need to offset the positioning by the height of the overflow toolbar
      tbar.components().length > 1 ? Height.get(tbar.components()[1].element) : 0
    ) : 0;

  const calcMode = (container: AlloyComponent): 'top' | 'bottom' => {
    switch (Options.getToolbarLocation(editor)) {
      case ToolbarLocation.auto:
        const toolbar = OuterContainer.getToolbar(mainUi.outerContainer);
        const offset = calcToolbarOffset(toolbar);
        const toolbarHeight = Height.get(container.element) - offset;
        const targetBounds = Boxes.box(targetElm);

        // Determine if the toolbar has room to render at the top/bottom of the document
        const roomAtTop = targetBounds.y > toolbarHeight;
        if (roomAtTop) {
          return 'top';
        } else {
          const doc = Traverse.documentElement(targetElm);
          const docHeight = Math.max(doc.dom.scrollHeight, Height.get(doc));
          const roomAtBottom = targetBounds.bottom < docHeight - toolbarHeight;

          // If there isn't ever room to add the toolbar above the target element, then place the toolbar at the bottom.
          // Likewise if there's no room at the bottom, then we should show at the top. If there's no room at the bottom
          // or top, then prefer the bottom except when it'll prevent accessing the content at the bottom.
          // Make sure to exclude scroll position, as we want to still show at the top if the user can scroll up to undock
          if (roomAtBottom) {
            return 'bottom';
          } else {
            const winBounds = Boxes.win();
            const isRoomAtBottomViewport = winBounds.bottom < targetBounds.bottom - toolbarHeight;
            return isRoomAtBottomViewport ? 'bottom' : 'top';
          }
        }
      case ToolbarLocation.bottom:
        return 'bottom';
      case ToolbarLocation.top:
      default:
        return 'top';
    }
  };

  const setupMode = (mode: 'top' | 'bottom') => {
    // Update the docking mode
    floatContainer.on((container) => {
      Docking.setModes(container, [ mode ]);
      headerBackstage.setDockingMode(mode);

      // Update the vertical menu direction
      const verticalDir = isPositionedAtTop() ? VerticalDir.AttributeValue.TopToBottom : VerticalDir.AttributeValue.BottomToTop;
      Attribute.set(container.element, VerticalDir.Attribute, verticalDir);
    });
  };

  const updateChromeWidth = () => {
    floatContainer.on((container) => {
      // Update the max width of the inline toolbar
      const maxWidth = editorMaxWidthOpt.getOrThunk(() => {
        // No max width, so use the body width, minus the left pos as the maximum
        const bodyMargin = Utils.parseToInt(Css.get(SugarBody.body(), 'margin-left')).getOr(0);
        return Width.get(SugarBody.body()) - SugarLocation.absolute(targetElm).left + bodyMargin;
      });
      Css.set(container.element, 'max-width', maxWidth + 'px');
    });
  };

  const updateChromePosition = () => {
    floatContainer.on((container) => {
      const toolbar = OuterContainer.getToolbar(mainUi.outerContainer);
      const offset = calcToolbarOffset(toolbar);

      // The float container/editor may not have been rendered yet, which will cause it to have a non integer based positions
      // so we need to round this to account for that.

      const targetBounds = Boxes.box(targetElm);
      const { top, left } = getOffsetParent(editor, mainUi.outerContainer.element).fold(
        () => {
          return {
            top: isPositionedAtTop()
              ? Math.max(targetBounds.y - Height.get(container.element) + offset, 0)
              : targetBounds.bottom,
            left: targetBounds.x,
          };
        },
        (offsetParent) => {
          // Because for ui_mode: split, the main mothership (which includes the toolbar) is moved and added as a sibling
          // If there's any relative position div set as the parent and the offsetParent is no longer the body,
          // the absolute top/left positions would no longer be correct
          // When there's a relative div and the position is the same as the toolbar container
          // then it would produce a negative top as it needs to be positioned on top of the offsetParent
          const offsetBox = Boxes.box(offsetParent);
          const scrollDelta = offsetParent.dom.scrollTop ?? 0;

          const isOffsetParentBody = Compare.eq(offsetParent, SugarBody.body());
          const topValue = isOffsetParentBody
            ? Math.max(targetBounds.y - Height.get(container.element) + offset, 0)
            : targetBounds.y - offsetBox.y + scrollDelta - Height.get(container.element) + offset;

          return {
            top: isPositionedAtTop()
              ? topValue
              : targetBounds.bottom,
            left: isOffsetParentBody
              ? targetBounds.x
              : targetBounds.x - offsetBox.x
          };
        }
      );

      Css.setAll(mainUi.outerContainer.element, {
        position: 'absolute',
        top: Math.round(top) + 'px',
        left: Math.round(left) + 'px'
      });
    });
  };

  // This would return Optional.none, for ui_mode: default, which will fallback to the default code block
  // For ui_mode: split, the offsetParent would be the body if there were no relative div set as parent
  const getOffsetParent = (editor: Editor, element: SugarElement<HTMLElement>) => Options.isSplitUiMode(editor) ? OffsetOrigin.getOffsetParent(element) : Optional.none();

  const repositionPopups = () => {
    Arr.each(uiMotherships, (m) => {
      m.broadcastOn([ Channels.repositionPopups() ], { });
    });
  };

  const updateChromeUi = (stickyAction: (c: AlloyComponent) => void) => {
    // Skip updating the ui if it's hidden
    if (!isVisible()) {
      return;
    }

    // Handles positioning, docking and SplitToolbar (more drawer) behaviour. Modes:
    // 1. Basic inline: does positioning and docking
    // 2. Inline + more drawer: does positioning, docking and SplitToolbar
    // 3. Inline + fixed_toolbar_container: does nothing
    // 4. Inline + fixed_toolbar_container + more drawer: does SplitToolbar

    // Update the max width, as the body width may have changed
    if (!useFixedToolbarContainer) {
      updateChromeWidth();
    }

    // Refresh split toolbar. A split toolbar requires a calculation to see what ends up in the
    // "more drawer". When we don't have a split toolbar, then there is no reason to refresh the toolbar
    // when the size changes.
    if (isSplitToolbar) {
      OuterContainer.refreshToolbar(mainUi.outerContainer);
    }

    // Positioning
    if (!useFixedToolbarContainer) {
      updateChromePosition();
    }

    // Docking
    if (isSticky) {
      floatContainer.on(stickyAction);
    }

    // Floating toolbar
    repositionPopups();
  };

  const doUpdateMode = (): boolean => {
    // Skip updating the mode if the toolbar is hidden, is
    // using a fixed container or has sticky toolbars disabled
    if (useFixedToolbarContainer || !isSticky || !isVisible()) {
      return false;
    }

    return floatContainer.get().exists(
      (fc) => {
        const currentMode = headerBackstage.getDockingMode();
        const newMode = calcMode(fc);
        // Note: the docking mode will only be able to change when the `toolbar_location`
        // is set to "auto".
        if (newMode !== currentMode) {
          setupMode(newMode);
          return true;
        } else {
          return false;
        }
      }
    );
  };

  const show = () => {
    visible.set(true);
    Css.set(mainUi.outerContainer.element, 'display', 'flex');
    DOM.addClass(editor.getBody(), 'mce-edit-focus');
    Arr.each(uiMotherships, (m) => {
      // We remove the display style when showing, because when hiding, we set it to "none"
      Css.remove(m.element, 'display');
    });
    doUpdateMode();

    if (Options.isSplitUiMode(editor)) {
      // When the toolbar is shown, then hidden and when the page is then scrolled,
      // the toolbar is set to docked, which shouldn't be as it should be static position
      // calling reset here, to reset the state.
      // Another case would be when the toolbar is shown initially (with location_bottom)
      // we don't want to dock the toolbar, calling Docking.refresh
      updateChromeUi((elem) => Docking.isDocked(elem) ? Docking.reset(elem) : Docking.refresh(elem));
    } else {
      // Even if we aren't updating the docking mode, we still want to reposition
      // the Ui. NOTE: We are using Docking.refresh here, rather than Docking.reset. This
      // means it should keep whatever its "previous" coordinates were, and will just
      // behave like the window was scrolled again, and Docking needs to work out if it
      // is going to dock / undock
      updateChromeUi(Docking.refresh);
    }
  };

  const hide = () => {
    visible.set(false);
    Css.set(mainUi.outerContainer.element, 'display', 'none');
    DOM.removeClass(editor.getBody(), 'mce-edit-focus');
    Arr.each(uiMotherships, (m) => {
      Css.set(m.element, 'display', 'none');
    });
  };

  const update = () => {
    // Because we use Docking.reset here instead of Docking.refresh. That means
    // that it will revert back to its original position, clear any state, and then
    // trigger a refresh. This should be called in situations where the DOM has
    // changed significantly (resizing, scrolling etc.)
    updateChromeUi(Docking.reset);
  };

  const updateMode = () => {
    const changedMode = doUpdateMode();
    // If the docking mode has changed due to the update, we want to reset
    // docking. This will clear any prior stored positions
    if (changedMode) {
      update();
    }
  };

  return {
    isVisible,
    isPositionedAtTop,
    show,
    hide,
    update,
    updateMode,
    repositionPopups
  };
};
