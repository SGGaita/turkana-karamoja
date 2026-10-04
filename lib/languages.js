export const HUB_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'tu', name: 'Turkana', nativeName: "Ng'aturkana" },
  { code: 'pk', name: 'Pokot', nativeName: 'Pokoot' },
  { code: 'ng', name: 'Ngakaramojong', nativeName: "Nga'Karamojong" },
];

export function getLanguageLabel(code) {
  const lang = HUB_LANGUAGES.find((l) => l.code === code);
  return lang?.nativeName || lang?.name || code || 'English';
}
