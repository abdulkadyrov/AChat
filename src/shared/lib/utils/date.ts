export function formatTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function relativePresence(status: "online" | "recently" | "offline") {
  if (status === "online") return "В сети";
  if (status === "recently") return "Был(а) недавно";
  return "Не в сети";
}
