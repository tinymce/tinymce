import {
  Behaviour, Button as AlloyButton, Tabstopping, GuiFactory, SimpleSpec, Toggling, Replacing, Keying, AddEventsBehaviour, AlloyEvents, NativeEvents, AlloyComponent, CustomEvent, Receiving, Focusing, Sliding, AlloyTriggers, EventFormat
} from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Cell, Fun, Id, Optional } from '@ephox/katamari';
import { EventArgs, SelectorFind } from '@ephox/sugar';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderMenuButton } from '../button/MenuButton';
import * as Icons from '../icons/Icons';

type TreeSpec = Omit<Dialog.Tree, 'type'>;
type OnLeafAction = (id: string) => void;

interface ToggleExpandTreeNodeEventArgs extends EventFormat {
  expanded: boolean;
  node: string;
}

interface RenderItemProps {
  backstage: UiFactoryBackstage;
}

interface RenderLeafLabelProps extends RenderItemProps {
  leaf: Dialog.Leaf;
  visible: boolean;
  treeId: string;
  onLeafAction: OnLeafAction;
  selectedId: Optional<string>;
}

interface RenderDirectoryProps extends RenderItemProps {
  directory: Dialog.Directory;
  labelTabstopping: boolean;
  treeId: string;
  onLeafAction: OnLeafAction;
  expandedIds: string[];
  selectedId: Optional<string>;
}

interface RenderDirectoryLabelProps extends RenderItemProps {
  directory: Dialog.Directory;
  visible: boolean;
  noChildren: boolean;
}

interface RenderDirectoryChildrenProps extends RenderItemProps {
  children: Dialog.TreeItem[];
  visible: boolean;
  treeId: string;
  onLeafAction: OnLeafAction;
  expandedIds: string[];
  selectedId: Optional<string>;
}

const renderLabel = (text: string ): SimpleSpec => ({
  dom: {
    tag: 'span',
    classes: [ 'tox-tree__label' ],
    attributes: {
      'title': text,
      'aria-label': text,
    }
  },
  components: [
    GuiFactory.text(text)
  ],
});

const leafLabelEventsId = Id.generate('leaf-label-event-id');

const renderLeafLabel = ({
  leaf,
  onLeafAction,
  visible,
  treeId,
  selectedId,
  backstage
}: RenderLeafLabelProps): SimpleSpec => {
  const internalMenuButton = leaf.menu.map((btn) => renderMenuButton(btn, 'tox-mbtn', backstage, Optional.none(), visible));
  const components = [ renderLabel(leaf.title) ];
  internalMenuButton.each((btn) => components.push(btn));

  return AlloyButton.sketch({
    dom: {
      tag: 'div',
      classes: [ 'tox-tree--leaf__label', 'tox-trbtn' ]
        .concat(visible ? [ 'tox-tree--leaf__label--visible' ] : [])
      ,
    },
    components,
    role: 'treeitem',
    action: (button) => {
      onLeafAction(leaf.id);
      button.getSystem().broadcastOn([ `update-active-item-${treeId}` ], {
        value: leaf.id
      });
    },
    eventOrder: {
      [NativeEvents.keydown()]: [
        leafLabelEventsId,
        'keying',
      ]
    },
    buttonBehaviours: Behaviour.derive([
      ...(visible ? [ Tabstopping.config({}) ] : []),
      Toggling.config({
        toggleClass: 'tox-trbtn--enabled',
        toggleOnExecute: false,
        aria: {
          mode: 'selected'
        }
      }),
      Receiving.config({
        channels: {
          [`update-active-item-${treeId}`]: {
            onReceive: (comp, message: UpdateTreeSelectedItemEvent) => {
              (message.value === leaf.id ? Toggling.on : Toggling.off)(comp);
            }
          }
        }
      }),
      AddEventsBehaviour.config(leafLabelEventsId, [
        AlloyEvents.runOnAttached((comp, _se) => {
          selectedId.each((id) => {
            const toggle = id === leaf.id ? Toggling.on : Toggling.off;
            toggle(comp);
          });
        }),
        AlloyEvents.run<EventArgs<KeyboardEvent>>(NativeEvents.keydown(), (comp, se) => {
          const isLeftArrowKey = se.event.raw.code === 'ArrowLeft';
          const isRightArrowKey = se.event.raw.code === 'ArrowRight';
          if (isLeftArrowKey) {
            SelectorFind.ancestor(comp.element, '.tox-tree--directory').each((dirElement) => {
              comp.getSystem().getByDom(dirElement).each((dirComp) => {
                SelectorFind.child(dirElement, '.tox-tree--directory__label').each((dirLabelElement) => {
                  dirComp.getSystem().getByDom(dirLabelElement).each(Focusing.focus);
                });
              });
            });
            se.stop();
          } else if (isRightArrowKey) {
            se.stop();
          }
        })
      ])
    ]),
  });
};

