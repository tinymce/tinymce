/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Behaviour, Dragging, SimpleSpec } from '@ephox/alloy';
import { Strings } from '@ephox/katamari';
import I18n from 'tinymce/core/api/util/I18n';
import Editor from 'tinymce/core/api/Editor';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { get as getIcon } from '../icons/Icons';
import { resize, ResizeTypes } from '../sizing/Resize';
import ElementPath from './ElementPath';
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
        innerHtml: getIcon('resize-handle', providersBackstage.icons),
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
    const label = I18n.translate(['Powered by {0}', 'Tiny']);
    const linkHtml = `<a href="https://www.tiny.cloud/?utm_campaign=editor_referral&amp;utm_medium=poweredby&amp;utm_source=tinymce&amp;utm_content=v5" rel="noopener" target="_blank" tabindex="-1" aria-label="${label}">${label}</a>`;
    return {
      dom: {
        tag: 'span',
        classes: [ 'tox-statusbar__branding' ],
        innerHtml: linkHtml
      }
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

export { renderStatusbar };