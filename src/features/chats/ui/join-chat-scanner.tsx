interface JoinChatScannerProps {
  open: boolean;
  onClose: () => void;
}

// Legacy compatibility shim for older uploaded repos where this file still exists.
// The QR flow has been replaced by code-based access.
export function JoinChatScanner({ open, onClose }: JoinChatScannerProps) {
  if (open) {
    onClose();
  }

  return null;
}