const renderIcon = (iconName: string, iconsProvider: Icons.IconProvider, behaviours: Array<Behaviour.NamedConfiguredBehaviour<any, any, any>>): SimpleSpec =>
  Icons.render(iconName, {
    tag: 'span',
    classes: [
      'tox-tree__icon-wrap',
      'tox-icon',
    ],
    behaviours
  }, iconsProvider);

const renderIconFromPack = (iconName: string, iconsProvider: Icons.IconProvider): SimpleSpec =>
  renderIcon(iconName, iconsProvider, []);

const directoryLabelEventsId = Id.generate('directory-label-event-id');

const renderDirectoryLabel = ({
  directory,
  visible,
  noChildren,
  backstage
}: RenderDirectoryLabelProps): SimpleSpec => {
  const internalMenuButton = directory.menu.map((btn) => renderMenuButton(btn, 'tox-mbtn', backstage, Optional.none()));
  const components: SimpleSpec[] = [
    {
      dom: {
        tag: 'div',
        classes: [ 'tox-chevron' ],
      },
      components: [
        renderIconFromPack('chevron-right', backstage.shared.providers.icons),
      ]
    },
    renderLabel(directory.title)
  ];
  internalMenuButton.each((btn) => {
    components.push(btn);
  });
  const toggleExpandChildren = (button: AlloyComponent) => {
    SelectorFind.ancestor(button.element, '.tox-tree--directory').each((directoryEle) => {
      button.getSystem().getByDom(directoryEle).each((directoryComp) => {
        const willExpand = !Toggling.isOn(directoryComp);
        Toggling.toggle(directoryComp);
        AlloyTriggers.emitWith(button, 'expand-tree-node', { expanded: willExpand, node: directory.id });
      });
    });
  };
  return AlloyButton.sketch({
    dom: {
      tag: 'div',
      classes: [ 'tox-tree--directory__label', 'tox-trbtn' ].concat( visible ? [ 'tox-tree--directory__label--visible' ] : [] ),
    },
    components,
    action: toggleExpandChildren,
    eventOrder: {
      [NativeEvents.keydown()]: [
        directoryLabelEventsId,
        'keying',
      ]
    },
    buttonBehaviours: Behaviour.derive([
      ...(visible ? [ Tabstopping.config({}) ] : []),
      AddEventsBehaviour.config(directoryLabelEventsId, [
        AlloyEvents.run<EventArgs<KeyboardEvent>>(NativeEvents.keydown(), (comp, se) => {
          const isRightArrowKey = se.event.raw.code === 'ArrowRight';
          const isLeftArrowKey = se.event.raw.code === 'ArrowLeft';
          if (isRightArrowKey && noChildren ) {
            se.stop();
          }
          if (isRightArrowKey || isLeftArrowKey ) {
            SelectorFind.ancestor( comp.element, '.tox-tree--directory').each((directoryEle) => {
              comp.getSystem().getByDom(directoryEle).each((directoryComp) => {
                if (!Toggling.isOn(directoryComp) && isRightArrowKey || Toggling.isOn(directoryComp) && isLeftArrowKey) {
                  toggleExpandChildren(comp);
                  se.stop();
                } else if (isLeftArrowKey && !Toggling.isOn(directoryComp)) {
                  SelectorFind.ancestor(directoryComp.element, '.tox-tree--directory').each((parentDirElement) => {
                    SelectorFind.child(parentDirElement, '.tox-tree--directory__label').each((parentDirLabelElement) => {
                      directoryComp.getSystem().getByDom(parentDirLabelElement).each(Focusing.focus);
                    });
                  });
                  se.stop();
                }
              });
            });
          }
        })
      ])
    ])
  });
};

const renderDirectoryChildren = ({
  children,
  onLeafAction,
  visible,
  treeId,
  expandedIds,
  selectedId,
  backstage
}: RenderDirectoryChildrenProps): SimpleSpec => {
  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-tree--directory__children' ],
    },
    components: children.map((item) => {
      return item.type === 'leaf' ?
        renderLeafLabel({ leaf: item, selectedId, onLeafAction, visible, treeId, backstage }) :
        renderDirectory({ directory: item, expandedIds, selectedId, onLeafAction, labelTabstopping: visible, treeId, backstage });
    }),
    behaviours: Behaviour.derive([
      Sliding.config({
        dimension: {
          property: 'height'
        },
        closedClass: 'tox-tree--directory__children--closed',
        openClass: 'tox-tree--directory__children--open',
        growingClass: 'tox-tree--directory__children--growing',
        shrinkingClass: 'tox-tree--directory__children--shrinking',
        expanded: visible,
      }),
      Replacing.config({})
    ])
  };
};

