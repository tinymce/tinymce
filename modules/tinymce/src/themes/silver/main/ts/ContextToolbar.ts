/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, AlloyTriggers, AnchorSpec, Behaviour, Boxes, Bubble, GuiFactory, InlineView, Keying,
  Layout, LayoutInside, MaxHeight, MaxWidth, Positioning
} from '@ephox/alloy';
import { Toolbar } from '@ephox/bridge';
import { Element as DomElement } from '@ephox/dom-globals';
import { Arr, Cell, Id, Merger, Obj, Option, Thunk } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Body, Css, Element, Focus, Scroll } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import { getToolbarMode, ToolbarMode } from './api/Settings';
import { UiFactoryBackstage, UiFactoryBackstageProviders } from './backstage/Backstage';
import { hideContextToolbarEvent, showContextToolbarEvent } from './ui/context/ContextEditorEvents';
import { ContextForm } from './ui/context/ContextForm';
import { getContextToolbarBounds } from './ui/context/ContextToolbarBounds';
import * as ToolbarLookup from './ui/context/ContextToolbarLookup';
import * as ToolbarScopes from './ui/context/ContextToolbarScopes';
import { forwardSlideEvent, renderContextToolbar } from './ui/context/ContextUi';
import { renderToolbar } from './ui/toolbar/CommonToolbar';
import { identifyButtons } from './ui/toolbar/Integration';

type ScopedToolbars = ToolbarScopes.ScopedToolbars;

export type ContextTypes = Toolbar.ContextToolbar | Toolbar.ContextForm;

interface Extras {
  backstage: UiFactoryBackstage;
}

const bubbleSize = 12;
const bubbleAlignments = {
  valignCentre: [],
  alignCentre: [],
  alignLeft: [ 'tox-pop--align-left' ],
  alignRight: [ 'tox-pop--align-right' ],
  right: [ 'tox-pop--right' ],
  left: [ 'tox-pop--left' ],
  bottom: [ 'tox-pop--bottom' ],
  top: [ 'tox-pop--top' ]
};

const anchorOverrides = {
  maxHeightFunction: MaxHeight.expandable(),
  maxWidthFunction: MaxWidth.expandable()
};

// On desktop we prioritise north-then-south because it's cleaner, but on mobile we prioritise south to try to avoid overlapping with native context toolbars
const desktopAnchorSpecLayouts = {
  onLtr: () => [ Layout.north, Layout.south, Layout.northeast, Layout.southeast, Layout.northwest, Layout.southwest,
    LayoutInside.north, LayoutInside.south, LayoutInside.northeast, LayoutInside.southeast, LayoutInside.northwest, LayoutInside.southwest ],
  onRtl: () => [ Layout.north, Layout.south, Layout.northwest, Layout.southwest, Layout.northeast, Layout.southeast,
    LayoutInside.north, LayoutInside.south, LayoutInside.northwest, LayoutInside.southwest, LayoutInside.northeast, LayoutInside.southeast ]
};

const mobileAnchorSpecLayouts = {
  onLtr: () => [ Layout.south, Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest, Layout.north,
    LayoutInside.north, LayoutInside.south, LayoutInside.northeast, LayoutInside.southeast, LayoutInside.northwest, LayoutInside.southwest ],
  onRtl: () => [ Layout.south, Layout.southwest, Layout.southeast, Layout.northwest, Layout.northeast, Layout.north,
    LayoutInside.north, LayoutInside.south, LayoutInside.northwest, LayoutInside.southwest, LayoutInside.northeast, LayoutInside.southeast ]
};

const getAnchorLayout = (position: Toolbar.ContextToolbarPosition, isTouch: boolean): Partial<AnchorSpec> => {
  if (position === 'line') {
    return {
      bubble: Bubble.nu(bubbleSize, 0, bubbleAlignments),
      layouts: {
        onLtr: () => [ Layout.east ],
        onRtl: () => [ Layout.west ]
      },
      overrides: anchorOverrides
    };
  } else {
    return {
      bubble: Bubble.nu(0, bubbleSize, bubbleAlignments),
      layouts: isTouch ? mobileAnchorSpecLayouts : desktopAnchorSpecLayouts,
      overrides: anchorOverrides
    };
  }
};

