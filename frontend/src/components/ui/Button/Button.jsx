import React from 'react';

import { StyledButton } from './Button.styles';

export const Button = ({ children, variant = 'primary', size = 'md', onClick, className }) => {
  return (
    <StyledButton $variant={variant} $size={size} onClick={onClick} className={className}>
      {children}
    </StyledButton>
  );
};