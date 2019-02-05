/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLAnchorElement } from '@ephox/dom-globals';
import { Arr, Future, Option, Options } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';

import Settings from '../api/Settings';
import { ListOptions } from '../core/ListOptions';
import Utils from '../core/Utils';
import { DialogChanges } from './DialogChanges';
import { DialogConfirms } from './DialogConfirms';
import { DialogInfo } from './DialogInfo';
import { LinkDialogData, LinkDialogInfo } from './DialogTypes';
import { Types } from '@ephox/bridge';

const handleSubmit = (editor, info: LinkDialogInfo, text: Option<string>, assumeExternalTargets: boolean) => (api: Types.Dialog.DialogInstanceApi<LinkDialogData>) => {
  const data: LinkDialogData = api.getData();

  // Merge in the initial state and any changed state
  const resultData = {
    href: data.url.value,
    text: Option.from(data.text).or(text).getOr(undefined),
    target: Option.from(data.target).or(info.anchor.target).getOr(undefined),
    rel: Option.from(data.rel).or(info.anchor.rel).getOr(undefined),
    class: Option.from(data.classz).or(info.anchor.linkClass).getOr(undefined),
    title: Option.from(data.title).or(info.anchor.title).getOr(undefined),
  };

  const attachState = {
    href: data.url.value,
    attach: data.url.meta !== undefined && data.url.meta.attach ? data.url.meta.attach : () => {}
  };

  const insertLink = Utils.link(editor, attachState);
  const removeLink = Utils.unlink(editor);

  const url = data.url.value;

  if (!url) {
    removeLink();
    // Temporary fix. TODO: TINY-2811
    api.close();
    return;
  }

  if (text.is(data.text) || (info.optNode.isNone() && !data.text)) {
    delete resultData.text;
  }

  DialogConfirms.preprocess(editor, assumeExternalTargets, resultData).get((pData) => {
    insertLink(pData);
  });

  api.close();
};

const collectData = (editor): Future<LinkDialogInfo> => {
  const settings = editor.settings;
  const anchorNode: HTMLAnchorElement = Utils.getAnchorElement(editor);
  return DialogInfo.collect(editor, settings, anchorNode);
};

const getInitialData = (info: LinkDialogInfo): LinkDialogData => ({
  url: {
    value: info.anchor.url.getOr(''),
    meta: {
      attach: () => { },
      text: info.anchor.url.fold(
        () => '',
        () => info.anchor.text.getOr('')
      ),
      original: {
        value: info.anchor.url.getOr(''),
      }
    }
  },
  text: info.anchor.text.getOr(''),
  title: info.anchor.title.getOr(''),
  anchor: info.anchor.url.getOr(''),
  link: info.anchor.url.getOr(''),
  rel: info.anchor.rel.getOr(''),
  target: info.anchor.target.getOr(''),
  classz: info.anchor.linkClass.getOr('')
});

const makeDialog = (settings: LinkDialogInfo, onSubmit): Types.Dialog.DialogApi<LinkDialogData> => {

  const urlInput: Types.Dialog.BodyComponentApi[] = [
    {
      name: 'url',
      type: 'urlinput',
      filetype: 'file',
      label: 'URL'
    }
  ];

  const displayText = settings.anchor.text.map<Types.Dialog.BodyComponentApi>(() => (
    {
      name: 'text',
      type: 'input',
      label: 'Text to display'
    }
  )).toArray();

  const titleText: Types.Dialog.BodyComponentApi[] = settings.flags.titleEnabled ? [
    {
      name: 'title',
      type: 'input',
      label: 'Title'
    }
  ] : [];

  const initialData = getInitialData(settings);
  const dialogDelta = DialogChanges.init(initialData, settings);
  const catalogs = settings.catalogs;

  const body: Types.Dialog.PanelApi = {
    type: 'panel',
    items: Arr.flatten([
      urlInput,
      displayText,
      titleText,
      Options.cat<Types.Dialog.BodyComponentApi>([
        catalogs.anchor.map(ListOptions.createUi('anchor', 'Anchors')),
        catalogs.rels.map(ListOptions.createUi('rel', 'Rel')),
        catalogs.targets.map(ListOptions.createUi('target', 'Open link in...')),
        catalogs.link.map(ListOptions.createUi('link', 'Link list')),
        catalogs.classes.map(ListOptions.createUi('classz', 'Class'))
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
    onChange: (api: Types.Dialog.DialogInstanceApi<LinkDialogData>, {name}) => {
      dialogDelta.onChange(api.getData, { name }).each((newData) => {
        api.setData(newData);
      });
    },
    onSubmit
  };
};

const open = function (editor: Editor) {
  const data = collectData(editor);
  data.map((info) => {
    const onSubmit = handleSubmit(editor, info, info.anchor.text, Settings.assumeExternalTargets(editor.settings));
    return makeDialog(info, onSubmit);
  }).get((spec) => {
    editor.windowManager.open(spec);
  });
};

export default {
  open
};