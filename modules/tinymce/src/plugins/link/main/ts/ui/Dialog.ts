import { Arr, Fun, Optional, Optionals } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';
import type { BlobInfo } from 'tinymce/core/api/file/BlobCache';
import type { DocumentsFileTypes } from 'tinymce/core/api/OptionTypes';
import type { Dialog } from 'tinymce/core/api/ui/Ui';
import type { UploadFileData, UploadHandler } from 'tinymce/core/file/Uploader';

import * as Options from '../api/Options';
import * as Actions from '../core/Actions';
import { ListOptions } from '../core/ListOptions';
import * as Utils from '../core/Utils';

import { DialogChanges } from './DialogChanges';
import { DialogConfirms } from './DialogConfirms';
import { DialogInfo } from './DialogInfo';
import type { API, LinkDialogCatalog, LinkDialogData, LinkDialogInfo, LinkDialogKey } from './DialogTypes';
import { UploadTab } from './UploadTab';

interface Helpers {
  readonly addToBlobCache: (blobInfo: BlobInfo) => void;
  readonly createBlobCache: (file: File, blobUri: string, dataUrl: string) => BlobInfo;
  readonly alertErr: (message: string, callback: () => void) => void;
  readonly uploadFile: UploadHandler<UploadFileData>;
  readonly getExistingBlobInfo: (base64: string, type: string) => BlobInfo | undefined;
}

const handleSubmit = (editor: Editor, info: LinkDialogInfo) => (api: Dialog.DialogInstanceApi<LinkDialogData>): void => {
  const data: LinkDialogData = api.getData();

  if (!data.url.value) {
    Actions.unlink(editor);
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

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  DialogConfirms.preprocess(editor, changedData).then((pData) => {
    Actions.link(editor, attachState, pData);
  });

  api.close();
};

const uploadFile = (editor: Editor): UploadHandler<UploadFileData> => (blobInfo: BlobInfo, progress: (percent: number) => void): Promise<UploadFileData> => {
  const fileUploadHandler = Options.getFilesUploadHandler(editor);
  return fileUploadHandler(blobInfo, progress);
};

const dataUrlToBase64 = (dataUrl: string) => Optional.from(dataUrl.split(',')[1]).getOr('');

const changeFileInput = (helpers: Helpers, api: API): void => {
  const data = api.getData();
  api.block('Uploading file');
  Arr.head(data.fileinput)
    .fold(() => {
      api.unblock();
    }, (file) => {
      const blobUri: string = URL.createObjectURL(file);

      const updateUrlAndSwitchTab = ({ url, fileName }: UploadFileData) => {
        api.setData({ text: fileName, title: fileName, url: { value: url, meta: {}}});
        api.showTab('general');
        api.focus('url');
      };

      const finalize = () => {
        api.unblock();
        URL.revokeObjectURL(blobUri);
      };

      Utils.blobToDataUri(file).then((dataUrl) => {
        const existingBlobInfo = helpers.getExistingBlobInfo(dataUrlToBase64(dataUrl), file.type);
        const blobInfo = existingBlobInfo && existingBlobInfo.filename() === file.name ? existingBlobInfo : helpers.createBlobCache(file, blobUri, dataUrl);
        helpers.addToBlobCache(blobInfo);
        return helpers.uploadFile(blobInfo, Fun.identity);
      }).then((result) => {
        updateUrlAndSwitchTab(result);
        finalize();
      }).catch((err) => {
        finalize();
        helpers.alertErr(err, () => {
          api.focus('fileinput');
        });
      });
    });
};

const createBlobCache = (editor: Editor) => (file: File, blobUri: string, dataUrl: string): BlobInfo =>
  editor.editorUpload.blobCache.create({
    blob: file,
    blobUri,
    name: file.name?.replace(/\.[^\.]+$/, ''),
    filename: file.name,
    base64: dataUrl.split(',')[1]
  });

const addToBlobCache = (editor: Editor) => (blobInfo: BlobInfo): void => {
  editor.editorUpload.blobCache.add(blobInfo);
};

const getExistingBlobInfo = (editor: Editor) => (base64: string, type: string): BlobInfo | undefined => {
  return editor.editorUpload.blobCache.getByData(base64, type);
};

const alertErr = (editor: Editor) => (message: string, callback: () => void): void => {
  editor.windowManager.alert(message, callback);
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
    linkClass: anchor.linkClass.getOr(''),
    fileinput: []
  };
};

const makeDialogBody = (
  urlInput: Dialog.UrlInputSpec[],
  displayText: Dialog.InputSpec[],
  titleText: Dialog.InputSpec[],
  catalogs: LinkDialogCatalog,
  hasUploadPanel: boolean,
  fileTypes: DocumentsFileTypes[]
): Dialog.PanelSpec | Dialog.TabPanelSpec => {

  const generalPanelItems = Arr.flatten<Dialog.BodyComponentSpec>([
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
  ]);

  if (hasUploadPanel) {
    const tabPanel: Dialog.TabPanelSpec = {
      type: 'tabpanel',
      tabs: Arr.flatten([
        [{
          title: 'General',
          name: 'general',
          items: generalPanelItems
        }],
        [ UploadTab.makeTab(fileTypes) ]
      ])
    };
    return tabPanel;
  } else {
    return {
      type: 'panel',
      items: generalPanelItems
    };
  }
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

  const body = makeDialogBody(urlInput, displayText, titleText, catalogs, settings.hasUploadPanel, Options.getDocumentsFileTypes(editor));
  const helpers: Helpers = {
    addToBlobCache: addToBlobCache(editor),
    createBlobCache: createBlobCache(editor),
    alertErr: alertErr(editor),
    uploadFile: uploadFile(editor),
    getExistingBlobInfo: getExistingBlobInfo(editor)
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
      if (name === 'fileinput') {
        changeFileInput(helpers, api);
      } else {
        dialogDelta.onChange(api.getData, { name }).each((newData) => {
          api.setData(newData);
        });
      }
    },
    onSubmit
  };
};

const open = (editor: Editor): void => {
  const data = collectData(editor);
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
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
