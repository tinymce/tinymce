import { Optional } from '@ephox/katamari';

import { Dialog } from 'tinymce/core/api/ui/Ui';

export type ListValue = Dialog.ListBoxSingleItemSpec;
export type ListGroup = Dialog.ListBoxNestedItemSpec;
export type ListItem = Dialog.ListBoxItemSpec;

export interface UserListItem {
  text?: string;
  title?: string;
  value?: string;
  url?: string;
  menu?: UserListItem[];
}

export interface LinkDialogCatalog {
  link: Optional<ListItem[]>;
  targets: Optional<ListItem[]>;
  rels: Optional<ListItem[]>;
  classes: Optional<ListItem[]>;
  anchor: Optional<ListItem[]>;
}

export interface LinkDialogInfo {
  readonly anchor: {
    readonly url: Optional<string>;
    readonly text: Optional<string>;
    readonly target: Optional<string>;
    readonly rel: Optional<string>;
    readonly linkClass: Optional<string>;
    readonly title: Optional<string>;
  };
  readonly catalogs: LinkDialogCatalog;
  readonly flags: {
    readonly titleEnabled: boolean;
  };
  readonly optNode: Optional<HTMLAnchorElement>;
  readonly onSubmit?: (api: Dialog.DialogInstanceApi<LinkDialogData>) => void;
}

export interface LinkDialogUrlData {
  readonly value: string;
  readonly meta?: LinkUrlMeta;
}

export type LinkDialogKey = 'text' | 'target' | 'rel' | 'linkClass' | 'title';

export interface LinkDialogData {
  readonly url: LinkDialogUrlData;
  readonly text: string;
  readonly title: string;
  readonly anchor: string;
  readonly link: string;
  readonly rel: string;
  readonly target: string;
  readonly linkClass: string;
}

export interface LinkDialogOutput {
  readonly href: string;
  readonly text: Optional<string>;
  readonly target: Optional<string>;
  readonly rel: Optional<string>;
  readonly class: Optional<string>;
  readonly title: Optional<string>;
}

interface LinkUrlMeta {
  readonly text?: string;
  readonly title?: string;
  readonly attach?: () => void;
  readonly original?: {
    readonly value: string;
  };
}

export interface AttachState {
  readonly href: string;
  readonly attach: () => void;
}
