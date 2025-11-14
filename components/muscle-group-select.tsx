"use client";

import { useEffect, useMemo, useState } from "react";

import type { MuscleGroup } from "@/data/exercises";

interface MuscleGroupSelectProps {
  label?: string;
  helperText?: string;
  value?: string;
  onChange?: (groupId: string, group?: MuscleGroup) => void;
  disabled?: boolean;
}

interface FetchState {
  loading: boolean;
  error?: string;
}

export default function MuscleGroupSelect({
  label = "Група м’язів",
  helperText = "Оберіть основну групу м’язів для тренування.",
  value,
  onChange,
  disabled,
}: MuscleGroupSelectProps) {
  const [groups, setGroups] = useState<MuscleGroup[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(value);
  const [state, setState] = useState<FetchState>({ loading: true });

  useEffect(() => {
    setSelectedId(value);
  }, [value]);

  useEffect(() => {
    let isMounted = true;

    async function loadMuscleGroups() {
      setState({ loading: true });
      try {
        const response = await fetch("/api/muscle-groups");
        if (!response.ok) {
          throw new Error(`Не вдалося завантажити дані (${response.status}).`);
        }
        const payload: { muscleGroups: MuscleGroup[] } = await response.json();
        if (!isMounted) {
          return;
        }
        setGroups(payload.muscleGroups);
        setState({ loading: false });
      } catch (error) {
        console.error(error);
        if (!isMounted) {
          return;
        }
        setState({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Сталася невідома помилка під час завантаження м’язових груп.",
        });
      }
    }

    loadMuscleGroups();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!state.loading && groups.length > 0) {
      const nextId = value ?? selectedId ?? groups[0]!.id;
      if (!selectedId && nextId) {
        setSelectedId(nextId);
        const group = groups.find((item) => item.id === nextId);
        onChange?.(nextId, group);
      }
    }
  }, [state.loading, groups, selectedId, value, onChange]);

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedId),
    [groups, selectedId]
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-900">{label}</label>
        <select
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          value={selectedId ?? ""}
          onChange={(event) => {
            const nextId = event.target.value;
            setSelectedId(nextId);
            const group = groups.find((item) => item.id === nextId);
            onChange?.(nextId, group);
          }}
          disabled={disabled || state.loading || groups.length === 0}
        >
          {state.loading ? (
            <option value="">Завантаження…</option>
          ) : (
            groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))
          )}
        </select>
        {helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
        {state.error ? (
          <p className="text-xs text-rose-600">{state.error}</p>
        ) : null}
      </div>
      {selectedGroup ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            {selectedGroup.icon ? <span className="text-lg">{selectedGroup.icon}</span> : null}
            <span className="font-medium text-slate-900">{selectedGroup.name}</span>
          </div>
          <p className="mt-1 leading-relaxed">{selectedGroup.description}</p>
          {selectedGroup.focusTips?.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600">
              {selectedGroup.focusTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
