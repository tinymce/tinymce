import { type AlertBanner, type AlertBannerSpec, createAlertBanner } from '../components/dialog/AlertBanner';
import { type Bar, type BarSpec, createBarFields } from '../components/dialog/Bar';
import type { BodyComponent, BodyComponentSpec } from '../components/dialog/BodyComponent';
import { type Button, type ButtonSpec, createButton } from '../components/dialog/Button';
import { type Checkbox, type CheckboxSpec, createCheckbox } from '../components/dialog/Checkbox';
import { type Collection, collectionDataProcessor, type CollectionItem, type CollectionSpec, createCollection } from '../components/dialog/Collection';
import { type ColorInput, type ColorInputSpec, createColorInput } from '../components/dialog/ColorInput';
import { type ColorPicker, type ColorPickerSpec, createColorPicker } from '../components/dialog/ColorPicker';
import {
  createCustomEditor, type CustomEditor, type CustomEditorInit, type CustomEditorInitFn, type CustomEditorNew, type CustomEditorOld, customEditorSchema, type CustomEditorSpec
} from '../components/dialog/CustomEditor';
import {
  createDialog, type Dialog, type DialogActionDetails, type DialogActionHandler, type DialogCancelHandler, type DialogChangeDetails, type DialogCloseHandler, type DialogData,
  type DialogInstanceApi, type DialogSize, type DialogSpec, type DialogSubmitHandler, type DialogTabChangeDetails, type DialogTabChangeHandler
} from '../components/dialog/Dialog';
import {
  createDialogFooterButton, type DialogFooterButton, type DialogFooterButtonSpec, type DialogFooterMenuButton, type DialogFooterMenuButtonItemSpec,
  type DialogFooterMenuButtonSpec, type DialogFooterNormalButton, type DialogFooterNormalButtonSpec, type DialogFooterToggleButton, type DialogFooterToggleButtonSpec, type DialogFooterToggleMenuItem
} from '../components/dialog/DialogFooterButton';
import { createDropZone, type DropZone, type DropZoneSpec } from '../components/dialog/Dropzone';
import { createGridFields, type Grid, type GridSpec } from '../components/dialog/Grid';
import { createHtmlPanel, type HtmlPanel, type HtmlPanelSpec } from '../components/dialog/HtmlPanel';
import { createIframe, type Iframe, type IframeSpec } from '../components/dialog/Iframe';
import type { ImagePreview, ImagePreviewData, ImagePreviewSpec } from '../components/dialog/ImagePreview';
import { createInput, type Input, type InputSpec } from '../components/dialog/Input';
import { createLabelFields, type Label, type LabelSpec } from '../components/dialog/Label';
import {
  createListBox, type ListBox, type ListBoxItem, type ListBoxItemSpec, type ListBoxNestedItemSpec, type ListBoxSingleItemSpec, type ListBoxSpec
} from '../components/dialog/ListBox';
import { createPanel, type Panel, type PanelSpec } from '../components/dialog/Panel';
import { createSelectBox, type SelectBox, type SelectBoxItem, type SelectBoxItemSpec, type SelectBoxSpec } from '../components/dialog/SelectBox';
import { createSizeInput, type SizeInput, type SizeInputSpec } from '../components/dialog/SizeInput';
import type { Slider, SliderSpec } from '../components/dialog/Slider';
import { createTable, type Table, type TableSpec } from '../components/dialog/Table';
import { createTabPanel, type Tab, type TabPanel, type TabPanelSpec, type TabSpec } from '../components/dialog/TabPanel';
import { createTextArea, type TextArea, type TextAreaSpec } from '../components/dialog/Textarea';
import { type Directory, type Leaf, createTree, type Tree, type TreeItem, type TreeItemSpec, type TreeSpec, treeSchema } from '../components/dialog/Tree';
import {
  createUrlDialog, type UrlDialog, type UrlDialogActionDetails, type UrlDialogActionHandler, type UrlDialogCancelHandler, type UrlDialogCloseHandler, type UrlDialogFooterButton,
  type UrlDialogFooterButtonSpec, type UrlDialogInstanceApi, type UrlDialogMessage, type UrlDialogMessageHandler, type UrlDialogSpec
} from '../components/dialog/UrlDialog';
import { createUrlInput, type UrlInput, type UrlInputData, type UrlInputSpec } from '../components/dialog/UrlInput';

