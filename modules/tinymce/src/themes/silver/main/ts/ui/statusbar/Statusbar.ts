/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { SimpleSpec } from '@ephox/alloy';

import Editor from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';

import * as Options from '../../api/Options';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as ElementPath from './ElementPath';
import * as ResizeHandler from './ResizeHandle';
import { renderWordCount } from './WordCount';

const renderStatusbar = (editor: Editor, providersBackstage: UiFactoryBackstageProviders): SimpleSpec => {

  const renderBranding = (): SimpleSpec => {
    const label = I18n.translate([ 'Powered by {0}', 'Tiny' ]);
    const logo = `<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M10.574 0c2.72.016 5.407 2.314 5.407 5.664 0 0 .08 4.05-.088 5.175-.376 2.559-2.256 4.327-4.847 4.776-2.336.464-3.72.733-4.167.823-.192.04-1.04.155-1.408.155-2.848 0-5.431-2.168-5.471-5.664 0 0 0-3.733.032-4.719C.128 3.66 1.864 1.597 5.167.937L9.374.106a6.57 6.57 0 0 1 1.2-.106Zm1.904 2.975-6.4 1.263V6.78l-2.559.506v6.34l6.4-1.263V9.82l2.559-.505v-6.34Zm-2.56 3.048V9.82l-3.84.758V6.78l3.84-.757Z"/>
    </svg>`;
    const linkHtml = `<a href="https://www.tiny.cloud/?utm_campaign=editor_referral&amp;utm_medium=poweredby&amp;utm_source=tinymce&amp;utm_content=v5" rel="noopener" target="_blank" tabindex="-1" aria-label="${label}">${ logo }<span>${label}</span></a>`;
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

    if (Options.useElementPath(editor)) {
      components.push(ElementPath.renderElementPath(editor, { }, providersBackstage));
    }

    if (editor.hasPlugin('wordcount')) {
      components.push(renderWordCount(editor, providersBackstage));
    }

    if (Options.useBranding(editor)) {
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
