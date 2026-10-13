import styled from 'styled-components';

export const CardContainer = styled.article`
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
  padding: 1.5rem;
  border-radius: ${({ theme }) => theme.radii?.lg || '12px'};
  background-color: ${({ theme, $bgColor }) => $bgColor || theme.colors?.surface || '#ffffff'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  }
`;

export const DateBadge = styled.div`
  text-align: center;
  min-width: 60px;
  padding: 0.5rem;
  border-radius: 8px;
  background-color: rgba(13, 148, 136, 0.08);

  .day {
    font-size: 1.5rem;
    font-weight: 800;
    color: ${({ $accentColor }) => $accentColor || '#0d9488'};
    line-height: 1;
  }

  .month {
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.textMuted || '#6b7280'};
    margin-top: 0.25rem;
  }
`;

export const ContentWrapper = styled.div`
  flex: 1;
  min-width: 200px;

  h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.125rem;
    color: ${({ theme }) => theme.colors?.text || '#111827'};
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors?.textMuted || '#6b7280'};
  }
`;

export const StatusBadge = styled.span`
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  
  background-color: ${({ $variant }) =>
    $variant === 'warning' ? '#fef3c7' : '#d1fae5'};
  color: ${({ $variant }) =>
    $variant === 'warning' ? '#b45309' : '#047857'};
`;