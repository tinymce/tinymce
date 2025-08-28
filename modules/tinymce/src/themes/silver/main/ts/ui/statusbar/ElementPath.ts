import { AddEventsBehaviour, AlloyEvents, AlloySpec, AriaDescribe, Behaviour, Button, Disabling, GuiFactory, Keying, Replacing, SimpleSpec, Tabstopping, Tooltipping } from '@ephox/alloy';
import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Events from '../../api/Events';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as UiState from '../../UiState';
import { DisablingConfigs } from '../alien/DisablingConfigs';

interface PathData {
  readonly name: string;
  readonly element: Node;
}

interface ElementPathSettings {
  readonly delimiter?: string;
}

const isHidden = (elm: Element): boolean =>
  elm.nodeName === 'BR' || !!elm.getAttribute('data-mce-bogus') || elm.getAttribute('data-mce-type') === 'bookmark';

const renderElementPath = (editor: Editor, settings: ElementPathSettings, providersBackstage: UiFactoryBackstageProviders): SimpleSpec => {
  const delimiter = settings.delimiter ?? '\u203A';

  const renderElement = (name: string, element: Node, index: number): AlloySpec =>
    Button.sketch({
      dom: {
        tag: 'div',
        classes: [ 'tox-statusbar__path-item' ],
        attributes: {
          'data-index': index,
        }
      },
      components: [
        GuiFactory.text(name)
      ],
      action: (_btn) => {
        editor.focus();
        editor.selection.select(element);
        editor.nodeChanged();
      },
      buttonBehaviours: Behaviour.derive([
        Tooltipping.config({
          ...providersBackstage.tooltips.getConfig({
            tooltipText: providersBackstage.translate([ 'Select the {0} element', element.nodeName.toLowerCase() ]),
            onShow: (comp, tooltip) => {
              AriaDescribe.describedBy(comp.element, tooltip.element);
            },
            onHide: (comp) => {
              AriaDescribe.remove(comp.element);
            }
          }),
        }),
        DisablingConfigs.button(providersBackstage.isDisabled),
        UiState.toggleOnReceive(() => providersBackstage.checkUiComponentContext('any'))
      ])
    });

  const renderDivider = (): AlloySpec => ({
    dom: {
      tag: 'div',
      classes: [ 'tox-statusbar__path-divider' ],
      attributes: {
        'aria-hidden': true
      }
    },
    components: [
      GuiFactory.text(` ${delimiter} `)
    ]
  });

  const renderPathData = (data: PathData[]): AlloySpec[] =>
    Arr.foldl(data, (acc, path, index) => {
      const element = renderElement(path.name, path.element, index);
      if (index === 0) {
        return acc.concat([ element ]);
      } else {
        return acc.concat([ renderDivider(), element ]);
      }
    }, [] as AlloySpec[]);

  const updatePath = (parents: Node[]) => {
    const newPath: PathData[] = [];
    let i = parents.length;

    while (i-- > 0) {
      const parent = parents[i];
      if (parent.nodeType === 1 && !isHidden(parent as Element)) {
        const args = Events.fireResolveName(editor, parent);

        if (!args.isDefaultPrevented()) {
          newPath.push({ name: args.name, element: parent });
        }

        if (args.isPropagationStopped()) {
          break;
        }
      }
    }

    return newPath;
  };

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-statusbar__path' ],
      attributes: {
        role: 'navigation'
      }
    },
    behaviours: Behaviour.derive([
      Keying.config({
        mode: 'flow',
        selector: 'div[role=button]'
      }),
      Disabling.config({
        disabled: providersBackstage.isDisabled
      }),
      UiState.toggleOnReceive(() => providersBackstage.checkUiComponentContext('any')),
      Tabstopping.config({ }),
      Replacing.config({ }),
      AddEventsBehaviour.config('elementPathEvents', [
        AlloyEvents.runOnAttached((comp, _e) => {
          // NOTE: If statusbar ever gets re-rendered, we will need to free this.
          editor.shortcuts.add('alt+F11', 'focus statusbar elementpath', () => Keying.focusIn(comp));

          editor.on('NodeChange', (e) => {
            const newPath = updatePath(e.parents);
            const newChildren = newPath.length > 0 ? renderPathData(newPath) : [];
            Replacing.set(comp, newChildren);
          });
        })
      ])
    ]),
    components: []
  };
};

export {
  renderElementPath
};
