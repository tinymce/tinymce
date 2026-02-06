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
}

interface NonLinkTagProps {
  readonly link: false;
}

interface LinkTagProps {
  readonly link: true;
  readonly href: string;
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
  const { label, icon, closeable, ariaLabel, link, ...rest } = props;
  const disabled = closeable && props.disabled === true;
  const href = link ? props.href : undefined;

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
    <a className={Bem.block('tox-tag')} href={href} ref={ref as React.Ref<HTMLAnchorElement>} {...rest}>
      {content}
    </a>
  ) : (
    <div className={Bem.block('tox-tag')} ref={ref as React.Ref<HTMLDivElement>} {...rest}>
      {content}
    </div>
  );
});
