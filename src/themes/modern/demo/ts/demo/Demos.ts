import ClassicDemo from './ClassicDemo';
import Demo from './Demo';
import NotificationDemo from './NotificationDemo';

declare let window: any;

window.demos = {
  classic: ClassicDemo,
  demo: Demo,
  notifications: NotificationDemo
};