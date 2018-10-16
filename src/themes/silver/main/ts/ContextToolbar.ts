import { AddEventsBehaviour, AlloyEvents, AlloySpec, AlloyTriggers, Behaviour, Bubble, GuiFactory, InlineView, Keying, Layout, Positioning } from '@ephox/alloy';
import { expandable } from '@ephox/alloy/lib/main/ts/ephox/alloy/positioning/layout/MaxHeight';
import { Objects } from '@ephox/boulder';
import { Toolbar } from '@ephox/bridge';
import { Arr, Cell, Id, Merger, Option, Thunk } from '@ephox/katamari';
import { Css, DomEvent, Element } from '@ephox/sugar';
import { Editor } from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';
import { showContextToolbarEvent } from './ui/context/ContextEditorEvents';
import { ContextForm } from './ui/context/ContextForm';
import { forwardSlideEvent, renderContextToolbar } from './ui/context/ContextUi';
import ToolbarLookup from './ui/context/ToolbarLookup';
import ToolbarScopes, { ScopedToolbars } from './ui/context/ToolbarScopes';
import { renderToolbar } from './ui/toolbar/CommonToolbar';
import { identifyButtons } from './ui/toolbar/Integration';
import { Element as DomElement } from '@ephox/dom-globals';
import { box } from '@ephox/alloy/lib/main/ts/ephox/alloy/alien/Boxes';

const register = (editor: Editor, registryContextToolbars, sink, extras) => {
  const contextbar = GuiFactory.build(
    renderContextToolbar({
      sink,
      onEscape: () => {
        editor.focus();
        return Option.some(true);
      }
    })
  );

  const getBounds = () => {
    return box(Element.fromDom(editor.contentAreaContainer));
  };

  editor.on('init', () => {
    const scroller = editor.getBody().ownerDocument.defaultView;
    // FIX: Unbind AND make a lot nicer.
    DomEvent.bind(Element.fromDom(scroller), 'scroll', () => {
      lastAnchor.get().each((anchor) => {
        const elem = lastElement.get().getOr(editor.selection.getNode());
        const nodeBounds = elem.getBoundingClientRect();
        const contentAreaBounds = editor.contentAreaContainer.getBoundingClientRect();
        const aboveEditor = nodeBounds.bottom < 0;
        const belowEditor = nodeBounds.top > contentAreaBounds.height;
        if (aboveEditor || belowEditor) {
          Css.set(contextbar.element(), 'display', 'none');
        } else {
          Css.remove(contextbar.element(), 'display');
          Positioning.positionWithin(sink, anchor, contextbar, getBounds);
        }
      });
    });
  });

  const lastAnchor = Cell(Option.none());
  const lastElement = Cell<Option<DomElement>>(Option.none<DomElement>());
  const timer = Cell(null);

  const wrapInPopDialog = (toolbarSpec: AlloySpec) => {
    return {
      dom: {
        tag: 'div',
        classes: [ 'tox-pop__dialog' ],
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
          AlloyEvents.runOnDetached((comp) => {
            editor.shortcuts.remove('ctrl+F9');
          })
        ])
      ])
    };
  };

  const getScopes: () => ScopedToolbars = Thunk.cached(() => {
    return ToolbarScopes.categorise(registryContextToolbars, (toolbarApi) => {
      const alloySpec = buildToolbar(toolbarApi);
      AlloyTriggers.emitWith(contextbar, forwardSlideEvent, {
        forwardContents: wrapInPopDialog(alloySpec)
      });
    });
  });

  const buildToolbar = (ctx): AlloySpec => {
    const { buttons } = editor.ui.registry.getAll();

    const scopes = getScopes();
    return ctx.type === 'contexttoolbar' ? (() => {
      const allButtons = Merger.merge(buttons, scopes.formNavigators);
      const initGroups = identifyButtons(editor, { buttons: allButtons, toolbar: ctx.items.join(' ') }, extras);
      return renderToolbar({
        uid: Id.generate('context-toolbar'),
        initGroups: Arr.map(initGroups, (g) => ({ items: g })),
        onEscape: Option.none
      });
    })() : (() => {
      return ContextForm.renderContextForm(ctx, extras.backstage.shared.providers);
    })();
  };

  editor.on(showContextToolbarEvent, (e) => {
    const scopes = getScopes();
    // TODO: Have this stored in a better structure
    Objects.readOptFrom(scopes.lookupTable, e.toolbarKey).each((ctx) => {
      launchContext(ctx, e.target === editor ? Option.none() : Option.some(e as DomElement));
      // Forms launched via this way get immediate focus
      InlineView.getContent(contextbar).each(Keying.focusIn);
    });
  });

  const getAnchor = (position: Toolbar.ContextToolbarPosition, element: Element) => {
    return Merger.deepMerge(
      extras.backstage.shared.anchors.node(element),
      {
        bubble: Bubble.nu(10, 12, {
          valignCentre: [ ],
          alignCentre: [ ],
          alignLeft: [ 'tox-pop--align-left' ],
          alignRight: [ 'tox-pop--align-right' ],
          right: [ 'tox-pop--right' ],
          left: [ 'tox-pop--left' ],
          bottom: [ 'tox-pop--bottom' ],
          top: [ 'tox-pop--top' ]
        }),
        layouts: {
          onLtr: () => position === 'line' ? [ Layout.east ] : [ Layout.north, Layout.south, Layout.northeast, Layout.southeast, Layout.northwest, Layout.southwest ],
          onRtl: () => position === 'line' ? [ Layout.west ] : [ Layout.north, Layout.south ]
        },
        overrides: {
          maxHeightFunction: expandable()
        }
      }
    );
  };

  const launchContext = (toolbarApi: Toolbar.ContextToolbar | Toolbar.ContextForm, elem: Option<DomElement>) => {
    clearTimer();
    const toolbarSpec = buildToolbar(toolbarApi);
    const startNode = editor.selection.getNode();
    const anchor = getAnchor(toolbarApi.position, Element.fromDom(startNode));
    lastAnchor.set(Option.some((anchor)));
    lastElement.set(elem);
    InlineView.showWithin(contextbar, anchor, wrapInPopDialog(toolbarSpec), getBounds);
    Css.remove(contextbar.element(), 'display');
  };

  const launchContextToolbar = () => {
    const scopes = getScopes();
    ToolbarLookup.lookup(scopes, editor).fold(
      () => {
        lastAnchor.set(Option.none());
        InlineView.hide(contextbar);
      },

      (info) => {
        launchContext(info.toolbarApi, Option.some(info.elem.dom()));
      }
    );
  };

  const clearTimer = () => {
    const current = timer.get();
    if (current !== null) {
      clearTimeout(current);
      timer.set(null);
    }
  };

  const resetTimer = (t) => {
    clearTimer();
    timer.set(t);
  };

  // FIX: Make it go away when the action makes it go away. E.g. deleting a column deletes the table.
  editor.on('click keyup setContent ObjectResized nodeChange', (e) => {
    // Fixing issue with chrome focus on img.
    resetTimer(
      Delay.setEditorTimeout(editor, launchContextToolbar, 0)
    );
  });
};

export default {
  register
};