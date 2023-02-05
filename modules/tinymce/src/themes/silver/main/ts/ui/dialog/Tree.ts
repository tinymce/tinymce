import { AddEventsBehaviour, AlloyEvents, Behaviour, Button as AlloyButton, GuiFactory, NativeEvents, SimpleSpec, SketchSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Id } from '@ephox/katamari';
import { EventArgs } from '@ephox/sugar';

import { UiFactoryBackstage, UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as Icons from '../icons/Icons';

type TreeSpec = Omit<Dialog.Tree, 'type'>;
type AlloyButtonSpec = Parameters<typeof AlloyButton['sketch']>[0];

const renderLabel = (text: string ): SimpleSpec => ({
  dom: {
    tag: 'span',
    classes: [ `tree-label` ]
  },
  components: [
    GuiFactory.text(text)
  ],
});

const treeItemLabelId = Id.generate('tree-item');

const renderItemLabel = (text: string, level: number): AlloyButtonSpec => {
  return AlloyButton.sketch({
    dom: {
      tag: 'span',
      classes: [ `tree-item-label`, 'tox-trbtn' ],
      styles: {
        'padding-left': `${level * 8}px`,
        'font-weight': '400',
      }
    },
    components: [
      renderLabel(text)
    ],
    eventOrder: {
      [NativeEvents.mousedown()]: [
        'focusing',
        'alloy.base.behaviour',
        treeItemLabelId
      ]
    },
    buttonBehaviours: Behaviour.derive([
      AddEventsBehaviour.config(treeItemLabelId, [
        AlloyEvents.run<EventArgs<MouseEvent>>(NativeEvents.mousedown(), (button, se) => {
          console.log('Clicked on item', text);
        })
      ])
    ])
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

const treeDirectoryLabelId = Id.generate('tree-directory');

const renderDirectoryLabel = (text: string, level: number, iconsProvider: Icons.IconProvider): AlloyButtonSpec => {
  return AlloyButton.sketch({

    dom: {
      tag: 'div',
      classes: [ `tree-directory-label`, 'tox-trbtn' ],
      styles: {
        'padding-left': `${level * 8}px`,
        'font-weight': '700',
      }
    },
    components: [
      renderIconFromPack('chevron-right', iconsProvider),
      {
        dom: {
          tag: 'span',
          styles: {
            'padding-left': '4px'
          }
        },
        components: [ renderLabel(text) ]
      }
    ],
    eventOrder: {
      [NativeEvents.mousedown()]: [
        'focusing',
        'alloy.base.behaviour',
        treeDirectoryLabelId
      ]
    },
    buttonBehaviours: Behaviour.derive([
      AddEventsBehaviour.config(treeDirectoryLabelId, [
        AlloyEvents.run<EventArgs<MouseEvent>>(NativeEvents.mousedown(), (button, se) => {
          console.log('Clicked on item', text);
        })
      ])
    ])
  });
};

const renderDirectoryChildren = (children: Dialog.TreeItem[], level: number, providers: UiFactoryBackstageProviders): SimpleSpec => {
  return {
    dom: {
      tag: 'div',
      classes: [ 'tree-directory-children' ],
      styles: {
        'padding-left': `${level * 8}px`
      }
    },
    components: children.map((item) => {
      return item.type === 'leaf' ? renderItemLabel(item.title, level + 1) : renderDirectory(item, level + 1, providers);
    })
  };
};

const renderDirectory = (dir: Dialog.Directory, level: number, providers: UiFactoryBackstageProviders): SimpleSpec => ({
  dom: {
    tag: 'div',
    classes: [ `tree-directory` ],
    styles: {
      'display': 'flex',
      'flex-direction': 'column',
    }
  },
  components: [
    renderDirectoryLabel(dir.title, level, providers.icons),
    renderDirectoryChildren(dir.children, level, providers)
  ],
});

const renderTree = (
  spec: TreeSpec,
  backstage: UiFactoryBackstage,
  level = 1
): SketchSpec => {
  return {
    uid: Id.generate(''),
    dom: {
      tag: 'div',
      styles: {
        'display': 'flex',
        'flex-direction': 'column'
      }
    },
    components: spec.items.map((item) => {
      return item.type === 'leaf' ?
        renderItemLabel(item.title, level) :
        renderDirectory(item, level, backstage.shared.providers);
    })
  };
};

export {
  renderTree
};
