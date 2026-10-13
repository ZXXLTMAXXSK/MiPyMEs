import styled from 'styled-components';

export const Card = styled.div`
  text-align: center;
  padding: 1.75rem 1.25rem;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors?.surface || '#ffffff'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#f3f4f6'};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

  h4 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.text || '#1f2937'};
  }
`;

export const TimeText = styled.p`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ $accentColor }) => $accentColor || '#0d9488'};
  margin: 0.5rem 0;
`;

export const SubTitle = styled.p`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors?.textMuted || '#6b7280'};
  margin: 0;
`;