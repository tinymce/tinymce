import type * as CSS from 'csstype';

declare module 'csstype' {
  interface Properties {
    // Allow CSS custom property
    '--tox-private-floating-sidebar-requested-height'?: CSS.Property.Height;
    '--tox-private-floating-sidebar-requested-top'?: CSS.Property.Top;
    '--tox-private-floating-sidebar-requested-left'?: CSS.Property.Left;
  }
}
