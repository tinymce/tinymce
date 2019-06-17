import Preview from './preview/Preview';
import { open as SearchReplace } from './searchreplace/SearchReplace';

import DialogComponentsDemo from './DialogComponentsDemo';

import AlertDemo from './alert/AlertDemo';
import NotificationDemo from './notification/NotificationDemo';

declare let window: any;

window.components = {
  Preview,
  SearchReplace,
  DialogComponentsDemo,
  AlertDemo,
  NotificationDemo
};
