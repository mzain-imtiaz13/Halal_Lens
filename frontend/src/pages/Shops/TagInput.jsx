// components/shops/TagInput.jsx
import React, { useState } from "react";

export default function TagInput({ value = [], onChange, placeholder }) {
  const [text, setText] = useState("");

  const addToken = (raw) => {
    const parts = String(raw || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!parts.length) return;
    const set = new Set([...(value || [])]);
    parts.forEach((p) => set.add(p));
    onChange(Array.from(set));
  };

  const addFromText = () => {
    if (!text.trim()) return;
    addToken(text);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab" || e.key === ",") {
      e.preventDefault();
      addFromText();
    }
    if (e.key === "Backspace" && !text && (value || []).length) {
      onChange(value.slice(0, -1));
    }
  };

  const remove = (i) =>
    onChange((value || []).filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-1">
      {(value || []).map((t, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700"
        >
          {t}
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-slate-500 hover:text-slate-700"
          >
            ×
          </button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[120px] border-0 bg-transparent px-1 py-1 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addFromText}
        placeholder={placeholder}
      />
    </div>
  );
}
