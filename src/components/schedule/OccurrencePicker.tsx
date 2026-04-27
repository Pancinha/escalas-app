"use client";

import { OccurrenceType } from "@/types";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface OccurrencePickerProps {
  occurrenceTypes: OccurrenceType[];
  current?: OccurrenceType | null;
  onSelect: (type: OccurrenceType | null) => void;
}

export function OccurrencePicker({ occurrenceTypes, current, onSelect }: OccurrencePickerProps) {
  return (
    <div className="flex flex-wrap gap-2 py-1">
      {occurrenceTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => onSelect(type)}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
            current?.id === type.id
              ? "ring-2 ring-offset-1 scale-105"
              : "hover:opacity-90 hover:scale-105"
          )}
          style={{
            backgroundColor: type.bgColor,
            color: type.textColor,
            borderColor: type.color + "66",
          }}
        >
          <span className="font-bold">{type.code}</span>
          <span className="opacity-75">{type.label}</span>
        </button>
      ))}

      {current && (
        <button
          onClick={() => onSelect(null)}
          className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
        >
          <X className="h-3 w-3" />
          Limpar
        </button>
      )}
    </div>
  );
}
