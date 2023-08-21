import { Behaviour, Focusing, GuiFactory, SimpleSpec } from '@ephox/alloy';

import Editor from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';
import { Logo } from 'tinymce/themes/silver/resources/StatusbarLogo';

import * as Options from '../../api/Options';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as ConvertShortcut from '../alien/ConvertShortcut';
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

  const renderHelpAccessibility = (): SimpleSpec => {
    const shortcutText = ConvertShortcut.convertText('Alt+0');
    const text = `Press {0} for help`;
    return {
      dom: {
        tag: 'div',
        classes: [ 'tox-statusbar__help-text' ],
      },
      components: [
        GuiFactory.text(I18n.translate([ text, shortcutText ]))
      ]
    };
  };

  const renderRightContainer = () => {
    const components: SimpleSpec[] = [];

    if (editor.hasPlugin('wordcount')) {
      components.push(renderWordCount(editor, providersBackstage));
    }

    if (Options.useBranding(editor)) {
      components.push(renderBranding());
    }

    return {
      dom: {
        tag: 'div',
        classes: [ 'tox-statusbar__right-container' ]
      },
      components
    };
  };

  const getTextComponents = (): SimpleSpec[] => {
    const components: SimpleSpec[] = [];
    const shouldRenderHelp = Options.useHelpAccessibility(editor);
    const shouldRenderElementPath = Options.useElementPath(editor);
    const shouldRenderRightContainer = Options.useBranding(editor) || editor.hasPlugin('wordcount');

    const getTextComponentClasses = () => {
      const flexStart = 'tox-statusbar__text-container--flex-start';
      const flexEnd = 'tox-statusbar__text-container--flex-end';
      const spaceAround = 'tox-statusbar__text-container--space-around';

      if (shouldRenderHelp) {
        const container3Columns = 'tox-statusbar__text-container-3-cols';

        if (!shouldRenderRightContainer && !shouldRenderElementPath) {
          return [ container3Columns, spaceAround ];
        }

        if (shouldRenderRightContainer && !shouldRenderElementPath) {
          return [ container3Columns, flexEnd ];
        }

        return [ container3Columns, flexStart ];
      }

      return [ shouldRenderRightContainer && !shouldRenderElementPath ? flexEnd : flexStart ];
    };

    if (shouldRenderElementPath) {
      components.push(ElementPath.renderElementPath(editor, { }, providersBackstage));
    }

    if (shouldRenderHelp) {
      components.push(renderHelpAccessibility());
    }

    if (shouldRenderRightContainer) {
      components.push(renderRightContainer());
    }

    if (components.length > 0) {
      return [{
        dom: {
          tag: 'div',
          classes: [ 'tox-statusbar__text-container', ...getTextComponentClasses() ]
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
