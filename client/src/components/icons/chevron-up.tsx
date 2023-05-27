import React from 'react';

const ChevronUp = ({ ...props }) => {
  return (
    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M0.625492 6.39069L6.60599 0.56094C6.71104 0.45855 6.85193 0.401245 6.99862 0.401245C7.14531 0.401245 7.2862 0.45855 7.39124 0.56094L13.374 6.39069C13.423 6.43839 13.4619 6.49541 13.4885 6.5584C13.5151 6.62139 13.5288 6.68907 13.5288 6.75744C13.5288 6.82581 13.5151 6.89349 13.4885 6.95648C13.4619 7.01947 13.423 7.0765 13.374 7.12419C13.2735 7.22232 13.1387 7.27725 12.9982 7.27725C12.8578 7.27725 12.723 7.22232 12.6225 7.12419L6.99862 1.64207L1.37587 7.12419C1.27546 7.22198 1.14084 7.2767 1.00068 7.2767C0.860521 7.2767 0.725901 7.22198 0.625492 7.12419C0.576506 7.0765 0.537571 7.01947 0.510985 6.95648C0.4844 6.89349 0.470703 6.82581 0.470703 6.75744C0.470703 6.68907 0.4844 6.62139 0.510985 6.5584C0.537571 6.49541 0.576506 6.43839 0.625492 6.39069Z"
      fill="currentColor"
    />
  </svg>
  );
};

export default ChevronUp;
