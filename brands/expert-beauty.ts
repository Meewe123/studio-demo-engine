import { defineBrand } from "./types";

/*
 * Expert Beauty — салон красоты, два филиала. Адреса — из публичных карточек на картах.
 * Салон уже работает с онлайн-записью Sonline: демо — бот-администратор и напоминания
 * поверх неё, а не замена. Мастера, цены и окна — примерные.
 */

const ru = {
  app: {
    title: "Администратор",
    cta: "Записаться",
  },
};

// TODO: проверить носителем
const uz: typeof ru = {
  app: {
    title: "Administrator",
    cta: "Yozilish",
  },
};

const en: typeof ru = {
  app: {
    title: "Concierge",
    cta: "Book",
  },
};

export type ExpertBeautyCopy = typeof ru;

export default defineBrand<ExpertBeautyCopy>({
  slug: "expert-beauty",
  name: "Expert Beauty",
  niche: { ru: "Салон красоты", uz: "Goʻzallik saloni", en: "Beauty salon" },
  modules: ["bot", "booking", "reminders"],
  theme: {
    scheme: "light",
    color: {
      bg: "#F8F3EC",
      surface: "#F1E7DD",
      raised: "#FFFCF8",
      line: "#A8834E",
      ink: "#2A1B15",
      muted: "#6E5A50",
      accent: "#2A1B15",
      onAccent: "#F8F3EC",
      accentSoft: "#EBCFC8",
      signal: "#8E3B46",
      onSignal: "#FFF6F2",
      mark: "#EBCFC8",
      focus: "#8E3B46",
    },
    font: { display: "cormorant", text: "onest", mono: "onest" },
    display: { weight: 300, tracking: "-0.02em", leading: 0.92, style: "normal", min: 3 },
    text: { weight: 400, leading: 1.55, strong: 500 },
    radius: { s: "0px", m: "0px", l: "999px" },
    line: { hair: "1px", rule: "1px" },
    shadow: { card: "none", pop: "0 40px 80px -40px rgba(42, 27, 21, 0.35)" },
    motion: { ease: "cubic-bezier(0.65, 0, 0.35, 1)", easeOut: "cubic-bezier(0.16, 1, 0.3, 1)", fast: 240, base: 520, slow: 900 },
    icon: { stroke: 1.25 },
    texture: "gloss",
    swatches: [
      { name: { ru: "Слоновая кость", uz: "Fil suyagi", en: "Ivory" }, hex: "#F8F3EC" },
      { name: { ru: "Пудра", uz: "Upa", en: "Powder" }, hex: "#EBCFC8" },
      { name: { ru: "Эспрессо", uz: "Espresso", en: "Espresso" }, hex: "#2A1B15" },
      { name: { ru: "Золото", uz: "Oltin", en: "Gold" }, hex: "#A8834E" },
      { name: { ru: "Румянец", uz: "Qizgʻish", en: "Rouge" }, hex: "#8E3B46" },
    ],
  },
  pitch: {
    headline: {
      ru: "Ответ — сразу. Напоминание — само.",
      uz: "Javob — darhol. Eslatma — oʻzi.",
      en: "Answers right away. Reminders on their own.",
    },
    lede: {
      ru: "Бот-администратор отвечает в Instagram и Telegram за секунды, записывает через онлайн-запись, которой салон уже пользуется, и напоминает клиенту за день.",
      uz: "Bot-administrator Instagram va Telegramda soniyalar ichida javob beradi, salon allaqachon foydalanayotgan onlayn yozilish orqali yozadi va mijozga bir kun oldin eslatadi.",
      en: "A concierge bot answers in Instagram and Telegram within seconds, books through the online booking the salon already uses, and reminds clients a day ahead.",
    },
  },
  branches: [
    {
      id: "qahhor",
      name: { ru: "Абдуллы Каххара", uz: "Abdulla Qahhor", en: "Abdulla Qahhor" },
      address: { ru: "ул. Абдуллы Каххара, 24", uz: "Abdulla Qahhor koʻchasi, 24", en: "24 Abdulla Qahhor St" },
      hours: "09:00–21:00",
    },
    {
      id: "yunusabad",
      name: { ru: "Юнусабад", uz: "Yunusobod", en: "Yunusabad" },
      address: { ru: "Юнусабад, 10-й квартал, 1а", uz: "Yunusobod, 10-mavze, 1a", en: "1a, block 10, Yunusabad" },
      hours: "09:00–21:00",
    },
  ],
  services: [
    { id: "haircut", name: { ru: "Женская стрижка", uz: "Ayollar soch turmagi", en: "Women’s haircut" }, price: 250000, duration: 60 },
    { id: "color", name: { ru: "Окрашивание", uz: "Soch boʻyash", en: "Colouring" }, price: 600000, priceFrom: true, duration: 150 },
    { id: "manicure", name: { ru: "Маникюр с покрытием", uz: "Qoplamali manikyur", en: "Manicure with polish" }, price: 180000, duration: 90 },
    { id: "pedicure", name: { ru: "Педикюр", uz: "Pedikyur", en: "Pedicure" }, price: 220000, duration: 90 },
    { id: "brows", name: { ru: "Брови: форма и цвет", uz: "Qosh: shakl va rang", en: "Brows: shape and tint" }, price: 120000, duration: 45 },
    { id: "styling", name: { ru: "Укладка", uz: "Soch turmaklash", en: "Blow-dry & styling" }, price: 150000, duration: 45 },
  ],
  staff: [
    { id: "madina", name: { ru: "Мадина", uz: "Madina", en: "Madina" }, role: { ru: "колорист", uz: "kolorist", en: "colourist" }, branchId: "qahhor" },
    {
      id: "kamila",
      name: { ru: "Камила", uz: "Kamila", en: "Kamila" },
      role: { ru: "мастер маникюра", uz: "manikyur ustasi", en: "nail artist" },
      branchId: "qahhor",
    },
    { id: "sevara", name: { ru: "Севара", uz: "Sevara", en: "Sevara" }, role: { ru: "стилист", uz: "stilist", en: "stylist" }, branchId: "yunusabad" },
    { id: "alina", name: { ru: "Алина", uz: "Alina", en: "Alina" }, role: { ru: "бровист", uz: "qosh ustasi", en: "brow artist" }, branchId: "yunusabad" },
  ],
  effects: [
    {
      value: { ru: "3 с", uz: "3 son", en: "3 s" },
      label: { ru: "до ответа вместо ожидания в директе", uz: "direktda kutish oʻrniga javobgacha", en: "to an answer instead of waiting in DMs" },
      basis: {
        ru: "бот отвечает на прайс, окна и адреса сам",
        uz: "bot narx, boʻsh vaqt va manzillarga oʻzi javob beradi",
        en: "the bot answers prices, slots and addresses itself",
      },
    },
    {
      value: "−40%",
      label: { ru: "неявок", uz: "kelmay qolishlar", en: "no-shows" },
      basis: {
        ru: "напоминание за день с кнопкой «Подтвердить»",
        uz: "bir kun oldin “Tasdiqlash” tugmali eslatma",
        en: "a reminder a day ahead with a Confirm button",
      },
    },
    {
      value: "0",
      label: { ru: "путаницы между филиалами", uz: "filiallar orasidagi chalkashlik", en: "mix-ups between branches" },
      basis: {
        ru: "филиал выбирается первым и виден в каждом сообщении",
        uz: "filial birinchi tanlanadi va har bir xabarda koʻrinadi",
        en: "the branch is chosen first and shown in every message",
      },
    },
  ],
  copy: { ru, uz, en },
});
