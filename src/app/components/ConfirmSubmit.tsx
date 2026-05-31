"use client";

import type { ReactNode } from "react";

/**
 * 送出前先跳出確認對話框的表單按鈕。
 * 用於刪除等不可復原的操作；按「取消」則不送出（不執行 server action）。
 */
export function ConfirmSubmit({
  action,
  hidden,
  confirmText,
  className,
  title,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden: Record<string, string | number>;
  confirmText: string;
  className?: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) {
          e.preventDefault();
        }
      }}
    >
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button type="submit" className={className} title={title}>
        {children}
      </button>
    </form>
  );
}
