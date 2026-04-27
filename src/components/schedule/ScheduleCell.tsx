"use client";

import { useState } from "react";
import { OccurrenceType, ScheduleEntry } from "@/types";
import { DayType } from "@/types";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OccurrencePicker } from "./OccurrencePicker";

const dayBg: Record<DayType, string> = {
  sat: "bg-blue-50 border-blue-100",
  sun: "bg-red-50 border-red-100",
  holiday: "bg-amber-50 border-amber-100",
  normal: "bg-white border-gray-100",
};

interface ScheduleCellProps {
  entry?: ScheduleEntry | null;
  dayType: DayType;
  occurrenceTypes: OccurrenceType[];
  readonly?: boolean;
  employeeName: string;
  date: string;
  onSave: (occurrenceType: OccurrenceType | null) => Promise<void>;
}

export function ScheduleCell({
  entry,
  dayType,
  occurrenceTypes,
  readonly,
  employeeName,
  date,
  onSave,
}: ScheduleCellProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const occurrence = entry?.occurrenceType ?? null;

  async function handleSelect(type: OccurrenceType | null) {
    setSaving(true);
    try {
      await onSave(type);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  const cellStyle = occurrence
    ? { backgroundColor: occurrence.bgColor, borderColor: occurrence.color + "44" }
    : undefined;

  return (
    <>
      <td
        className={cn(
          "h-10 w-10 border-b border-r text-center align-middle",
          !occurrence && dayBg[dayType],
          readonly ? "cursor-default" : "cursor-pointer"
        )}
        style={occurrence ? cellStyle : undefined}
        onClick={() => !readonly && setOpen(true)}
        title={occurrence ? `${occurrence.label}` : "Dia trabalhado"}
      >
        {occurrence && (
          <span
            className="text-[11px] font-bold leading-none"
            style={{ color: occurrence.textColor }}
          >
            {occurrence.code}
          </span>
        )}
      </td>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Lançar ocorrência</DialogTitle>
            <p className="text-sm text-gray-500">
              <span className="font-medium">{employeeName}</span> — {date}
            </p>
          </DialogHeader>

          {saving ? (
            <div className="flex items-center justify-center py-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            </div>
          ) : (
            <OccurrencePicker
              occurrenceTypes={occurrenceTypes}
              current={occurrence}
              onSelect={handleSelect}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
