import { type AlloyComponent, AlloyEvents, Attachment, Behaviour, Composing, GuiFactory, Replacing, type SimpleSpec, SlotContainer, type SlotContainerTypes, SystemEvents, Toggling } from '@ephox/alloy';
import { StructureSchema } from '@ephox/boulder';
import { Sidebar as BridgeSidebar } from '@ephox/bridge';
import { Arr, Cell, Fun, Obj, type Optional } from '@ephox/katamari';
import { Attribute } from '@ephox/sugar';

import type Editor from 'tinymce/core/api/Editor';
import { onControlAttached, onControlDetached } from 'tinymce/themes/silver/ui/controls/Controls';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import { SimpleBehaviours } from '../alien/SimpleBehaviours';

import { setupSidebarDragging } from './dragging/SidebarDragging';
import type { SidebarConfig } from './Sidebar';

const renderFloatingSidebar = (): SimpleSpec => ({
  dom: {
    tag: 'div',
    classes: [ 'tox-floating-sidebar' ]
  },
  components: [
    // this will be replaced on setSidebar
  ],
  behaviours: Behaviour.derive([
    Replacing.config({}),
    Toggling.config({
      toggleClass: 'tox-floating-sidebar--open',
      toggleOnExecute: false
    }),
    Composing.config({
      find: (comp: AlloyComponent) => {
        const children = Replacing.contents(comp);
        return Arr.head(children);
      }
    }),
    setupSidebarDragging()
  ])
});

const setup = (editor: Editor, sink: AlloyComponent): AlloyComponent => {
  const floatingSidebar = GuiFactory.build(renderFloatingSidebar());
  Attachment.attach(sink, floatingSidebar);
  return floatingSidebar;
};

const getApi = (comp: AlloyComponent): BridgeSidebar.SidebarInstanceApi => ({
  element: (): HTMLElement => comp.element.dom
});

const makePanels = (parts: SlotContainerTypes.SlotContainerParts, panelConfigs: SidebarConfig) => {
  const specs = Arr.map(Obj.keys(panelConfigs), (name) => {
    const spec = panelConfigs[name];
    // TODO: what is bridge?
    const bridged = StructureSchema.getOrDie(BridgeSidebar.createSidebar(spec));
    return {
      name,
      getApi,
      onSetup: bridged.onSetup,
      onShow: bridged.onShow,
      onHide: bridged.onHide
    };
  });

  return Arr.map(specs, (spec) => {
    const editorOffCell = Cell(Fun.noop);
    return parts.slot(
      spec.name,
      {
        dom: {
          tag: 'div',
          classes: [ 'tox-floating-sidebar__pane' ]
        },
        behaviours: SimpleBehaviours.unnamedEvents([
          // TODO: what is this
          onControlAttached(spec, editorOffCell),
          onControlDetached(spec, editorOffCell),
          AlloyEvents.run<SystemEvents.AlloySlotVisibilityEvent>(SystemEvents.slotVisibility(), (sidepanel, se) => {
            const data = se.event;
            const optSidePanelSpec = Arr.find(specs, (config) => config.name === data.name);
            optSidePanelSpec.each((sidePanelSpec) => {
              const handler = data.visible ? sidePanelSpec.onShow : sidePanelSpec.onHide;
              handler(sidePanelSpec.getApi(sidepanel));
            });
          })
        ])
      }
    );
  });
};

const makeSidebar = (panelConfigs: SidebarConfig) => SlotContainer.sketch((parts) => ({
  dom: {
    tag: 'div',
    classes: [ 'tox-floating-sidebar__pane-container' ]
  },
  components: makePanels(parts, panelConfigs),
  slotBehaviours: SimpleBehaviours.unnamedEvents([
    AlloyEvents.runOnAttached((slotContainer) => SlotContainer.hideAllSlots(slotContainer))
  ])
}));

const createSlots = (floatingSidebar: AlloyComponent, editorId: string, panelConfigs: SidebarConfig): void => {
  // Append (never replace) an editor-keyed block holding a per-editor SlotContainer.
  Replacing.append(floatingSidebar, {
    dom: {
      tag: 'div',
      classes: [ 'tox-floating-sidebar__editor' ],
      attributes: { 'data-mce-editor-id': editorId }
    },
    components: [ makeSidebar(panelConfigs) ],
    behaviours: Behaviour.derive([
      // Controls whether this editor's block is the visible one. Only one block may carry the
      // active class at a time (see show), so only one sidebar shows on screen.
      Toggling.config({
        toggleClass: 'tox-floating-sidebar__editor--active',
        toggleOnExecute: false
      }),
      // Composing.getCurrent(block) -> the block's SlotContainer.
      ComposingConfigs.childAt(0)
    ])
  });
};

