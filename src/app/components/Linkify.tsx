import { Fragment, type ReactNode } from "react";

// 網址允許的字元（限 ASCII，遇到中文或全形標點就自動停止，不會把後面的字吞進連結）
const URL_CHARS = "[A-Za-z0-9\\-._~:/?#\\[\\]@!$&'()*+,;=%]";
// 比對 http(s):// 開頭，或 www. 開頭的網址
const URL_PATTERN = `(https?://${URL_CHARS}+|www\\.${URL_CHARS}+)`;
// 網址後面常見的中英文標點，不應算進連結裡
const TRAILING_PUNCT = /[)\]）」』、。，,.！!？?；;：:]+$/;

/**
 * 將純文字中的網址轉成可點擊的連結（其餘文字原樣保留）。
 * 用於備註欄：貼 IG 或任何網址都能一鍵開啟。
 */
export function Linkify({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const re = new RegExp(URL_PATTERN, "g");
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    const raw = m[0];
    const start = m.index;

    if (start > lastIndex) {
      parts.push(<Fragment key={key++}>{text.slice(lastIndex, start)}</Fragment>);
    }

    // 把結尾的標點切出來，避免被包進連結
    let url = raw;
    let trailing = "";
    const trail = TRAILING_PUNCT.exec(url);
    if (trail) {
      trailing = trail[0];
      url = url.slice(0, url.length - trailing.length);
    }

    const href = url.startsWith("www.") ? `https://${url}` : url;
    parts.push(
      <a
        key={key++}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-brand-600 underline underline-offset-2 hover:text-brand-700"
      >
        {url}
      </a>
    );
    if (trailing) parts.push(<Fragment key={key++}>{trailing}</Fragment>);

    lastIndex = start + raw.length;
  }

  if (lastIndex < text.length) {
    parts.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>);
  }

  return <p className={className}>{parts}</p>;
}
