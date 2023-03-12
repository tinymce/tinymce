import { Behaviour, Button as AlloyButton, Tabstopping, GuiFactory, SimpleSpec, Toggling, Replacing, Keying, AddEventsBehaviour, AlloyEvents, NativeEvents, AlloyComponent, CustomEvent, Receiving, Focusing, Sliding } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Fun, Id, Optional } from '@ephox/katamari';
import { EventArgs, SelectorFind } from '@ephox/sugar';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderMenuButton } from '../button/MenuButton';
import * as Icons from '../icons/Icons';

type TreeSpec = Omit<Dialog.Tree, 'type'>;
type OnLeafAction = (id: string) => void;

interface RenderItemProps {
  backstage: UiFactoryBackstage;
}

interface RenderLeafLabelProps extends RenderItemProps {
  leaf: Dialog.Leaf;
  visible: boolean;
  treeId: string;
  onLeafAction: OnLeafAction;
}

interface RenderDirectoryProps extends RenderItemProps {
  directory: Dialog.Directory;
  labelTabstopping: boolean;
  treeId: string;
  onLeafAction: OnLeafAction;
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
  const expandChildren = (button: AlloyComponent) => {
    SelectorFind.ancestor(button.element, '.tox-tree--directory').each((directoryEle) => {
      button.getSystem().getByDom(directoryEle).each((directoryComp) => Toggling.toggle(directoryComp));
    });
  };
  return AlloyButton.sketch({
    dom: {
      tag: 'div',
      classes: [ 'tox-tree--directory__label', 'tox-trbtn' ].concat( visible ? [ 'tox-tree--directory__label--visible' ] : [] ),
    },
    components,
    action: expandChildren,
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
                  expandChildren(comp);
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
  backstage
}: RenderDirectoryChildrenProps): SimpleSpec => {
  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-tree--directory__children' ],
    },
    components: children.map((item) => {
      return item.type === 'leaf' ?
        renderLeafLabel({ leaf: item, onLeafAction, visible, treeId, backstage }) :
        renderDirectory({ directory: item, onLeafAction, labelTabstopping: visible, treeId, backstage });
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
      }),
      Replacing.config({})
    ])
  };
};

const renderDirectory = ({
  directory,
  onLeafAction,
  labelTabstopping,
  treeId,
  backstage
}: RenderDirectoryProps): SimpleSpec => {
  const { children } = directory;
  const computedChildrenComponents = (visible: boolean) =>
    children.map((item) => {
      return item.type === 'leaf' ?
        renderLeafLabel({ leaf: item, onLeafAction, visible, treeId, backstage }) :
        renderDirectory({ directory: item, onLeafAction, labelTabstopping: visible, treeId, backstage });
    });
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
      renderDirectoryChildren({ children, onLeafAction, visible: false, treeId, backstage })
    ],
    behaviours: Behaviour.derive([
      Toggling.config({
        ...( directory.children.length > 0 ? {
          aria: {
            mode: 'expanded',
          }
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
        }
      }),
    ])
  });
};

interface UpdateTreeSelectedItemEvent extends CustomEvent {
  readonly value: string;
}

const renderTree = (
  spec: TreeSpec,
  backstage: UiFactoryBackstage
): SimpleSpec => {
  const onLeafAction = spec.onLeafAction.getOr(Fun.noop);
  const treeId = Id.generate('tree-id');
  const children = spec.items.map((item) => {
    return item.type === 'leaf' ?
      renderLeafLabel({ leaf: item, onLeafAction, visible: true, treeId, backstage }) :
      renderDirectory({ directory: item, onLeafAction, labelTabstopping: true, treeId, backstage });
  });
  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-tree' ],
      attributes: {
        role: 'tree'
      }
    },
    components: children,
    behaviours: Behaviour.derive([
      Keying.config({
        mode: 'flow',
        selector: '.tox-tree--leaf__label--visible, .tox-tree--directory__label--visible',
        cycles: false,
      }),
    ])
  };
};

export {
  renderTree
};
