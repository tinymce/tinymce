import { type AlloyComponent, AlloyEvents, Attachment, Behaviour, Composing, GuiFactory, Replacing, type SimpleSpec, SlotContainer, type SlotContainerTypes, SystemEvents, Toggling } from '@ephox/alloy';
import { StructureSchema } from '@ephox/boulder';
import { Sidebar as BridgeSidebar } from '@ephox/bridge';
import { Arr, Cell, Fun, Obj, type Optional } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';
import { onControlAttached, onControlDetached } from 'tinymce/themes/silver/ui/controls/Controls';

import { SimpleBehaviours } from '../alien/SimpleBehaviours';

import type { CssPosition, Position } from './dragging/DragTypes';
import { setupSidebarDragging } from './dragging/SidebarDragging';
import type { SidebarConfig } from './Sidebar';
import * as SidebarOrchestrator from './SidebarOrchestrator';

const renderFloatingSidebar = (positionState: Cell<CssPosition | Position>, onDragEnd: () => void): SimpleSpec => ({
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
    setupSidebarDragging(positionState, onDragEnd)
  ])
});

const setup = (editor: Editor, sink: AlloyComponent): AlloyComponent => {
  // All floating sidebars share one resting position, and broadcast it on drag end.
  const positionState = SidebarOrchestrator.getSharedPositionCell();
  const floatingSidebar = GuiFactory.build(renderFloatingSidebar(positionState, SidebarOrchestrator.broadcastPosition));
  Attachment.attach(sink, floatingSidebar);
  SidebarOrchestrator.register(editor, floatingSidebar);
  editor.on('remove', () => SidebarOrchestrator.unregister(editor.id));
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

export {
  setup,
  setSidebar,
  toggleSidebar,
  whichSidebar
};
