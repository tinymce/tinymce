import { Type } from '@ephox/katamari';
import { IconButton } from 'oxide-components/main';
import { forwardRef } from 'react';

import * as Bem from '../../../utils/Bem';

interface BaseTagProps {
  readonly label: string;
  readonly icon?: JSX.Element;
  readonly onMouseEnter?: (event: React.MouseEvent<HTMLElement>) => void;
  readonly onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void;
  readonly onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
  readonly onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  readonly onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  readonly ariaLabel?: string;
  readonly focusable?: boolean;
}

interface NonLinkTagProps {
  readonly link: false;
}

interface LinkTagProps {
  readonly link: true;
  readonly href: string;
  readonly target?: string;
}

interface NonClosableProps {
  readonly closeable: false;
}

interface ClosableProps {
  readonly closeable: true;
  readonly onClose: () => void;
  readonly disabled?: boolean;
}

export type TagProps = (NonLinkTagProps | LinkTagProps) & (NonClosableProps | ClosableProps) & BaseTagProps;

// Tag is here in reference to a tagging/labeling context, not a HTML tag.
export const Tag = forwardRef<HTMLDivElement | HTMLAnchorElement, TagProps>((props, ref) => {
  const { label, icon, closeable, ariaLabel, link, focusable: focusableProp, ...rest } = props;
  const disabled = closeable && props.disabled === true;
  const href = link ? props.href : undefined;
  const target = link ? (props.target ?? '_blank') : undefined;
  const rel = link && target === '_blank' ? 'noopener noreferrer' : undefined;
  const focusable = Type.isNullable(focusableProp) || closeable ? true : props.focusable;
  const sharedAttrs = {
    className: Bem.block('tox-tag'),
    onKeyUp: (e: React.KeyboardEvent<HTMLDivElement | HTMLAnchorElement>) => {
      if (closeable && [ 'Backspace', 'Delete' ].includes(e.key) && !disabled) {
        props.onClose();
      }
    },
    ...(focusable ? { tabIndex: -1 } : {})
  };

  const content = (
    <>
      {icon}
      <span className={Bem.element('tox-tag', 'label')}>{label}</span>
      {closeable && (
        <span className={Bem.element('tox-tag', 'close')}>
          <IconButton icon='source-close' variant='naked' disabled={disabled} onClick={props.onClose} aria-label={ariaLabel} />
        </span>
      )}
    </>
  );

  return link ? (
    <a
      {...rest}
      {...sharedAttrs}
      href={href}
      target={target}
      rel={rel}
      ref={ref as React.Ref<HTMLAnchorElement>}
    >
      {content}
    </a>
  ) : (
    <div
      {...rest}
      {...sharedAttrs}
      ref={ref as React.Ref<HTMLDivElement>}
    >
      {content}
    </div>
  );
});