const directoryEventsId = Id.generate('directory-event-id');
const renderDirectory = ({
  directory,
  onLeafAction,
  labelTabstopping,
  treeId,
  backstage,
  expandedIds,
  selectedId
}: RenderDirectoryProps): SimpleSpec => {
  const { children } = directory;
  const expandedIdsCell = Cell(expandedIds);
  const computedChildrenComponents = (visible: boolean) =>
    children.map((item) => {
      return item.type === 'leaf' ?
        renderLeafLabel({ leaf: item, selectedId, onLeafAction, visible, treeId, backstage }) :
        renderDirectory({ directory: item, expandedIds: expandedIdsCell.get(), selectedId, onLeafAction, labelTabstopping: visible, treeId, backstage });
    });
  const childrenVisible = expandedIds.includes(directory.id);
  return ({
    dom: {
      tag: 'div',
      classes: [ 'tox-tree--directory' ],
      attributes: {
        role: 'treeitem'
      }
    },
    components: [
      renderDirectoryLabel({ directory, visible: labelTabstopping, noChildren: directory.children.length === 0, backstage }),
      renderDirectoryChildren({ children, expandedIds, selectedId, onLeafAction, visible: childrenVisible, treeId, backstage })
    ],
    behaviours: Behaviour.derive([
      AddEventsBehaviour.config(directoryEventsId, [
        AlloyEvents.runOnAttached((comp, _se) => {
          Toggling.set(comp, childrenVisible);
        }),
        AlloyEvents.run<ToggleExpandTreeNodeEventArgs>('expand-tree-node', (_cmp, se) => {
          const { expanded, node } = se.event;
          expandedIdsCell.set( expanded ?
            [ ...expandedIdsCell.get(), node ] :
            expandedIdsCell.get().filter((id) => id !== node)
          );
        }),
      ]),
      Toggling.config({
        ...( directory.children.length > 0 ? {
          aria: {
            mode: 'expanded',
          },
        } : {}),
        toggleClass: 'tox-tree--directory--expanded',
        onToggled: (comp, childrenVisible) => {
          const childrenComp = comp.components()[1];
          const newChildren = computedChildrenComponents(childrenVisible);
          if (childrenVisible) {
            Sliding.grow(childrenComp);
          } else {
            Sliding.shrink(childrenComp);
          }
          Replacing.set(childrenComp, newChildren);
        },
      }),
    ])
  });
};

interface UpdateTreeSelectedItemEvent extends CustomEvent {
  readonly value: string;
}

const treeEventsId = Id.generate('tree-event-id');

const renderTree = (
  spec: TreeSpec,
  backstage: UiFactoryBackstage
): SimpleSpec => {
  const onLeafAction = spec.onLeafAction.getOr(Fun.noop);
  const onToggleExpand = spec.onToggleExpand.getOr(Fun.noop);
  const defaultExpandedIds: string[] = spec.defaultExpandedIds;
  const expandedIds = Cell(defaultExpandedIds);
  const selectedIdCell = Cell(spec.defaultSelectedId);
  const treeId = Id.generate('tree-id');
  const children = (selectedId: Optional<string>, expandedIds: string[]) => spec.items.map((item) => {
    return item.type === 'leaf' ?
      renderLeafLabel({ leaf: item, selectedId, onLeafAction, visible: true, treeId, backstage }) :
      renderDirectory({ directory: item, selectedId, onLeafAction, expandedIds, labelTabstopping: true, treeId, backstage });
  });
  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-tree' ],
      attributes: {
        role: 'tree'
      }
    },
    components: children(selectedIdCell.get(), expandedIds.get()),
    behaviours: Behaviour.derive([
      Keying.config({
        mode: 'flow',
        selector: '.tox-tree--leaf__label--visible, .tox-tree--directory__label--visible',
        cycles: false,
      }),
      AddEventsBehaviour.config(treeEventsId, [
        AlloyEvents.run<ToggleExpandTreeNodeEventArgs>('expand-tree-node', (_cmp, se) => {
          const { expanded, node } = se.event;
          expandedIds.set( expanded ?
            [ ...expandedIds.get(), node ] :
            expandedIds.get().filter((id) => id !== node)
          );
          onToggleExpand(expandedIds.get(), { expanded, node });
        })
      ]),
      Receiving.config({
        channels: {
          [`update-active-item-${treeId}`]: {
            onReceive: (comp, message: UpdateTreeSelectedItemEvent) => {
              selectedIdCell.set(Optional.some(message.value));
              Replacing.set(comp, children(Optional.some(message.value), expandedIds.get()));
            }
          }
        }
      }),
      Replacing.config({})
    ])
  };
};

export {
  renderTree
};
