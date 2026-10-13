import styled from 'styled-components';

export const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: ${({ $size }) => ($size === 'lg' ? '1rem 2rem' : $size === 'sm' ? '0.5rem 1rem' : '0.75rem 1.5rem')};
  font-size: ${({ $size }) => ($size === 'lg' ? '1rem' : $size === 'sm' ? '0.875rem' : '0.9375rem')};
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;

  ${({ $variant }) =>
    $variant === 'secondary'
      ? `
        background-color: #ffffff;
        color: #0d9488;
        &:hover { background-color: #f3f4f6; }
      `
      : `
        background: linear-gradient(135deg, #0d9488, #14b8a6);
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(13, 148, 136, 0.3);
        &:hover { opacity: 0.9; transform: translateY(-1px); }
      `}
`;