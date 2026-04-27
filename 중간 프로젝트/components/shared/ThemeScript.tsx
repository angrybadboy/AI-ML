/**
 * 테마 FOUC 방지 — body 페인트 전에 localStorage에서 읽어 data-theme 설정.
 * `next-themes` 같은 라이브러리 대신 손으로 작성 (디자인 핸드오프 §5.2).
 */
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('gg-theme');
    var theme = stored === 'dark' || stored === 'light'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
