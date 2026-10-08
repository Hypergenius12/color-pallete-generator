import React, { useState, useRef } from 'react';
import {
  Lock,
  Unlock,
  X,
  Grid,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Pipette,
  ShieldCheck,
  Sliders
} from 'lucide-react';
import { ColorItem, DisplayFormat } from '../types';
import {
  formatColorValue,
  getReadableTextColor,
  getContrastRatio,
  getWcagRating,
  isValidHex,
  normalizeHex
} from '../utils/colorUtils';

interface PaletteColumnProps {
  color: ColorItem;
  displayHex: string; // The hex to display (may be simulated for color blindness)
  index: number;
  totalColors: number;
  format: DisplayFormat;
  onToggleLock: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (index: number, direction: 'left' | 'right') => void;
  onOpenShades: (color: ColorItem, index: number) => void;
  onOpenContrast: (color: ColorItem) => void;
  onUpdateHex: (id: string, newHex: string) => void;
  onInsertAfter?: (index: number) => void;
}

export const PaletteColumn: React.FC<PaletteColumnProps> = ({
  color,
  displayHex,
  index,
  totalColors,
  format,
  onToggleLock,
  onRemove,
  onMove,
  onOpenShades,
  onOpenContrast,
  onUpdateHex,
  onInsertAfter
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(color.hex);
  const [isHovered, setIsHovered] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const textColor = getReadableTextColor(displayHex);
  const isDarkText = textColor === '#000000';
  const contrastRatio = getContrastRatio(displayHex, textColor);
  const wcag = getWcagRating(contrastRatio);

  const formattedValue = formatColorValue(displayHex, format);

  const handleCopy = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(formattedValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const handleHexSubmit = () => {
    if (isValidHex(editValue)) {
      onUpdateHex(color.id, normalizeHex(editValue));
    } else {
      setEditValue(color.hex);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleHexSubmit();
    } else if (e.key === 'Escape') {
      setEditValue(color.hex);
      setIsEditing(false);
    }
  };

  return (
    <div
      className="relative flex-1 flex flex-col justify-between items-center transition-colors duration-250 min-h-[480px] md:min-h-full group select-none overflow-hidden"
      style={{ backgroundColor: displayHex }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Action Toolbar */}
      <div
        className={`w-full pt-4 md:pt-6 px-3 flex flex-col items-center gap-2 transition-all duration-200 z-10 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-80 md:opacity-0 md:-translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
        }`}
      >
        <div
          className="flex items-center gap-1.5 p-1 rounded-full backdrop-blur-md shadow-sm border"
          style={{
            backgroundColor: isDarkText ? 'rgba(255, 255, 255, 0.55)' : 'rgba(0, 0, 0, 0.35)',
            borderColor: isDarkText ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)',
            color: textColor
          }}
        >
          {/* Remove column button */}
          <button
            onClick={() => onRemove(color.id)}
            disabled={totalColors <= 2}
            title={totalColors <= 2 ? "Minimum 2 colors" : "Remove color (X)"}
            className={`p-2 rounded-full transition-transform active:scale-90 ${
              totalColors <= 2
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>

          {/* View shades ladder */}
          <button
            onClick={() => onOpenShades(color, index)}
            title="View shades & tints"
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-transform active:scale-90"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Move Left */}
          <button
            onClick={() => onMove(index, 'left')}
            disabled={index === 0}
            title="Move left"
            className={`p-2 rounded-full transition-transform active:scale-90 ${
              index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Move Right */}
          <button
            onClick={() => onMove(index, 'right')}
            disabled={index === totalColors - 1}
            title="Move right"
            className={`p-2 rounded-full transition-transform active:scale-90 ${
              index === totalColors - 1
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Contrast checker quick preview */}
          <button
            onClick={() => onOpenContrast(color)}
            title={`Contrast against text: ${contrastRatio}:1 (${wcag.badge})`}
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-transform active:scale-90 flex items-center gap-1"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Open Native Color Picker */}
          <button
            onClick={() => colorInputRef.current?.click()}
            title="Pick custom color"
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-transform active:scale-90 relative"
          >
            <Pipette className="w-4 h-4" />
            <input
              ref={colorInputRef}
              type="color"
              value={color.hex}
              onChange={(e) => onUpdateHex(color.id, normalizeHex(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none"
            />
          </button>
        </div>
      </div>

      {/* Lock Button (Iconic Coolors Middle Lock) */}
      <div className="z-10 flex flex-col items-center my-auto">
        <button
          onClick={() => onToggleLock(color.id)}
          title={color.locked ? "Unlock color" : "Lock color (stays on spacebar)"}
          className={`p-3.5 rounded-full backdrop-blur-md transition-all duration-200 transform active:scale-95 shadow-md flex items-center justify-center ${
            color.locked
              ? 'scale-110 ring-2'
              : 'opacity-70 md:opacity-30 group-hover:opacity-100 hover:scale-105'
          }`}
          style={{
            backgroundColor: isDarkText ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.4)',
            color: textColor,
            borderColor: textColor,
            // @ts-ignore
            '--tw-ring-color': textColor,
          }}
        >
          {color.locked ? (
            <Lock className="w-5 h-5 stroke-[2.5]" />
          ) : (
            <Unlock className="w-5 h-5 stroke-[2]" />
          )}
        </button>
        {color.locked && (
          <span
            className="text-[10px] uppercase font-bold tracking-widest mt-1.5 opacity-80"
            style={{ color: textColor }}
          >
            Locked
          </span>
        )}
      </div>

      {/* Bottom Color Code & Name Info */}
      <div
        className="w-full pb-8 md:pb-12 px-3 flex flex-col items-center text-center z-10"
        style={{ color: textColor }}
      >
        {/* Copied notification bubble */}
        {copied && (
          <div
            className="mb-2 py-1 px-3 text-xs font-semibold rounded-full shadow-lg flex items-center gap-1.5 animate-bounce"
            style={{
              backgroundColor: textColor,
              color: displayHex,
            }}
          >
            <Check className="w-3.5 h-3.5" />
            <span>COPIED!</span>
          </div>
        )}

        {/* Color Value (Hex or other format) */}
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleHexSubmit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-28 text-center text-lg md:text-xl font-mono font-bold py-1 px-2 rounded bg-black/20 backdrop-blur-sm border border-current outline-none"
              style={{ color: textColor }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <button
              onClick={handleCopy}
              onDoubleClick={() => {
                setEditValue(color.hex);
                setIsEditing(true);
              }}
              title="Click to copy, double click to edit"
              className="group/val flex items-center gap-1.5 font-mono text-xl md:text-2xl font-black tracking-wider uppercase hover:opacity-85 transition-opacity"
            >
              <span>{format === 'hex' ? displayHex.replace('#', '') : formattedValue}</span>
              <Copy className="w-3.5 h-3.5 opacity-0 group-hover/val:opacity-80 transition-opacity" />
            </button>
          </div>
        )}

        {/* Color Name */}
        <p className="text-xs md:text-sm font-semibold tracking-wide mt-1.5 opacity-85 max-w-[140px] truncate">
          {color.name}
        </p>

        {/* Quick Format & Contrast Mini Badge */}
        <div className="flex items-center gap-2 mt-2 opacity-70 hover:opacity-100 transition-opacity text-[11px] font-mono">
          <span className="uppercase">{format}</span>
          <span>•</span>
          <span className="font-semibold">{wcag.badge}</span>
        </div>
      </div>

      {/* Floating "+" Button Between Columns (Coolors signature hover separator) */}
      {onInsertAfter && index < totalColors - 1 && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onInsertAfter(index);
          }}
          title="Add harmonious color here (+)"
          className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full items-center justify-center cursor-pointer bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 shadow-lg border border-zinc-200 dark:border-zinc-750 opacity-0 hover:opacity-100 hover:scale-110 active:scale-95 transition-all duration-150 group-hover:opacity-40"
        >
          <span className="text-lg font-bold leading-none mb-0.5">+</span>
        </div>
      )}
    </div>
  );
};
