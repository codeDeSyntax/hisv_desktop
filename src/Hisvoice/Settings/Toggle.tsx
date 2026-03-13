import React from "react";

const Toggle: React.FC<{
  on: boolean;
  onChange: () => void;
  accentColor: string;
}> = ({ on, onChange, accentColor }) => (
  <button
    onClick={onChange}
    className="relative inline-flex h-5 w-10 items-center rounded-full transition-colors flex-shrink-0"
    style={{ backgroundColor: on ? accentColor : undefined }}
    data-off={on ? undefined : true}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        on ? "translate-x-5" : "translate-x-0.5"
      }`}
    />
  </button>
);

export default Toggle;
