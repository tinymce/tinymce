import { TooltippingTypes } from '@ephox/alloy';
import { Fun } from '@ephox/katamari';

import I18n from 'tinymce/core/api/util/I18n';
import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';

const defaultOptions: Record<string, any> = {
  images_file_types: 'jpeg,jpg,jpe,jfi,jif,jfif,png,gif,bmp,webp'
};

export default {
  icons: (): Record<string, string> => ({}),
  menuItems: (): Record<string, any> => ({}),
  translate: I18n.translate,
  isDisabled: Fun.never,
  getOption: <T>(name: string): T | undefined => defaultOptions[name],
  checkUiComponentContext: Fun.constant({ contextType: 'any', shouldDisable: false }),
  tooltips: {
    getConfig: (): TooltippingTypes.TooltippingConfigSpec => {
      return {
        lazySink: {},
        tooltipDom: {
          tag: 'div'
        }
      } as any;
    },
    getComponents: () => {
      return [] as any;
    },
  }
} as UiFactoryBackstageProviders;
