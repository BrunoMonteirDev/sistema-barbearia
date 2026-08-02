import { HorariosPorDia, WeekdayKey } from "./funcionarios.types";

export const diasSemana: { key: WeekdayKey; label: string }[] = [
  { key: "segunda", label: "Segunda" },
  { key: "terca", label: "Terça" },
  { key: "quarta", label: "Quarta" },
  { key: "quinta", label: "Quinta" },
  { key: "sexta", label: "Sexta" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

export function criarHorariosVazio(): HorariosPorDia {
  return {
    segunda: [],
    terca: [],
    quarta: [],
    quinta: [],
    sexta: [],
    sabado: [],
    domingo: [],
  };
}

export function normalizarHorarios(raw: unknown): HorariosPorDia {
  const base = criarHorariosVazio();
  if (!raw || typeof raw !== "object") return base;

  const result = { ...base };
  const horariosRecebidos = raw as Record<string, unknown>;

  (Object.keys(base) as WeekdayKey[]).forEach((dia) => {
    if (Array.isArray(horariosRecebidos[dia])) {
      result[dia] = horariosRecebidos[dia].filter(
        (horario): horario is string => typeof horario === "string",
      );
    }
  });

  return result;
}

export const ALL_SLOTS: string[] = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? 0 : 30;
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return `${hh}:${mm}`;
});
