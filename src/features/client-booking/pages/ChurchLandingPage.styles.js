import styled from 'styled-components';

export const PageWrapper = styled.div`
  padding-top: 4rem;
`;

export const HeroSection = styled.section`
  background: linear-gradient(135deg, #3b82f6, #0d9488);
  color: #ffffff;
  padding: clamp(3rem, 6vw, 5rem) 1rem;
  text-align: center;

  h1 {
    color: #ffffff;
    font-size: clamp(2rem, 4vw, 3.25rem);
    margin-bottom: 1rem;

    span {
      color: #a7f3d0;
    }
  }

  p {
    color: rgba(255, 255, 255, 0.85);
    max-width: 540px;
    margin: 1rem auto 2rem;
    font-size: 1.0625rem;
  }
`;

export const Section = styled.section`
  padding: 4rem 1rem;
  background-color: ${({ $bgSoft, theme }) =>
    $bgSoft ? theme.colors?.bgSoft || '#f9fafb' : 'transparent'};
`;

export const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;

  h2 {
    font-size: 1.875rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors?.text || '#111827'};
    margin-bottom: 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.colors?.textMuted || '#6b7280'};
  }
`;

export const EventsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 900px;
  margin: 0 auto;
`;

export const SchedulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
`;

export const CTAContainer = styled.div`
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
`;