import { type AlloyComponent, AlloyEvents, Behaviour, Composing, Replacing, type SimpleSpec, SlotContainer, type SlotContainerTypes, SystemEvents, Toggling } from '@ephox/alloy';
import { StructureSchema } from '@ephox/boulder';
import { Sidebar as BridgeSidebar } from '@ephox/bridge';
import { Arr, Cell, Fun, Obj, type Optional } from '@ephox/katamari';
import { Attribute } from '@ephox/sugar';

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
    // one block per editor, appended by createSlots
  ],
  behaviours: Behaviour.derive([
    Replacing.config({}),
    Toggling.config({
      toggleClass: 'tox-floating-sidebar--open',
      toggleOnExecute: false
    }),
    setupSidebarDragging()
  ])
});

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
      Toggling.config({
        toggleClass: 'tox-floating-sidebar__editor--active',
        toggleOnExecute: false
      }),
      ComposingConfigs.childAt(0)
    ])
  });
};

const findEditorContainer = (floatingSidebar: AlloyComponent, editorId: string): Optional<AlloyComponent> =>
  Arr.find(Replacing.contents(floatingSidebar), (container) =>
    Attribute.get(container.element, 'data-mce-editor-id') === editorId
  );

const toggleEditorSidebar = (floatingSidebar: AlloyComponent, editorId: string, name: string): void => {
  findEditorContainer(floatingSidebar, editorId).each((editorContainer) => {
    Composing.getCurrent(editorContainer).each((slotContainer) => {
      const isClosing = SlotContainer.isShowing(slotContainer, name);
      SlotContainer.hideAllSlots(slotContainer);

      if (isClosing) {
        Toggling.off(editorContainer);
        Toggling.off(floatingSidebar);
      } else {
        SlotContainer.showSlot(slotContainer, name);
        Toggling.on(editorContainer);
        Toggling.on(floatingSidebar);
      }
    });
  });
};

const removeEditorSlots = (floatingSidebar: AlloyComponent, editorId: string): void => {
  findEditorContainer(floatingSidebar, editorId).each((editorContainer) => {
    const wasVisible = Toggling.isOn(editorContainer);
    Replacing.remove(floatingSidebar, editorContainer);

    if (wasVisible) {
      Toggling.off(floatingSidebar);
    }
  });
};

const isAnySidebarOpen = (floatingSidebar: AlloyComponent): boolean =>
  Toggling.isOn(floatingSidebar);

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
  createSlots,
  toggleEditorSidebar,
  removeEditorSlots,
  isAnySidebarOpen,
  whichEditorSidebar
};
