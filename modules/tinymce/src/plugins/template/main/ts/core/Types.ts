import { Optional } from '@ephox/katamari';

export interface UrlTemplate {
  readonly title: string;
  readonly description: string;
  readonly url: string;
}

export interface ContentTemplate {
  readonly title: string;
  readonly description: string;
  readonly content: string;
}

export type ExternalTemplate = UrlTemplate | ContentTemplate;

export interface InternalTemplate {
  readonly selected: boolean;
  readonly text: string;
  readonly value: {
    readonly url: Optional<string>;
    readonly content: Optional<string>;
    readonly description: string;
  };
}

export interface DialogData {
  readonly template: string;
  readonly preview: string;
}

export type TemplateValues = Record<string, string | ((name: string) => string)>;
