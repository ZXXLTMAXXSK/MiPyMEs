import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '../../../components/ui/EventCard/EventCard';
import { ServiceCard } from '../../../components/ui/ServiceCard/ServiceCard';
import { Button } from '../../../components/ui/Button/Button';
import { useGSAPAnimation } from '../../../hooks/useGSAPAnimation';
import { churchService } from '../services/churchService';
import {
  PageWrapper,
  HeroSection,
  Section,
  SectionHeader,
  EventsGrid,
  SchedulesGrid,
  CTAContainer
} from './ChurchLandingPage.styles';

export const ChurchLandingPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // Integración de animación de entrada con Hook GSAP
  useGSAPAnimation('.reveal');

  useEffect(() => {
    const fetchData = async () => {
      const [eventsData, schedulesData] = await Promise.all([
        churchService.getUpcomingEvents('comunidad-vida'),
        churchService.getServiceSchedules('comunidad-vida')
      ]);
      setEvents(eventsData);
      setSchedules(schedulesData);
    };

    fetchData();
  }, []);

  const handleBookingRedirect = () => {
    navigate('/reservas');
  };

  return (
    <PageWrapper>
      {/* Hero */}
      <HeroSection>
        <h1 className="reveal">
          Un lugar para<br />
          <span>encontrar comunidad.</span>
        </h1>
        <p className="reveal">
          Cultos, actividades, grupos pequeños y eventos especiales. Reserva tu lugar y sé parte de nuestra comunidad.
        </p>
        <Button
          variant="secondary"
          size="lg"
          className="reveal"
          onClick={handleBookingRedirect}
        >
          Reservar mi lugar
        </Button>
      </HeroSection>

      {/* Próximos Eventos */}
      <Section id="eventos">
        <SectionHeader className="reveal">
          <h2>Próximos eventos</h2>
          <p>Reserva tu asistencia y acompáñanos.</p>
        </SectionHeader>

        <EventsGrid>
          {events.map((evt) => (
            <EventCard
              key={evt.id}
              day={evt.day}
              month={evt.month}
              title={evt.title}
              description={evt.description}
              statusText={evt.statusText}
              statusVariant={evt.statusVariant}
              accentColor={evt.accentColor}
            />
          ))}
        </EventsGrid>
      </Section>

      {/* Horarios de Servicios */}
      <Section id="horarios" $bgSoft>
        <SectionHeader className="reveal">
          <h2>Horarios de servicios</h2>
        </SectionHeader>

        <SchedulesGrid>
          {schedules.map((item) => (
            <ServiceCard
              key={item.id}
              day={item.day}
              hours={item.hours}
              description={item.description}
              accentColor={item.accentColor}
            />
          ))}
        </SchedulesGrid>
      </Section>

      {/* CTA Comunidad */}
      <Section id="comunidad">
        <CTAContainer className="reveal">
          <h2>Sé parte de la comunidad</h2>
          <p>Reserva tu lugar en nuestros próximos encuentros. Todos son bienvenidos.</p>
          <Button
            variant="primary"
            size="lg"
            onClick={handleBookingRedirect}
          >
            Inscribirme
          </Button>
        </CTAContainer>
      </Section>
    </PageWrapper>
  );
};