import { AlertBanner, AlertBannerSpec, createAlertBanner } from '../components/dialog/AlertBanner';
import { Bar, BarSpec, createBarFields } from '../components/dialog/Bar';
import { BodyComponent, BodyComponentSpec } from '../components/dialog/BodyComponent';
import { Button, ButtonSpec, createButton } from '../components/dialog/Button';
import { Checkbox, CheckboxSpec, createCheckbox } from '../components/dialog/Checkbox';
import { Collection, collectionDataProcessor, CollectionItem, CollectionSpec, createCollection } from '../components/dialog/Collection';
import { ColorInput, ColorInputSpec, createColorInput } from '../components/dialog/ColorInput';
import { ColorPicker, ColorPickerSpec, createColorPicker } from '../components/dialog/ColorPicker';
import {
  createCustomEditor, CustomEditor, CustomEditorInit, CustomEditorInitFn, CustomEditorNew, CustomEditorOld, customEditorSchema, CustomEditorSpec
} from '../components/dialog/CustomEditor';
import {
  createDialog, Dialog, DialogActionDetails, DialogActionHandler, DialogCancelHandler, DialogChangeDetails, DialogCloseHandler, DialogData,
  DialogInstanceApi, DialogSize, DialogSpec, DialogSubmitHandler, DialogTabChangeDetails, DialogTabChangeHandler
} from '../components/dialog/Dialog';
import {
  createDialogFooterButton, DialogFooterButton, DialogFooterButtonSpec, DialogFooterMenuButton, DialogFooterMenuButtonItemSpec,
  DialogFooterMenuButtonSpec, DialogFooterNormalButton, DialogFooterNormalButtonSpec, DialogFooterToggleButton, DialogFooterToggleButtonSpec, DialogFooterToggleMenuItem
} from '../components/dialog/DialogFooterButton';
import { createDropZone, DropZone, DropZoneSpec } from '../components/dialog/Dropzone';
import { createGridFields, Grid, GridSpec } from '../components/dialog/Grid';
import { createHtmlPanel, HtmlPanel, HtmlPanelSpec } from '../components/dialog/HtmlPanel';
import { createIframe, Iframe, IframeSpec } from '../components/dialog/Iframe';
import { ImagePreview, ImagePreviewData, ImagePreviewSpec } from '../components/dialog/ImagePreview';
import { createInput, Input, InputSpec } from '../components/dialog/Input';
import { createLabelFields, Label, LabelSpec } from '../components/dialog/Label';
import {
  createListBox, ListBox, ListBoxItem, ListBoxItemSpec, ListBoxNestedItemSpec, ListBoxSingleItemSpec, ListBoxSpec
} from '../components/dialog/ListBox';
import { createPanel, Panel, PanelSpec } from '../components/dialog/Panel';
import { createSelectBox, SelectBox, SelectBoxItem, SelectBoxItemSpec, SelectBoxSpec } from '../components/dialog/SelectBox';
import { createSizeInput, SizeInput, SizeInputSpec } from '../components/dialog/SizeInput';
import { Slider, SliderSpec } from '../components/dialog/Slider';
import { createTable, Table, TableSpec } from '../components/dialog/Table';
import { createTabPanel, Tab, TabPanel, TabPanelSpec, TabSpec } from '../components/dialog/TabPanel';
import { createTextArea, TextArea, TextAreaSpec } from '../components/dialog/Textarea';
import { Directory, Leaf, createTree, Tree, TreeItem, TreeItemSpec, TreeSpec, treeSchema } from '../components/dialog/Tree';
import {
  createUrlDialog, UrlDialog, UrlDialogActionDetails, UrlDialogActionHandler, UrlDialogCancelHandler, UrlDialogCloseHandler, UrlDialogFooterButton,
  UrlDialogFooterButtonSpec, UrlDialogInstanceApi, UrlDialogMessage, UrlDialogMessageHandler, UrlDialogSpec
} from '../components/dialog/UrlDialog';
import { createUrlInput, UrlInput, UrlInputData, UrlInputSpec } from '../components/dialog/UrlInput';

// These are the types that are to be used internally in implementations
export {
  AlertBanner,
  AlertBannerSpec,
  createAlertBanner,

  Bar,
  BarSpec,
  createBarFields,

  BodyComponent,
  BodyComponentSpec,

  Button,
  ButtonSpec,
  createButton,

  Checkbox,
  CheckboxSpec,
  createCheckbox,

  Collection,
  CollectionItem,
  CollectionSpec,
  createCollection,
  collectionDataProcessor,

  ColorInput,
  ColorInputSpec,
  createColorInput,

  ColorPicker,
  ColorPickerSpec,
  createColorPicker,

  CustomEditor,
  CustomEditorSpec,
  CustomEditorOld,
  CustomEditorNew,
  CustomEditorInit,
  CustomEditorInitFn,
  createCustomEditor,
  customEditorSchema,

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
  createDialog,

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
  createDialogFooterButton,

  DropZone,
  DropZoneSpec,
  createDropZone,

  Grid,
  GridSpec,
  createGridFields,

  HtmlPanel,
  HtmlPanelSpec,
  createHtmlPanel,

  Iframe,
  IframeSpec,
  createIframe,

  ImagePreview,
  ImagePreviewData,
  ImagePreviewSpec,

  Input,
  InputSpec,
  createInput,

  Label,
  LabelSpec,
  createLabelFields,

  ListBox,
  ListBoxSpec,
  ListBoxItem,
  ListBoxItemSpec,
  ListBoxNestedItemSpec,
  ListBoxSingleItemSpec,
  createListBox,

  Panel,
  PanelSpec,
  createPanel,

  SelectBox,
  SelectBoxSpec,
  SelectBoxItem,
  SelectBoxItemSpec,
  createSelectBox,

  SizeInput,
  SizeInputSpec,
  createSizeInput,

  Slider,
  SliderSpec,

  Table,
  TableSpec,
  createTable,

  TabPanel,
  TabPanelSpec,
  Tab,
  TabSpec,
  createTabPanel,

  TextArea,
  TextAreaSpec,
  createTextArea,

  Tree,
  TreeItem,
  TreeItemSpec,
  TreeSpec,
  Directory,
  Leaf,
  treeSchema,
  createTree,

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
  createUrlDialog,

  UrlInput,
  UrlInputData,
  UrlInputSpec,
  createUrlInput
};
