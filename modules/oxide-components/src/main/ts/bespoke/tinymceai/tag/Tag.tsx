import { forwardRef, type FunctionComponent } from 'react';

import { Button } from '../../../components/button/Button';
import * as Bem from '../../../utils/Bem';

const TagCloseIcon: FunctionComponent = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      {/* eslint-disable-next-line max-len */}
      <path fillRule="evenodd" clipRule="evenodd" d="M11.8153 5.08028L8.90396 8L11.8153 10.9197C12.0619 11.1672 12.0615 11.5675 11.8145 11.8145C11.5675 12.0615 11.1672 12.0619 10.9197 11.8153L8 8.90396L5.08028 11.8153C4.83285 12.0619 4.43248 12.0615 4.18548 11.8145C3.93847 11.5675 3.93813 11.1672 4.18471 10.9197L7.09604 8L4.18471 5.08028C3.93813 4.83285 3.93847 4.43248 4.18548 4.18548C4.43248 3.93847 4.83285 3.93813 5.08028 4.18471L8 7.09603L10.9197 4.18471C11.1672 3.93813 11.5675 3.93848 11.8145 4.18548C12.0615 4.43248 12.0619 4.83285 11.8153 5.08028Z" fill="#606973" />
    </svg>
  );
};

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
          {/* The svg is temporary until the oxide-icons include the icons with the correct size for this project */}
          {/* Once that is done, we will revert back to using the IconButton component */}
          <Button variant='naked' disabled={disabled} onClick={props.onClose} className={Bem.block('tox-button', { icon: true })} aria-label={ariaLabel}>
            <TagCloseIcon />
          </Button>
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
