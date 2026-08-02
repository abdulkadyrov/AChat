import type { MessageStatus } from "@/shared/types/domain";

const labels: Record<MessageStatus, string> = {
  queued: "В очереди",
  encrypting: "Шифруется",
  uploading: "Загружается",
  sending: "Отправляется",
  sent: "Отправлено",
  delivered: "Доставлено",
  read: "Прочитано",
  failed: "Ошибка отправки",
  deleted: "Сообщение удалено",
  expired: "Срок сообщения истёк"
};

export function getMessageStatusLabel(status: MessageStatus | undefined) {
  return status ? labels[status] : "Статус неизвестен";
}
