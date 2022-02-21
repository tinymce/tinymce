import { Behaviour, Focusing, SimpleSpec } from '@ephox/alloy';

import Editor from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';
import { Logo } from 'tinymce/themes/silver/resources/StatusbarLogo';

import * as Options from '../../api/Options';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as ElementPath from './ElementPath';
import * as ResizeHandler from './ResizeHandle';
import { renderWordCount } from './WordCount';

const renderStatusbar = (editor: Editor, providersBackstage: UiFactoryBackstageProviders): SimpleSpec => {

  const renderBranding = (): SimpleSpec => {
    return {
      dom: {
        tag: 'span',
        classes: [ 'tox-statusbar__branding' ],
      },
      components: [
        {
          dom: {
            tag: 'a',
            attributes: {
              'href': 'https://www.tiny.cloud/powered-by-tiny?utm_campaign=editor_referral&utm_medium=poweredby&utm_source=tinymce&utm_content=v6',
              'rel': 'noopener',
              'target': '_blank',
              'aria-label': I18n.translate([ 'Powered by {0}', 'Tiny' ])
            },
            innerHtml: Logo.trim()
          },
          behaviours: Behaviour.derive([
            Focusing.config({})
          ])
        }
      ]
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
