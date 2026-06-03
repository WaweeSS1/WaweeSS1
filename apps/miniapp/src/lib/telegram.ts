declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: { id: number; first_name: string; username?: string };
    start_param?: string;
  };
  colorScheme: "light" | "dark";
  viewportHeight: number;
  viewportStableHeight: number;
  isExpanded: boolean;
  expand(): void;
  close(): void;
  ready(): void;
  enableClosingConfirmation(): void;
  MainButton: {
    text: string;
    color: string;
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(fn: () => void): void;
  };
}

export function getTelegramWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null;
}

export function initTelegramApp(): void {
  const twa = getTelegramWebApp();
  if (!twa) return;
  twa.ready();
  twa.expand();
  twa.enableClosingConfirmation();
}

export function getCurrentUser() {
  return window.Telegram?.WebApp?.initDataUnsafe?.user ?? null;
}

export function getStartParam(): string | undefined {
  return window.Telegram?.WebApp?.initDataUnsafe?.start_param;
}
