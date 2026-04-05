import React from 'react';

// Letter-by-letter typing effect component
const TypewriterText = ({ text }) => {
  return (
    <span className="inline-block whitespace-pre">
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="inline-block opacity-0 animate-typewriter-letter"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

export default TypewriterText;
