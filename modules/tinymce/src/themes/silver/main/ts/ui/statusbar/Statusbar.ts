/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { SimpleSpec } from '@ephox/alloy';

import Editor from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as ElementPath from './ElementPath';
import * as ResizeHandler from './ResizeHandle';
import { renderWordCount } from './WordCount';

const renderStatusbar = (editor: Editor, providersBackstage: UiFactoryBackstageProviders): SimpleSpec => {

  const renderBranding = (): SimpleSpec => {
    const label = I18n.translate([ 'Powered by {0}', 'Tiny' ]);
    const linkHtml = `<a href="https://www.tiny.cloud/?utm_campaign=editor_referral&amp;utm_medium=poweredby&amp;utm_source=tinymce&amp;utm_content=v5" rel="noopener" target="_blank" tabindex="-1" aria-label="${label}">${label}</a>`;
    return {
      dom: {
        tag: 'span',
        classes: [ 'tox-statusbar__branding' ],
        innerHtml: linkHtml
      }
    };
  };

  const getTextComponents = (): SimpleSpec[] => {
    const components: SimpleSpec[] = [];

    if (editor.getParam('elementpath', true, 'boolean')) {
      components.push(ElementPath.renderElementPath(editor, { }, providersBackstage));
    }

    if (editor.hasPlugin('wordcount')) {
      components.push(renderWordCount(editor, providersBackstage));
    }

    if (editor.getParam('branding', true, 'boolean')) {
      components.push(renderBranding());
    }

    if (components.length > 0) {
      return [{
        dom: {
          tag: 'div',
          classes: [ 'tox-statusbar__text-container' ]
        },
        components
      }];
    }
    return [];
  };

  const getComponents = (): SimpleSpec[] => {
    const components: SimpleSpec[] = getTextComponents();
    const resizeHandler = ResizeHandler.renderResizeHandler(editor, providersBackstage);

    return components.concat(resizeHandler.toArray());
  };

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-statusbar' ]
    },
    components: getComponents()
  };
};

export { renderStatusbar };
