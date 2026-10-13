import React from 'react';
import PropTypes from 'prop-types';
import { Card, TimeText, SubTitle } from './ServiceCard.styles';

export const ServiceCard = ({ day, hours, description, accentColor }) => {
  return (
    <Card className="reveal">
      <h4>{day}</h4>
      <TimeText $accentColor={accentColor}>{hours}</TimeText>
      <SubTitle>{description}</SubTitle>
    </Card>
  );
};

ServiceCard.propTypes = {
  day: PropTypes.string.isRequired,
  hours: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  accentColor: PropTypes.string,
};