import * as tinymce from 'tinymce';
export * from 'tinymce';

export interface Settings extends tinymce.Settings {
  [key: string]: any,
}

export function init(settings: Settings): Promise<tinymce.Editor[]>;

export const shopifyConfig: Settings;