// These are the types that are to be used internally in implementations
export type {
  AlertBanner,
  AlertBannerSpec,
  Bar,
  BarSpec,
  BodyComponent,
  BodyComponentSpec,
  Button,
  ButtonSpec,
  Checkbox,
  CheckboxSpec,
  Collection,
  CollectionItem,
  CollectionSpec,
  ColorInput,
  ColorInputSpec,
  ColorPicker,
  ColorPickerSpec,
  CustomEditor,
  CustomEditorSpec,
  CustomEditorOld,
  CustomEditorNew,
  CustomEditorInit,
  CustomEditorInitFn,
  Dialog,
  DialogSpec,
  DialogInstanceApi,
  DialogActionDetails,
  DialogActionHandler,
  DialogChangeDetails,
  DialogCancelHandler,
  DialogCloseHandler,
  DialogSubmitHandler,
  DialogTabChangeDetails,
  DialogTabChangeHandler,
  DialogData,
  DialogSize,
  DialogFooterButton,
  DialogFooterButtonSpec,
  DialogFooterNormalButton,
  DialogFooterNormalButtonSpec,
  DialogFooterMenuButton,
  DialogFooterMenuButtonSpec,
  DialogFooterToggleButton,
  DialogFooterToggleButtonSpec,
  DialogFooterToggleMenuItem,
  DialogFooterMenuButtonItemSpec,
  DropZone,
  DropZoneSpec,
  Grid,
  GridSpec,
  HtmlPanel,
  HtmlPanelSpec,
  Iframe,
  IframeSpec,
  ImagePreview,
  ImagePreviewData,
  ImagePreviewSpec,
  Input,
  InputSpec,
  Label,
  LabelSpec,
  ListBox,
  ListBoxSpec,
  ListBoxItem,
  ListBoxItemSpec,
  ListBoxNestedItemSpec,
  ListBoxSingleItemSpec,
  Panel,
  PanelSpec,
  SelectBox,
  SelectBoxSpec,
  SelectBoxItem,
  SelectBoxItemSpec,
  SizeInput,
  SizeInputSpec,
  Slider,
  SliderSpec,
  Table,
  TableSpec,
  TabPanel,
  TabPanelSpec,
  Tab,
  TabSpec,
  TextArea,
  TextAreaSpec,
  Tree,
  TreeItem,
  TreeItemSpec,
  TreeSpec,
  Directory,
  Leaf,
  UrlDialog,
  UrlDialogSpec,
  UrlDialogInstanceApi,
  UrlDialogFooterButton,
  UrlDialogFooterButtonSpec,
  UrlDialogActionDetails,
  UrlDialogActionHandler,
  UrlDialogCancelHandler,
  UrlDialogCloseHandler,
  UrlDialogMessage,
  UrlDialogMessageHandler,
  UrlInput,
  UrlInputData,
  UrlInputSpec
};
export {
  createAlertBanner,
  createBarFields,
  createButton,
  createCheckbox,
  createCollection,
  collectionDataProcessor,
  createColorInput,
  createColorPicker,
  createCustomEditor,
  customEditorSchema,
  createDialog,
  createDialogFooterButton,
  createDropZone,
  createGridFields,
  createHtmlPanel,
  createIframe,
  createInput,
  createLabelFields,
  createListBox,
  createPanel,
  createSelectBox,
  createSizeInput,
  createTable,
  createTabPanel,
  createTextArea,
  treeSchema,
  createTree,
  createUrlDialog,
  createUrlInput
};
