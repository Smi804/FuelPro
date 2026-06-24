import { useState } from 'react';

// Controlled-or-uncontrolled toggle switch matching the `.toggle` markup.
export default function Toggle({ defaultOn = false, on, onChange }) {
  const [internal, setInternal] = useState(defaultOn);
  const isOn = on !== undefined ? on : internal;

  const handle = () => {
    const next = !isOn;
    if (on === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <div
      className={'toggle' + (isOn ? ' on' : '')}
      role="switch"
      aria-checked={isOn}
      tabIndex={0}
      onClick={handle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handle();
        }
      }}
    />
  );
}
