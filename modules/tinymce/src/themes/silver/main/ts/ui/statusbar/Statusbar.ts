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
    const logo = `<svg width="50" height="16" viewBox="0 0 50 16" xmlns="http://www.w3.org/2000/svg" title="${label}">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M10.143 0c2.608.015 5.186 2.178 5.186 5.331 0 0 .077 3.812-.084 4.87-.361 2.41-2.164 4.074-4.65 4.496-1.453.284-2.523.49-3.212.623-.373.071-.634.122-.785.152-.184.038-.997.145-1.35.145-2.732 0-5.21-2.04-5.248-5.33 0 0 0-3.514.03-4.442.093-2.4 1.758-4.342 4.926-4.963 0 0 3.875-.752 4.036-.782.368-.07.775-.1 1.15-.1Zm1.826 2.8L5.83 3.989v2.393l-2.455.475v5.968l6.137-1.189V9.243l2.456-.476V2.8ZM5.83 6.382l3.682-.713v3.574l-3.682.713V6.382Zm27.173-1.64-.084-1.066h-2.226v9.132h2.456V7.743c-.008-1.151.998-2.064 2.149-2.072 1.15-.008 1.987.92 1.995 2.072v5.065h2.455V7.359c-.015-2.18-1.657-3.929-3.837-3.913a3.993 3.993 0 0 0-2.908 1.296Zm-6.3-4.266L29.16 0v2.387l-2.456.475V.476Zm0 3.2v9.132h2.456V3.676h-2.456Zm18.179 11.787L49.11 3.676H46.58l-1.612 4.527-.46 1.382-.384-1.382-1.611-4.527H39.98l3.3 9.132L42.15 16l2.732-.537ZM22.867 9.738c0 .752.568 1.075.921 1.075.353 0 .668-.047.998-.154l.537 1.765c-.23.154-.92.537-2.225.537-1.305 0-2.655-.997-2.686-2.686a136.877 136.877 0 0 1 0-4.374H18.8V3.676h1.612v-1.98l2.455-.476v2.456h2.302V5.9h-2.302v3.837Z"/>
    </svg>`;
    const linkHtml = `<a href="https://www.tiny.cloud/?utm_campaign=editor_referral&amp;utm_medium=poweredby&amp;utm_source=tinymce&amp;utm_content=v5" rel="noopener" target="_blank" tabindex="-1" aria-label="${label}">${logo}</a>`;
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
