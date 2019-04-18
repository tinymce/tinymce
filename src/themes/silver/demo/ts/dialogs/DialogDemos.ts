import { Arr } from '@ephox/katamari';

import { buildDemoDialog } from './DemoDialogBuilder';
import AnchorDialogSpec from './spec/AnchorDialogSpec';
import CharmapDialogSpec from './spec/CharmapDialogSpec';
import CodeSampleDialogSpec from './spec/CodeSampleDialogSpec';
import ColorPickerDialogSpec from './spec/ColorPickerDialogSpec';
import DocumentPropsDialogSpec from './spec/DocumentPropsDialogSpec';
import FindReplaceDialogSpec from './spec/FindReplaceDialogSpec';
import ImageDialogSpec from './spec/ImageDialogSpec';
import LinkDialogSpec from './spec/LinkDialogSpec';
import MediaDialogSpec from './spec/MediaDialogSpec';
import PreviewDialogSpec from './spec/PreviewDialogSpec';
import TableCellDialogSpec from './spec/TableCellDialogSpec';
import TableDialogSpec from './spec/TableDialogSpec';
import TableRowDialogSpec from './spec/TableRowDialogSpec';
import TemplateDialogSpec from './spec/TemplateDialogSpec';
import AlertBannerDialogSpec from './spec/AlertBannerDialogSpec';
import CustomRediallingSpec from './spec/CustomRediallingSpec';
import UrlDialogDemo from './UrlDialogDemo';

declare let window: any;

const demo = () => {
  Arr.map([
    CustomRediallingSpec,
    AlertBannerDialogSpec,
    AnchorDialogSpec,
    CharmapDialogSpec,
    CodeSampleDialogSpec,
    ColorPickerDialogSpec,
    DocumentPropsDialogSpec,
    FindReplaceDialogSpec,
    ImageDialogSpec,
    LinkDialogSpec,
    MediaDialogSpec,
    PreviewDialogSpec,
    TableCellDialogSpec,
    TableDialogSpec,
    TableRowDialogSpec,
    TemplateDialogSpec
  ], buildDemoDialog);
};

window.dialogdemos = {
  demo,
  UrlDialogDemo
};
