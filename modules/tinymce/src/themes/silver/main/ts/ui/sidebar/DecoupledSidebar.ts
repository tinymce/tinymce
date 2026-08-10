import {
  type AlloyComponent, AlloyEvents, Attachment, Behaviour, Composing, Gui, GuiFactory, Replacing, type SimpleSpec, SlotContainer, type SlotContainerTypes, SystemEvents, Toggling
} from '@ephox/alloy';
import { StructureSchema } from '@ephox/boulder';
import { Sidebar as BridgeSidebar } from '@ephox/bridge';
import { Arr, Cell, Fun, Obj, type Optional } from '@ephox/katamari';
import type { SugarElement } from '@ephox/sugar';

import type Editor from 'tinymce/core/api/Editor';
import { onControlAttached, onControlDetached } from 'tinymce/themes/silver/ui/controls/Controls';

import { SimpleBehaviours } from '../alien/SimpleBehaviours';

import * as DecoupledSidebarOrchestrator from './DecoupledSidebarOrchestrator';
import type { SidebarConfig } from './Sidebar';

const renderDecoupledSidebar = (): SimpleSpec => ({
  dom: {
    tag: 'div',
    classes: [ 'tox-decoupled-sidebar' ]
  },
  components: [
    // this will be replaced on setSidebar
  ],
  behaviours: Behaviour.derive([
    Replacing.config({}),
    Toggling.config({
      toggleClass: 'tox-decoupled-sidebar--open',
      toggleOnExecute: false
    }),
    Composing.config({
      find: (comp: AlloyComponent) => {
        const children = Replacing.contents(comp);
        return Arr.head(children);
      }
    })
  ])
});

// Builds the container the decoupled sidebars are rendered into. The container element is the one
// matched by the `decoupled_sidebar_container_selector` option, resolved by the caller.
const setup = (editor: Editor, container: SugarElement<HTMLElement>): AlloyComponent => {
  const decoupledSidebar = GuiFactory.build(renderDecoupledSidebar());

  // The container is outside every other editor mothership, so the sidebar needs a system of its
  // own before anything can be built inside it.
  const mothership = Gui.takeover(decoupledSidebar);
  Attachment.attachSystem(container, mothership);

  DecoupledSidebarOrchestrator.register(editor);
  editor.on('remove', () => DecoupledSidebarOrchestrator.unregister(editor.id));

  editor.on('detach', () => {
    Attachment.detachSystem(mothership);
    mothership.destroy();
  });

  return decoupledSidebar;
};

const getApi = (comp: AlloyComponent): BridgeSidebar.SidebarInstanceApi => ({
  element: (): HTMLElement => comp.element.dom
});

const makePanels = (parts: SlotContainerTypes.SlotContainerParts, panelConfigs: SidebarConfig) => {
  const specs = Arr.map(Obj.keys(panelConfigs), (name) => {
    const spec = panelConfigs[name];
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
          classes: [ 'tox-decoupled-sidebar__pane' ]
        },
        behaviours: SimpleBehaviours.unnamedEvents([
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
    classes: [ 'tox-decoupled-sidebar__pane-container' ]
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
