import React from 'react';

import { classes } from '../../../utils/Styles';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return <div className={classes([ 'tox-ai__error-message' ])} role="alert" aria-live="polite">{message}</div>;
};

export default ErrorMessage;
