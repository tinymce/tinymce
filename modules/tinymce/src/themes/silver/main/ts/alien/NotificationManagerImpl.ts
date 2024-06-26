import { AlloyComponent, Behaviour, Boxes, Docking, Gui, GuiFactory, InlineView, Keying, MaxHeight, Replacing } from '@ephox/alloy';
import { Arr, Optional, Singleton, Type } from '@ephox/katamari';
import { Css, SugarElement, SugarLocation, Traverse, Width } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { NotificationApi, NotificationManagerImpl, NotificationSpec } from 'tinymce/core/api/NotificationManager';
import Delay from 'tinymce/core/api/util/Delay';

import * as Options from '../api/Options';
import { UiFactoryBackstage } from '../backstage/Backstage';
import * as ScrollingContext from '../modes/ScrollingContext';
import { Notification } from '../ui/general/Notification';

interface Extras {
  readonly backstage: UiFactoryBackstage;
}

export default (
  editor: Editor,
  extras: Extras,
  uiMothership: Gui.GuiSystem,
  notificationRegion: Singleton.Value<AlloyComponent>
): NotificationManagerImpl => {
  const sharedBackstage = extras.backstage.shared;

  const getBoundsContainer = () => SugarElement.fromDom(editor.queryCommandValue('ToggleView') === '' ? editor.getContentAreaContainer() : editor.getContainer());

  const getBounds = () => {
    const contentArea = Boxes.box(getBoundsContainer());
    return Optional.some(contentArea);
  };

  const clampComponentsToBounds = (components: AlloyComponent[]) => {
    getBounds().each((bounds) => {
      Arr.each(components, (comp) => {
        Css.remove(comp.element, 'width');
        if (Width.get(comp.element) > bounds.width) {
          Css.set(comp.element, 'width', bounds.width + 'px');
        }
      });
    });
  };

  const open = (settings: NotificationSpec, closeCallback: () => void, isEditorOrUIFocused: () => boolean): NotificationApi => {
    const close = () => {
      const removeNotificationAndReposition = (region: AlloyComponent) => {
        Replacing.remove(region, notification);
        reposition();
      };

      const manageRegionVisibility = (region: AlloyComponent, editorOrUiFocused: boolean) => {
        if (Traverse.children(region.element).length === 0) {
          handleEmptyRegion(region, editorOrUiFocused);
        } else {
          handleRegionWithChildren(region, editorOrUiFocused);
        }
      };

      const handleEmptyRegion = (region: AlloyComponent, editorOrUIFocused: boolean) => {
        InlineView.hide(region);
        notificationRegion.clear();
        if (editorOrUIFocused) {
          editor.focus();
        }
      };

      const handleRegionWithChildren = (region: AlloyComponent, editorOrUIFocused: boolean) => {
        if (editorOrUIFocused) {
          Keying.focusIn(region);
        }
      };

      notificationRegion.on((region) => {
        closeCallback();
        const editorOrUIFocused = isEditorOrUIFocused();
        removeNotificationAndReposition(region);

        manageRegionVisibility(region, editorOrUIFocused);
      });
    };

    const notification = GuiFactory.build(
      Notification.sketch({
        text: settings.text,
        level: Arr.contains([ 'success', 'error', 'warning', 'warn', 'info' ], settings.type) ? settings.type : undefined,
        progress: settings.progressBar === true,
        icon: settings.icon,
        onAction: close,
        iconProvider: sharedBackstage.providers.icons,
        backstageProvider: sharedBackstage.providers,
      })
    );

    if (!notificationRegion.isSet()) {
      const notificationWrapper = GuiFactory.build(
        InlineView.sketch({
          dom: {
            tag: 'div',
            classes: [ 'tox-notifications-container' ],
            attributes: {
              'aria-label': 'Notifications',
              'role': 'region'
            }
          },
          lazySink: sharedBackstage.getSink,
          fireDismissalEventInstead: {},
          ...sharedBackstage.header.isPositionedAtTop() ? {} : { fireRepositionEventInstead: {}},
          inlineBehaviours: Behaviour.derive([
            Keying.config({
              mode: 'cyclic',
              selector: '.tox-notification, .tox-notification a, .tox-notification button',
            }),
            Replacing.config({}),
            ...(
              Options.isStickyToolbar(editor) && !sharedBackstage.header.isPositionedAtTop()
                ? [ ]
                : [
                  Docking.config({
                    contextual: {
                      lazyContext: () => Optional.some(Boxes.box(getBoundsContainer())),
                      fadeInClass: 'tox-notification-container-dock-fadein',
                      fadeOutClass: 'tox-notification-container-dock-fadeout',
                      transitionClass: 'tox-notification-container-dock-transition'
                    },
                    modes: [ 'top' ],
                    lazyViewport: (comp) => {
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
                ]
            )
          ])
        })
      );

      const notificationSpec = GuiFactory.premade(notification);
      const anchorOverrides = {
        maxHeightFunction: MaxHeight.expandable()
      };
      const anchor = {
        ...sharedBackstage.anchors.banner(),
        overrides: anchorOverrides
      };
      notificationRegion.set(notificationWrapper);
      uiMothership.add(notificationWrapper);
      InlineView.showWithinBounds(notificationWrapper, notificationSpec, { anchor }, getBounds);
    } else {
      const notificationSpec = GuiFactory.premade(notification);
      notificationRegion.on((notificationWrapper) => {
        Replacing.append(notificationWrapper, notificationSpec);
        InlineView.reposition(notificationWrapper);
        Docking.refresh(notificationWrapper);
        clampComponentsToBounds(notificationWrapper.components());
      });
    }

    if (Type.isNumber(settings.timeout) && settings.timeout > 0) {
      Delay.setEditorTimeout(editor, () => {
        close();
      }, settings.timeout);
    }

    const reposition = () => {
      notificationRegion.on((region) => {
        InlineView.reposition(region);
        Docking.refresh(region);
        clampComponentsToBounds(region.components());
      });
    };

    const thisNotification = {
      close,
      reposition,
      text: (nuText: string) => {
        // check if component is still mounted
        Notification.updateText(notification, nuText);
      },
      settings,
      getEl: () => notification.element.dom,
      progressBar: {
        value: (percent: number) => {
          Notification.updateProgress(notification, percent);
        }
      }
    };
    return thisNotification;
  };

  const close = (notification: NotificationApi) => {
    notification.close();
  };

  const getArgs = (notification: NotificationApi) => {
    return notification.settings;
  };

  return {
    open,
    close,
    getArgs
  };
};