const register = (editor: Editor, registryContextToolbars, sink: AlloyComponent, extras: Extras) => {
  const isTouch = PlatformDetection.detect().deviceType.isTouch;

  const contextbar = GuiFactory.build(
    renderContextToolbar({
      sink,
      onEscape: () => {
        editor.focus();
        return Option.some(true);
      }
    })
  );

  const getBounds = () => getContextToolbarBounds(editor, extras.backstage.shared);

  const isRangeOverlapping = (aTop: number, aBottom: number, bTop: number, bBottom: number) => Math.max(aTop, bTop) <= Math.min(aBottom, bBottom);

  const getLastElementVerticalBound = () => {
    const nodeBounds = lastElement.get()
      .filter((ele) => Body.inBody(Element.fromDom(ele)))
      .map((ele) => ele.getBoundingClientRect())
      .getOrThunk(() => editor.selection.getRng().getBoundingClientRect());

    // Translate to the top level document, as nodeBounds is relative to the iframe viewport
    const diffTop = editor.inline ? Scroll.get().top() : Boxes.absolute(Element.fromDom(editor.getBody())).y;

    return {
      y: nodeBounds.top + diffTop,
      bottom: nodeBounds.bottom + diffTop
    };
  };

  const shouldContextToolbarHide = (): boolean => {
    // If a mobile context menu is open, don't launch else they'll probably overlap. For android, specifically.
    if (isTouch() && extras.backstage.isContextMenuOpen()) {
      return true;
    }

    const lastElementBounds = getLastElementVerticalBound();
    const contextToolbarBounds = getBounds();

    // If the element bound isn't overlapping with the contexToolbarBound, the contextToolbar should hide
    return !isRangeOverlapping(
      lastElementBounds.y,
      lastElementBounds.bottom,
      contextToolbarBounds.y,
      contextToolbarBounds.bottom
    );
  };

  const forceHide = () => {
    InlineView.hide(contextbar);
  };

  // FIX: make a lot nicer.
  const hideOrRepositionIfNecessary = () => {
    lastAnchor.get().each((anchor) => {
      const contextBarEle = contextbar.element();
      Css.remove(contextBarEle, 'display');
      if (shouldContextToolbarHide()) {
        Css.set(contextBarEle, 'display', 'none');
      } else {
        Positioning.positionWithinBounds(sink, anchor, contextbar, Option.some(getBounds()));
      }
    });
  };

  const lastAnchor = Cell(Option.none<AnchorSpec>());
  const lastElement = Cell<Option<DomElement>>(Option.none<DomElement>());
  const timer = Cell(null);

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

  type ContextToolbarButtonTypes = Toolbar.ToolbarButtonApi | Toolbar.ToolbarMenuButtonApi | Toolbar.ToolbarSplitButtonApi | Toolbar.ToolbarToggleButtonApi | Toolbar.GroupToolbarButtonApi;

  const buildContextToolbarGroups = (allButtons: Record<string, ContextToolbarButtonTypes>, ctx: Toolbar.ContextToolbar) => identifyButtons(editor, { buttons: allButtons, toolbar: ctx.items, allowToolbarGroups: false }, extras, Option.some([ 'form:' ]));

  const buildContextMenuGroups = (ctx: Toolbar.ContextForm, providers: UiFactoryBackstageProviders) => ContextForm.buildInitGroups(ctx, providers);

  const buildToolbar = (toolbars: Array<ContextTypes>): AlloySpec => {
    const { buttons } = editor.ui.registry.getAll();
    const scopes = getScopes();
    const allButtons: Record<string, ContextToolbarButtonTypes> = { ...buttons, ...scopes.formNavigators };

    // For context toolbars we don't want to use floating or sliding, so just restrict this
    // to scrolling or wrapping (default)
    const toolbarType = getToolbarMode(editor) === ToolbarMode.scrolling ? ToolbarMode.scrolling : ToolbarMode.default;

    const initGroups = Arr.flatten(Arr.map(toolbars, (ctx) => ctx.type === 'contexttoolbar' ? buildContextToolbarGroups(allButtons, ctx) : buildContextMenuGroups(ctx, extras.backstage.shared.providers)));

    return renderToolbar({
      type: toolbarType,
      uid: Id.generate('context-toolbar'),
      initGroups,
      onEscape: Option.none,
      cyclicKeying: true,
      providers: extras.backstage.shared.providers
    });
  };

  editor.on(showContextToolbarEvent, (e) => {
    const scopes = getScopes();
    // TODO: Have this stored in a better structure
    Obj.get(scopes.lookupTable, e.toolbarKey).each((ctx) => {
      // ASSUMPTION: this is only used to open one specific toolbar at a time, hence [ctx]
      launchContext([ ctx ], e.target === editor ? Option.none() : Option.some(e as DomElement));
      // Forms launched via this way get immediate focus
      InlineView.getContent(contextbar).each(Keying.focusIn);
    });
  });

  const getAnchor = (position: Toolbar.ContextToolbarPosition, element: Option<Element>): AnchorSpec => {
    const anchorage = position === 'node' ? extras.backstage.shared.anchors.node(element) : extras.backstage.shared.anchors.cursor();
    return Merger.deepMerge(
      anchorage,
      getAnchorLayout(position, isTouch())
    );
  };

  const launchContext = (toolbarApi: Array<ContextTypes>, elem: Option<DomElement>) => {
    clearTimer();

    // If a mobile context menu is open, don't launch else they'll probably overlap. For android, specifically.
    if (isTouch() && extras.backstage.isContextMenuOpen()) {
      return;
    }

    const toolbarSpec = buildToolbar(toolbarApi);
    const sElem = elem.map(Element.fromDom);

    // TINY-4495 ASSUMPTION: Can only do toolbarApi[0].position because ContextToolbarLookup.filterToolbarsByPosition
    // ensures all toolbars returned by ContextToolbarLookup have the same position.
    // And everything else that gets toolbars from elsewhere only returns maximum 1 toolbar
    const anchor = getAnchor(toolbarApi[0].position, sElem);

    lastAnchor.set(Option.some((anchor)));
    lastElement.set(elem);
    const contextBarEle = contextbar.element();
    Css.remove(contextBarEle, 'display');
    InlineView.showWithinBounds(contextbar, anchor, wrapInPopDialog(toolbarSpec), () => Option.some(getBounds()));

    // It's possible we may have launched offscreen, if so then hide
    if (shouldContextToolbarHide()) {
      Css.set(contextBarEle, 'display', 'none');
    }
  };

  const launchContextToolbar = () => {
    // Don't launch if the editor doesn't have focus
    if (!editor.hasFocus()) {
      return;
    }

    const scopes = getScopes();
    ToolbarLookup.lookup(scopes, editor).fold(
      () => {
        lastAnchor.set(Option.none());
        InlineView.hide(contextbar);
      },

      (info) => {
        launchContext(info.toolbars, Option.some(info.elem.dom()));
      }
    );
  };

  const clearTimer = () => {
    const current = timer.get();
    if (current !== null) {
      Delay.clearTimeout(current);
      timer.set(null);
    }
  };

  const resetTimer = (t) => {
    clearTimer();
    timer.set(t);
  };

  editor.on('init', () => {
    editor.on(hideContextToolbarEvent, forceHide);
    editor.on('ScrollContent ScrollWindow longpress', hideOrRepositionIfNecessary);

    // FIX: Make it go away when the action makes it go away. E.g. deleting a column deletes the table.
    editor.on('click keyup focus SetContent ObjectResized ResizeEditor', () => {
      // Fixing issue with chrome focus on img.
      resetTimer(
        Delay.setEditorTimeout(editor, launchContextToolbar, 0)
      );
    });

    editor.on('focusout', (_e) => {
      Delay.setEditorTimeout(editor, () => {
        if (Focus.search(sink.element()).isNone() && Focus.search(contextbar.element()).isNone()) {
          lastAnchor.set(Option.none());
          InlineView.hide(contextbar);
        }
      }, 0);
    });

    editor.on('SwitchMode', () => {
      if (editor.mode.isReadOnly()) {
        lastAnchor.set(Option.none());
        InlineView.hide(contextbar);
      }
    });

    editor.on('NodeChange', (_e) => {
      Focus.search(contextbar.element()).fold(
        () => {
          resetTimer(
            Delay.setEditorTimeout(editor, launchContextToolbar, 0)
          );
        },
        (_) => {

        }
      );
    });
  });
};

export { register };

