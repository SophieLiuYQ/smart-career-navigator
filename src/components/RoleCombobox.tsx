"use client";

import React, { useState, useRef, useEffect } from "react";

interface RoleComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}

export default function RoleCombobox({ value, onChange, options, placeholder }: RoleComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Commit: pick best match or use raw query
  const commit = () => {
    if (!query) return;
    // If there's an exact or single match, use it
    const exact = options.find((o) => o.toLowerCase() === query.toLowerCase());
    if (exact) {
      onChange(exact);
    } else if (filtered.length === 1) {
      onChange(filtered[0]);
    } else {
      // Use whatever the user typed — allow free-form input
      onChange(query);
    }
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        commit();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  });

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        className="role-select"
        placeholder={placeholder}
        value={open ? query : value}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (!e.target.value) onChange("");
        }}
        onFocus={() => {
          setOpen(true);
          setQuery(value || "");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-lg border"
          style={{ background: "#1a1d2e", borderColor: "rgba(255,255,255,0.1)" }}>
          {filtered.map((option) => (
            <button
              key={option}
              className="w-full text-left px-3 py-2 text-[15px] text-gray-300 hover:text-white transition-colors"
              style={{ background: option === value ? "rgba(124,58,237,0.15)" : "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = option === value ? "rgba(124,58,237,0.15)" : "transparent")}
              onClick={() => {
                onChange(option);
                setQuery("");
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
