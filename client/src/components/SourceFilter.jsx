import React, { useState } from "react";

const SOURCES = [
  "Shazoo",
  "StopGame",
  "DTF",
  "Meduza",
  "Wowhead",
  "Standard",
  "УНИАН"
];

export default function SourceFilter({ value = [], onChange }) {
  // Если пропс `value` пустой, заполняем его всеми источниками один раз
  const [internalValue, setInternalValue] = useState(
    value.length ? value : [...SOURCES]
  );

  function toggle(src) {
    const newValue = internalValue.includes(src)
      ? internalValue.filter(s => s !== src)
      : [...internalValue, src];
    setInternalValue(newValue);
    onChange?.(newValue);
  }

  function setPolitics() {
    const newValue = ["Meduza", "УНИАН", "Standard"];
    setInternalValue(newValue);
    onChange?.(newValue);
  }

  function setGeek() {
    const newValue = ["Shazoo", "StopGame", "DTF", "Wowhead"];
    setInternalValue(newValue);
    onChange?.(newValue);
  }

  return (
    <div className="controls">
      <div className="controls-buttons">
        <button onClick={setPolitics}>Politics</button>
        <button onClick={setGeek}>Geek</button>
        <button onClick={() => {
          setInternalValue([...SOURCES]);
          onChange?.([...SOURCES]);
        }}>All</button>
      </div>
    </div>
  );
}