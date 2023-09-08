import { Arr, Fun, Optional, Optionals } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as Options from '../api/Options';
import { ListOptions } from '../core/ListOptions';
import * as Utils from '../core/Utils';
import { DialogChanges } from './DialogChanges';
import { DialogConfirms } from './DialogConfirms';
import { DialogInfo } from './DialogInfo';
import { LinkDialogData, LinkDialogInfo, LinkDialogKey } from './DialogTypes';

const handleSubmit = (editor: Editor, info: LinkDialogInfo) => (api: Dialog.DialogInstanceApi<LinkDialogData>): void => {
  const data: LinkDialogData = api.getData();

  if (!data.url.value) {
    Utils.unlink(editor);
    // Temporary fix. TODO: TINY-2811
    api.close();
    return;
  }

  // Check if a key is defined, meaning it was a field in the dialog. If it is,
  // then check if it's changed and return none if nothing has changed.
  const getChangedValue = (key: LinkDialogKey) => Optional.from(data[key]).filter((value) => !Optionals.is(info.anchor[key], value));

  const changedData = {
    href: data.url.value,
    text: getChangedValue('text'),
    target: getChangedValue('target'),
    rel: getChangedValue('rel'),
    class: getChangedValue('linkClass'),
    title: getChangedValue('title')
  };

  const attachState = {
    href: data.url.value,
    attach: data.url.meta !== undefined && data.url.meta.attach ? data.url.meta.attach : Fun.noop
  };

  DialogConfirms.preprocess(editor, changedData).then((pData) => {
    Utils.link(editor, attachState, pData);
  });

  api.close();
};

const collectData = (editor: Editor): Promise<LinkDialogInfo> => {
  const anchorNode = Utils.getAnchorElement(editor);
  return DialogInfo.collect(editor, anchorNode);
};

const getInitialData = (info: LinkDialogInfo, defaultTarget: Optional<string>): LinkDialogData => {
  const anchor = info.anchor;
  const url = anchor.url.getOr('');

  return {
    url: {
      value: url,
      meta: {
        original: {
          value: url
        }
      }
    },
    text: anchor.text.getOr(''),
    title: anchor.title.getOr(''),
    anchor: url,
    link: url,
    rel: anchor.rel.getOr(''),
    target: anchor.target.or(defaultTarget).getOr(''),
    linkClass: anchor.linkClass.getOr('')
  };
};

const makeDialog = (settings: LinkDialogInfo, onSubmit: (api: Dialog.DialogInstanceApi<LinkDialogData>) => void, editor: Editor): Dialog.DialogSpec<LinkDialogData> => {

  const urlInput: Dialog.UrlInputSpec[] = [
    {
      name: 'url',
      type: 'urlinput',
      filetype: 'file',
      label: 'URL',
      picker_text: 'Browse links'
    }
  ];

  const displayText = settings.anchor.text.map<Dialog.InputSpec>(() => (
    {
      name: 'text',
      type: 'input',
      label: 'Text to display'
    }
  )).toArray();

  const titleText: Dialog.InputSpec[] = settings.flags.titleEnabled ? [
    {
      name: 'title',
      type: 'input',
      label: 'Title'
    }
  ] : [];

  const defaultTarget: Optional<string> = Optional.from(Options.getDefaultLinkTarget(editor));

  const initialData = getInitialData(settings, defaultTarget);
  const catalogs = settings.catalogs;
  const dialogDelta = DialogChanges.init(initialData, catalogs);

  const body: Dialog.PanelSpec = {
    type: 'panel',
    items: Arr.flatten<Dialog.BodyComponentSpec>([
      urlInput,
      displayText,
      titleText,
      Optionals.cat([
        catalogs.anchor.map(ListOptions.createUi('anchor', 'Anchors')),
        catalogs.rels.map(ListOptions.createUi('rel', 'Rel')),
        catalogs.targets.map(ListOptions.createUi('target', 'Open link in...')),
        catalogs.link.map(ListOptions.createUi('link', 'Link list')),
        catalogs.classes.map(ListOptions.createUi('linkClass', 'Class'))
      ])
    ])
  };
  return {
    title: 'Insert/Edit Link',
    size: 'normal',
    body,
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      }
    ],
    initialData,
    onChange: (api: Dialog.DialogInstanceApi<LinkDialogData>, { name }) => {
      dialogDelta.onChange(api.getData, { name }).each((newData) => {
        api.setData(newData);
      });
    },
    onSubmit
  };
};

const open = (editor: Editor): void => {
  const data = collectData(editor);
  data.then((info) => {
    const onSubmit = handleSubmit(editor, info);
    return makeDialog(info, onSubmit, editor);
  }).then((spec) => {
    editor.windowManager.open(spec);
  });
};

export {
  open
};
