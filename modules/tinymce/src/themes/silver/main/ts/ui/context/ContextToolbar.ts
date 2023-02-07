import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, AlloyTriggers, AnchorSpec, Behaviour, GuiFactory, InlineView, Keying, Positioning
} from '@ephox/alloy';
import { InlineContent, Toolbar } from '@ephox/bridge';
import { Arr, Fun, Id, Merger, Obj, Optional, Optionals, Singleton, Throttler, Thunk } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Class, Compare, Css, Focus, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';

import { getToolbarMode, ToolbarMode } from '../../api/Options';
import { UiFactoryBackstage, UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { renderToolbar } from '../toolbar/CommonToolbar';
import { identifyButtons } from '../toolbar/Integration';
import { hideContextToolbarEvent, showContextToolbarEvent } from './ContextEditorEvents';
import { ContextForm } from './ContextForm';
import * as ContextToolbarAnchor from './ContextToolbarAnchor';
import * as ContextToolbarBounds from './ContextToolbarBounds';
import * as ToolbarLookup from './ContextToolbarLookup';
import * as ToolbarScopes from './ContextToolbarScopes';
import { forwardSlideEvent, renderContextToolbar } from './ContextUi';

type ScopedToolbars = ToolbarScopes.ScopedToolbars;

export type ContextSpecType = InlineContent.ContextToolbarSpec | InlineContent.ContextFormSpec;
export type ContextType = InlineContent.ContextToolbar | InlineContent.ContextForm;

type ContextToolbarButtonType = Toolbar.ToolbarButtonSpec | Toolbar.ToolbarMenuButtonSpec | Toolbar.ToolbarSplitButtonSpec | Toolbar.ToolbarToggleButtonSpec | Toolbar.GroupToolbarButtonSpec;

interface Extras {
  readonly backstage: UiFactoryBackstage;
}

const enum TriggerCause {
  Reposition,
  NewAnchor
}

const transitionClass = 'tox-pop--transition';

const register = (editor: Editor, registryContextToolbars: Record<string, ContextSpecType>, sink: AlloyComponent, extras: Extras): void => {
  const backstage = extras.backstage;
  const sharedBackstage = backstage.shared;
  const isTouch = PlatformDetection.detect().deviceType.isTouch;

  const lastElement = Singleton.value<SugarElement<Element>>();
  const lastTrigger = Singleton.value<TriggerCause>();
  const lastContextPosition = Singleton.value<InlineContent.ContextPosition>();

  const contextbar = GuiFactory.build(
    renderContextToolbar({
      sink,
      onEscape: () => {
        editor.focus();
        return Optional.some(true);
      }
    })
  );

  const getBounds = () => {
    const position = lastContextPosition.get().getOr('node');
    // Use a 1px margin for the bounds to keep the context toolbar from butting directly against
    // the header, etc... when switching to inset layouts
    const margin = ContextToolbarAnchor.shouldUseInsetLayouts(position) ? 1 : 0;
    return ContextToolbarBounds.getContextToolbarBounds(editor, sharedBackstage, position, margin);
  };

  const canLaunchToolbar = () => {
    // If a mobile context menu is open, don't launch else they'll probably overlap. For android, specifically.
    return !editor.removed && !(isTouch() && backstage.isContextMenuOpen());
  };

  const isSameLaunchElement = (elem: Optional<SugarElement<Element>>) =>
    Optionals.is(Optionals.lift2(elem, lastElement.get(), Compare.eq), true);

  const shouldContextToolbarHide = (): boolean => {
    if (!canLaunchToolbar()) {
      return true;
    } else {
      const contextToolbarBounds = getBounds();
      // Get the anchor bounds. For node anchors we should always try to use the last element bounds
      const anchorBounds = Optionals.is(lastContextPosition.get(), 'node') ?
        ContextToolbarBounds.getAnchorElementBounds(editor, lastElement.get()) :
        ContextToolbarBounds.getSelectionBounds(editor);

      // If the anchor bounds aren't overlapping with the context toolbar bounds, then the context toolbar
      // should hide. We want the threshold to require some overlap here (+.01), so that as soon as the
      // anchor is off-screen, the context toolbar disappers.
      return contextToolbarBounds.height <= 0 || !ContextToolbarBounds.isVerticalOverlap(anchorBounds, contextToolbarBounds, 0.01);
    }
  };

  const close = () => {
    lastElement.clear();
    lastTrigger.clear();
    lastContextPosition.clear();
    InlineView.hide(contextbar);
  };

  const hideOrRepositionIfNecessary = () => {
    if (InlineView.isOpen(contextbar)) {
      const contextBarEle = contextbar.element;
      Css.remove(contextBarEle, 'display');
      if (shouldContextToolbarHide()) {
        Css.set(contextBarEle, 'display', 'none');
      } else {
        lastTrigger.set(TriggerCause.Reposition);
        InlineView.reposition(contextbar);
      }
    }
  };

  const wrapInPopDialog = (toolbarSpec: AlloySpec) => ({
    dom: {
      tag: 'div',
      classes: [ 'tox-pop__dialog' ]
    },
    components: [ toolbarSpec ],
    behaviours: Behaviour.derive([
      Keying.config({
        mode: 'acyclic'
      }),

      AddEventsBehaviour.config('pop-dialog-wrap-events', [
        AlloyEvents.runOnAttached((comp) => {
          editor.shortcuts.add('ctrl+F9', 'focus statusbar', () => Keying.focusIn(comp));
        }),
        AlloyEvents.runOnDetached((_comp) => {
          editor.shortcuts.remove('ctrl+F9');
        })
      ])
    ])
  });

  const getScopes: () => ScopedToolbars = Thunk.cached(() => ToolbarScopes.categorise(registryContextToolbars, (toolbarApi) => {
    // ASSUMPTION: This should only ever show one context toolbar since it's used for context forms hence [toolbarApi]
    const alloySpec = buildToolbar([ toolbarApi ]);
    AlloyTriggers.emitWith(contextbar, forwardSlideEvent, {
      forwardContents: wrapInPopDialog(alloySpec)
    });
  }));

  const buildContextToolbarGroups = (allButtons: Record<string, ContextToolbarButtonType>, ctx: InlineContent.ContextToolbarSpec) =>
    identifyButtons(editor, { buttons: allButtons, toolbar: ctx.items, allowToolbarGroups: false }, extras.backstage, Optional.some([ 'form:' ]));

  const buildContextFormGroups = (ctx: InlineContent.ContextForm, providers: UiFactoryBackstageProviders) => ContextForm.buildInitGroups(ctx, providers);

  const buildToolbar = (toolbars: Array<ContextType>): AlloySpec => {
    const { buttons } = editor.ui.registry.getAll();
    const scopes = getScopes();
    const allButtons: Record<string, ContextToolbarButtonType> = { ...buttons, ...scopes.formNavigators };

    // For context toolbars we don't want to use floating or sliding, so just restrict this
    // to scrolling or wrapping (default)
    const toolbarType = getToolbarMode(editor) === ToolbarMode.scrolling ? ToolbarMode.scrolling : ToolbarMode.default;

    const initGroups = Arr.flatten(Arr.map(toolbars, (ctx) =>
      ctx.type === 'contexttoolbar' ? buildContextToolbarGroups(allButtons, ctx) : buildContextFormGroups(ctx, sharedBackstage.providers)
    ));

    return renderToolbar({
      type: toolbarType,
      uid: Id.generate('context-toolbar'),
      initGroups,
      onEscape: Optional.none,
      cyclicKeying: true,
      providers: sharedBackstage.providers
    });
  };

  const getAnchor = (position: InlineContent.ContextPosition, element: Optional<SugarElement<Element>>): AnchorSpec => {
    const anchorage = position === 'node' ? sharedBackstage.anchors.node(element) : sharedBackstage.anchors.cursor();
    const anchorLayout = ContextToolbarAnchor.getAnchorLayout(editor, position, isTouch(), {
      lastElement: lastElement.get,
      isReposition: () => Optionals.is(lastTrigger.get(), TriggerCause.Reposition),
      getMode: () => Positioning.getMode(sink)
    });
    return Merger.deepMerge(anchorage, anchorLayout);
  };

  const launchContext = (toolbarApi: Array<ContextType>, elem: Optional<SugarElement<Element>>) => {
    launchContextToolbar.cancel();

    // Don't launch if the editor has something else open that would conflict
    if (!canLaunchToolbar()) {
      return;
    }

    const toolbarSpec = buildToolbar(toolbarApi);

    // TINY-4495 ASSUMPTION: Can only do toolbarApi[0].position because ContextToolbarLookup.filterToolbarsByPosition
    // ensures all toolbars returned by ContextToolbarLookup have the same position.
    // And everything else that gets toolbars from elsewhere only returns maximum 1 toolbar
    const position = toolbarApi[0].position;
    const anchor = getAnchor(position, elem);
    lastContextPosition.set(position);
    lastTrigger.set(TriggerCause.NewAnchor);

    const contextBarEle = contextbar.element;
    Css.remove(contextBarEle, 'display');

    // Reset placement and transitions when moving to different elements
    if (!isSameLaunchElement(elem)) {
      Class.remove(contextBarEle, transitionClass);
      Positioning.reset(sink, contextbar);
    }

    // Place the element
    InlineView.showWithinBounds(contextbar, wrapInPopDialog(toolbarSpec), {
      anchor,
      transition: {
        classes: [ transitionClass ],
        mode: 'placement'
      }
    }, () => Optional.some(getBounds()));

    // IMPORTANT: This must be stored after the initial render, otherwise the lookup of the last element in the
    // anchor placement will be incorrect as it'll reuse the new element as the anchor point.
    elem.fold(lastElement.clear, lastElement.set);

    // It's possible we may have launched offscreen, if so then hide
    if (shouldContextToolbarHide()) {
      Css.set(contextBarEle, 'display', 'none');
    }
  };

  let isDragging = false;

  const launchContextToolbar = Throttler.last(() => {
    // Don't launch if the editor doesn't have focus or has been destroyed
    if (!editor.hasFocus() || editor.removed || isDragging) {
      return;
    }

    // If currently transitioning then throttle again so we don't interrupt the transition
    if (Class.has(contextbar.element, transitionClass)) {
      launchContextToolbar.throttle();
    } else {
      const scopes = getScopes();
      ToolbarLookup.lookup(scopes, editor).fold(
        close,
        (info) => {
          launchContext(info.toolbars, Optional.some(info.elem));
        }
      );
    }
  }, 17); // 17ms is used as that's about 1 frame at 60fps

  editor.on('init', () => {
    editor.on('remove', close);
    editor.on('ScrollContent ScrollWindow ObjectResized ResizeEditor longpress', hideOrRepositionIfNecessary);

    // FIX: Make it go away when the action makes it go away. E.g. deleting a column deletes the table.
    editor.on('click keyup focus SetContent', launchContextToolbar.throttle);

    editor.on(hideContextToolbarEvent, close);
    editor.on(showContextToolbarEvent, (e) => {
      const scopes = getScopes();
      // TODO: Have this stored in a better structure
      Obj.get(scopes.lookupTable, e.toolbarKey).each((ctx) => {
        // ASSUMPTION: this is only used to open one specific toolbar at a time, hence [ctx]
        launchContext([ ctx ], Optionals.someIf(e.target !== editor, e.target));
        // Forms launched via this way get immediate focus
        InlineView.getContent(contextbar).each(Keying.focusIn);
      });
    });

    editor.on('focusout', (_e) => {
      Delay.setEditorTimeout(editor, () => {
        if (Focus.search(sink.element).isNone() && Focus.search(contextbar.element).isNone()) {
          close();
        }
      }, 0);
    });

    editor.on('SwitchMode', () => {
      if (editor.mode.isReadOnly()) {
        close();
      }
    });

    editor.on('AfterProgressState', (event) => {
      if (event.state) {
        close();
      } else if (editor.hasFocus()) {
        launchContextToolbar.throttle();
      }
    });

    editor.on('dragstart', () => {
      isDragging = true;
    });
    editor.on('dragend drop', () => {
      isDragging = false;
    });

    editor.on('NodeChange', (_e) => {
      Focus.search(contextbar.element).fold(
        launchContextToolbar.throttle,
        Fun.noop
      );
    });
  });
};

export { register };

