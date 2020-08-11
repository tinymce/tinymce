import AlertDemo from './alert/AlertDemo';
import DialogComponentsDemo from './DialogComponentsDemo';
import NotificationDemo from './notification/NotificationDemo';
import Preview from './preview/Preview';
import { open as SearchReplace } from './searchreplace/SearchReplace';

declare let window: any;

window.components = {
  Preview,
  SearchReplace,
  DialogComponentsDemo,
  AlertDemo,
  NotificationDemo
};
