import { AddEventsBehaviour, AlloyEvents, Behaviour, Dragging, Focusing, Keying, Tabstopping, SimpleSpec } from '@ephox/alloy';
import { Strings } from '@ephox/katamari';
import I18n from '../../../../../../core/main/ts/api/util/I18n';
import { getDefaultOr } from '../icons/Icons';
import ElementPath from './ElementPath';
import { ResizeTypes, resize } from '../sizing/Resize';
import { Editor } from 'tinymce/core/api/Editor';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { renderWordCount } from './WordCount';

const renderStatusbar = (editor: Editor, providersBackstage: UiFactoryBackstageProviders): SimpleSpec => {
  const renderResizeHandlerIcon = (resizeType: ResizeTypes): SimpleSpec => {
    return {
      dom: {
        tag: 'div',
        classes: [ 'tox-statusbar__resize-handle' ],
        attributes: {
          title: providersBackstage.translate('Resize') // TODO: tooltips AP-213
        },
        innerHtml: getDefaultOr('icon-resize-handle', () => ''),
      },
      behaviours: Behaviour.derive([
        Dragging.config({
          mode: 'mouse',
          repositionTarget: false,
          onDrag: (comp, target, delta) => {
            resize(editor, delta, resizeType);
          },
          blockerClass: 'tox-blocker'
        })
      ])
    };
  };

  const renderBranding = (): SimpleSpec => {
    const linkHtml = '<a href="https://www.tiny.cloud/?utm_campaign=editor_referral&amp;utm_medium=poweredby&amp;utm_source=tinymce&amp;utm_content=v5" rel="noopener" target="_blank" role="presentation" tabindex="-1">tinymce</a>';
    const html = I18n.translate(['Powered by {0}', linkHtml]);
    return {
      dom: {
        tag: 'span',
        classes: [ 'tox-statusbar__branding' ],
        styles: {
          float: 'right'
        },
        innerHtml: html
      },
      behaviours: Behaviour.derive([
        Tabstopping.config({ }),
        Focusing.config({ })
      ])
    };
  };

  const getResizeType = (editor): ResizeTypes => {
    // If autoresize is enabled, disable resize
    const fallback = !Strings.contains(editor.settings.plugins, 'autoresize');
    const resize = editor.getParam('resize', fallback);
    if (resize === false) {
      return ResizeTypes.None;
    } else if (resize === 'both') {
      return ResizeTypes.Both;
    } else {
      return ResizeTypes.Vertical;
    }
  };

  const getTextComponents = (): SimpleSpec[] => {
    const components: SimpleSpec[] = [];

    if (editor.getParam('elementpath', true, 'boolean')) {
      components.push(ElementPath.renderElementPath(editor, { }));
    }

    if (Strings.contains(editor.settings.plugins, 'wordcount')) {
      components.push(renderWordCount(editor, providersBackstage));
    }

    if (editor.getParam('branding', true, 'boolean')) {
      components.push(renderBranding());
    }

    if (components.length > 0) {
      return [{
        dom: {
          tag: 'div',
          classes: [ 'tox-statusbar__text-container']
        },
        components,
        behaviours: Behaviour.derive([
          Keying.config({
            mode: 'cyclic'
          }),
          AddEventsBehaviour.config('statusbar-events', [
            AlloyEvents.runOnAttached((comp) => {
              // NOTE: If statusbar ever gets re-rendered, we will need to free this.
              editor.shortcuts.add('alt+F11', 'focus statusbar', () => Keying.focusIn(comp));
            })
          ])
        ])
      }];
    }
    return [];
  };

  const getComponents = (): SimpleSpec[] => {
    const components: SimpleSpec[] = getTextComponents();

    const resizeType = getResizeType(editor);
    if (resizeType !== ResizeTypes.None) {
      components.push(renderResizeHandlerIcon(resizeType));
    }
    return components;
  };

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-statusbar' ],
    },
    components: getComponents(),
  };
};

export {
  renderStatusbar
};