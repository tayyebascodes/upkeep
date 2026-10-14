"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  /** "input" matches form fields; "pill" is a compact rounded trigger. */
  variant?: "input" | "pill";
  /** Extra classes for the trigger (e.g. colors for status pills). */
  className?: string;
  id?: string;
  "aria-label"?: string;
}

const MENU_GAP = 6;
const MENU_MAX_HEIGHT = 280;

export function Select<T extends string>({
  value,
  onChange,
  options,
  variant = "input",
  className = "",
  id,
  "aria-label": ariaLabel,
}: SelectProps<T>) {
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number; minWidth: number; flip: boolean } | null>(null);

  const selected = options.find((o) => o.value === value);

  // Fixed positioning in a portal, so menus inside scrolling tables aren't clipped.
  const place = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const flip = window.innerHeight - rect.bottom < MENU_MAX_HEIGHT && rect.top > window.innerHeight - rect.bottom;
    setPos({
      top: flip ? rect.top - MENU_GAP : rect.bottom + MENU_GAP,
      left: Math.min(rect.left, window.innerWidth - Math.max(rect.width, 160) - 8),
      minWidth: rect.width,
      flip,
    });
  }, []);

  const openMenu = () => {
    place();
    setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const close = (focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  };

  const choose = (index: number) => {
    const opt = options[index];
    if (opt && opt.value !== value) onChange(opt.value);
    close();
  };

  useLayoutEffect(() => {
    if (!open) return;
    place();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !menuRef.current?.contains(t)) close(false);
    };
    const onScroll = (e: Event) => {
      if (!menuRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  useEffect(() => {
    if (open) menuRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openMenu();
    }
  };

  const onMenuKey = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        close(false);
        break;
    }
  };

  const triggerBase =
    variant === "pill"
      ? "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium ring-1 ring-inset transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      : "input flex items-center justify-between gap-2 text-left";

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onTriggerKey}
        className={`${triggerBase} ${open && variant === "input" ? "border-brand-500 ring-4 ring-brand-500/10" : ""} ${className}`}
      >
        <span className="truncate">{selected?.label ?? "Select"}</span>
        <ChevronDown
          className={`flex-shrink-0 transition-transform ${variant === "pill" ? "h-3 w-3" : "h-4 w-4 text-ink-subtle"} ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open &&
        pos &&
        createPortal(
          <ul
            ref={menuRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={`${listId}-${activeIndex}`}
            onKeyDown={onMenuKey}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              minWidth: Math.max(pos.minWidth, 160),
              maxHeight: MENU_MAX_HEIGHT,
              transform: pos.flip ? "translateY(-100%)" : undefined,
            }}
            className="z-[60] overflow-y-auto rounded-xl border border-line bg-white p-1 shadow-lift outline-none animate-pop-in"
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              return (
                <li
                  key={opt.value}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => choose(i)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    i === activeIndex ? "bg-brand-50 text-brand-800" : "text-ink"
                  } ${isSelected ? "font-medium" : ""}`}
                >
                  <span className="whitespace-nowrap">{opt.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-brand-600" />}
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </>
  );
}
