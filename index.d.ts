import * as tinymce from 'tinymce';

export interface Settings extends tinymce.Settings {
  [key: string]: any,
}

declare module 'tinymce' {
  function init(settings: Settings): Promise<tinymce.Editor[]>;
}

export const shopifyConfig: Settings;
export * from 'tinymce';
