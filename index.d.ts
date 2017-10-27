import * as tinymce from 'tinymce';

declare module 'tinymce' {
  export interface Settings extends tinymce.Settings {
    [key: string]: any,
  }

  export function init(settings: Settings): Promise<tinymce.Editor[]>;

  export const shopifyConfig: Settings;
}

export * from 'tinymce';
