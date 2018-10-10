import { AddEventsBehaviour, AlloyEvents, Behaviour, Dragging, Focusing, GuiFactory, Keying, Replacing, Tabstopping } from '@ephox/alloy';
import { Strings } from '@ephox/katamari';
import I18n from '../../../../../../core/main/ts/api/util/I18n';
import { getDefaultOr } from '../icons/Icons';
import ElementPath from './ElementPath';
import { ResizeTypes, resize } from '../sizing/Resize';

const renderStatusbar = (editor) => {
  const renderResizeHandlerIcon = (resizeType: ResizeTypes) => {
    return {
      dom: {
        tag: 'div',
        classes: [ 'tox-statusbar__resize-handle' ],
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

  const renderBranding = () => {
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

  const renderWordCount = () => {
    return {
      dom: {
        tag: 'span',
        classes: [ 'tox-statusbar__wordcount' ]
      },
      components: [ ],
      behaviours: Behaviour.derive([
        Replacing.config({ }),
        AddEventsBehaviour.config('wordcount-events', [
          AlloyEvents.runOnAttached((comp) => {
            editor.on('wordCountUpdate', (e) => {
              Replacing.set(comp, [ GuiFactory.text(e.wordCountText) ]);
            });
          })
        ])
      ])
    };
  };

  const getResizeType = (editor): ResizeTypes => {
    const resize = editor.getParam('resize', true);
    if (resize === false) {
      return ResizeTypes.None;
    } else if (resize === 'both') {
      return ResizeTypes.Both;
    } else {
      return ResizeTypes.Vertical;
    }
  };

  const getComponents = () => {
    const comps = [];

    comps.push(ElementPath.renderElementPath(editor, { }));

    if (Strings.contains(editor.settings.plugins, 'wordcount')) {
      comps.push(renderWordCount());
    }

    if (editor.getParam('branding', true, 'boolean')) {
      comps.push(renderBranding());
    }

    const resizeType = getResizeType(editor);
    if (resizeType !== ResizeTypes.None) {
      comps.push(renderResizeHandlerIcon(resizeType));
    }

    return comps;
  };

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-statusbar' ],
    },
    components: getComponents(),
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
  };
};

export {
  renderStatusbar
};