const setSidebar = (sidebar: AlloyComponent, panelConfigs: SidebarConfig, _showSidebar: string | undefined): void => {
  Replacing.set(sidebar, [ makeSidebar(panelConfigs) ]);

  // TODO We should also open the initial sidebar, by reading showSidebar
};

const toggleSidebar = (sidebar: AlloyComponent, name: string): void => {
  const optSlotContainer = Composing.getCurrent(sidebar);

  optSlotContainer.each((slotContainer) => {
    // In Sidebar.ts we also update aria-labels, so perhaps we should
    // do that here as well
    if (SlotContainer.isShowing(slotContainer, name)) {
      SlotContainer.hideAllSlots(slotContainer);
      Toggling.off(sidebar);
    } else {
      SlotContainer.hideAllSlots(slotContainer);
      SlotContainer.showSlot(slotContainer, name);
      Toggling.on(sidebar);
    }
  });
};

const whichSidebar = (sidebar: AlloyComponent): Optional<string> => {
  const optSlotContainer = Composing.getCurrent(sidebar);

  return optSlotContainer.bind((slotContainer) =>
    Arr.find(SlotContainer.getSlotNames(slotContainer), (name) =>
      SlotContainer.isShowing(slotContainer, name)
    )
  );
};

// The shared floating sidebar holds one per-editor block (appended by createSlots), each tagged
// with its editor id. Locate the block for the given editor.
const findEditorContainer = (floatingSidebar: AlloyComponent, editorId: string): Optional<AlloyComponent> =>
  Arr.find(Replacing.contents(floatingSidebar), (container) =>
    Attribute.get(container.element, 'data-mce-editor-id') === editorId
  );

// Hides every editor block (visibility only). Deliberately does NOT touch the blocks' slot
// state, so each editor keeps its own conceptually-open panel while off screen.
const hideAllEditorContainers = (floatingSidebar: AlloyComponent): void =>
  Arr.each(Replacing.contents(floatingSidebar), Toggling.off);

// Hides every slot in every editor block, clearing all open panels across the sidebar.
const hideAllSlots = (floatingSidebar: AlloyComponent): void =>
  Arr.each(Replacing.contents(floatingSidebar), (editorContainer) =>
    Composing.getCurrent(editorContainer).each(SlotContainer.hideAllSlots)
  );

// Shows a single editor's named panel in the shared floating sidebar. The manager decides which
// sidebar should be open, so this just makes that state visible: it clears every open panel and
// hides every editor block, then reveals the requested editor and its panel.
const show = (floatingSidebar: AlloyComponent, editorId: string, name: string): void => {
  hideAllSlots(floatingSidebar);
  hideAllEditorContainers(floatingSidebar);

  findEditorContainer(floatingSidebar, editorId).each((editorContainer) => {
    Composing.getCurrent(editorContainer).each((slotContainer) => SlotContainer.showSlot(slotContainer, name));
    Toggling.on(editorContainer);
  });
  Toggling.on(floatingSidebar);
};

// Hides everything: every editor's slots, every editor block, and the floating sidebar itself.
const hideAll = (floatingSidebar: AlloyComponent): void => {
  hideAllSlots(floatingSidebar);
  hideAllEditorContainers(floatingSidebar);
  Toggling.off(floatingSidebar);
};

// Reports the editor's own open panel, read from its slot state. Not gated on visibility, so it
// reflects that editor's conceptual state even while another editor's sidebar is on screen.
const whichEditorSidebar = (floatingSidebar: AlloyComponent, editorId: string): Optional<string> =>
  findEditorContainer(floatingSidebar, editorId).bind((editorContainer) =>
    Composing.getCurrent(editorContainer).bind((slotContainer) =>
      Arr.find(SlotContainer.getSlotNames(slotContainer), (name) =>
        SlotContainer.isShowing(slotContainer, name)
      )
    )
  );

export {
  renderFloatingSidebar,
  setup,
  createSlots,
  setSidebar,
  toggleSidebar,
  whichSidebar,
  show,
  hideAll,
  whichEditorSidebar
};
