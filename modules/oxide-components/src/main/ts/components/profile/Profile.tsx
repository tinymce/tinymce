import { Type } from '@ephox/katamari';
import { forwardRef, type FC, type PropsWithChildren } from 'react';

import * as Bem from '../../utils/Bem';

export interface ProfileRootProps extends PropsWithChildren {
  readonly className?: string;
}

export interface ProfileImageProps {
  readonly src: string;
  readonly alt: string;
}

export interface ProfileBodyProps extends PropsWithChildren {}

export interface ProfileHeadingProps extends PropsWithChildren {}

export interface ProfileSubheadingProps extends PropsWithChildren {}

const Root = forwardRef<HTMLDivElement, ProfileRootProps>(({ children, className }, ref) => {
  const baseClassName = Bem.block('tox-profile');
  const combinedClassName = Type.isNonNullable(className)
    ? `${baseClassName} ${className}`
    : baseClassName;

  return (
    <div ref={ref} className={combinedClassName}>
      {children}
    </div>
  );
});

const Image: FC<ProfileImageProps> = ({ src, alt }) => {
  return (
    <div className={Bem.element('tox-profile', 'image')}>
      <div className="tox-user-avatar">
        <img src={src} alt={alt} role="presentation" />
      </div>
    </div>
  );
};

const Body: FC<ProfileBodyProps> = ({ children }) => {
  return (
    <div className={Bem.element('tox-profile', 'body')}>
      {children}
    </div>
  );
};

const Heading: FC<ProfileHeadingProps> = ({ children }) => {
  return (
    <div className={Bem.element('tox-profile', 'heading')}>
      {children}
    </div>
  );
};

const Subheading: FC<ProfileSubheadingProps> = ({ children }) => {
  return (
    <div className={Bem.element('tox-profile', 'subheading')}>
      {children}
    </div>
  );
};

export {
  Root,
  Image,
  Body,
  Heading,
  Subheading
};
