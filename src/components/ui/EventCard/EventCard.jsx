import React from 'react';
import PropTypes from 'prop-types';
import { CardContainer, DateBadge, ContentWrapper, StatusBadge } from './EventCard.styles';

export const EventCard = ({ day, month, title, description, statusText, statusVariant, accentColor }) => {
  return (
    <CardContainer className="reveal">
      <DateBadge $accentColor={accentColor}>
        <div className="day">{day}</div>
        <div className="month">{month}</div>
      </DateBadge>
      
      <ContentWrapper>
        <h3>{title}</h3>
        <p>{description}</p>
      </ContentWrapper>

      <StatusBadge $variant={statusVariant}>
        {statusText}
      </StatusBadge>
    </CardContainer>
  );
};

EventCard.propTypes = {
  day: PropTypes.string.isRequired,
  month: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  statusText: PropTypes.string.isRequired,
  statusVariant: PropTypes.oneOf(['success', 'warning']),
  accentColor: PropTypes.string,
};