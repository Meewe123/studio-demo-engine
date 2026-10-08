import { defineBrand } from "./types";

/*
 * Darel — ветклиника. Адрес — из публичной карточки на картах.
 * Врачи, цены и расписание — примерные, замените на реальные.
 */

const ru = {
  app: {
    title: "Запись в клинику",
    cta: "Записаться",
  },
};

// TODO: проверить носителем
const uz: typeof ru = {
  app: {
    title: "Klinikaga yozilish",
    cta: "Yozilish",
  },
};

const en: typeof ru = {
  app: {
    title: "Book a visit",
    cta: "Book",
  },
};

export type DarelCopy = typeof ru;

export default defineBrand<DarelCopy>({
  slug: "darel",
  name: "Darel",
  niche: { ru: "Ветеринарная клиника", uz: "Veterinariya klinikasi", en: "Veterinary clinic" },
  modules: ["booking", "crm", "reminders", "bot"],
  theme: {
    scheme: "light",
    color: {
      bg: "#F4EEE3",
      surface: "#FBF7EF",
      raised: "#FFFDF8",
      line: "#DCD3C2",
      ink: "#2B2620",
      muted: "#6B6256",
      accent: "#1E3B2C",
      onAccent: "#F7F2E8",
      accentSoft: "#DFE5D7",
      signal: "#A84B2A",
      onSignal: "#FFF8EE",
      mark: "#6F8466",
      focus: "#A84B2A",
    },
    font: { display: "literata", text: "ysabeauOffice", mono: "ysabeauOffice" },
    display: { weight: 500, tracking: "-0.015em", leading: 1.06, style: "normal", variation: '"opsz" 72' },
    text: { weight: 450, leading: 1.55, strong: 650 },
    radius: { s: "10px", m: "18px", l: "28px" },
    line: { hair: "1px", rule: "1.5px" },
    shadow: {
      card: "0 1px 0 rgba(30, 59, 44, 0.06), 0 14px 32px -14px rgba(30, 59, 44, 0.22)",
      pop: "0 2px 0 rgba(30, 59, 44, 0.05), 0 30px 60px -20px rgba(30, 59, 44, 0.32)",
    },
    motion: { ease: "cubic-bezier(0.3, 0.7, 0.2, 1)", easeOut: "cubic-bezier(0.25, 0.9, 0.3, 1)", fast: 180, base: 320, slow: 620 },
    icon: { stroke: 1.75 },
    texture: "paper-grain",
    swatches: [
      { name: { ru: "Бумага", uz: "Qogʻoz", en: "Paper" }, hex: "#F4EEE3" },
      { name: { ru: "Лес", uz: "Oʻrmon", en: "Forest" }, hex: "#1E3B2C" },
      { name: { ru: "Мох", uz: "Mox", en: "Moss" }, hex: "#6F8466" },
      { name: { ru: "Терракота", uz: "Terrakota", en: "Terracotta" }, hex: "#A84B2A" },
      { name: { ru: "Чернила", uz: "Siyoh", en: "Ink" }, hex: "#2B2620" },
    ],
  },
  pitch: {
    headline: {
      ru: "Записаться — 30 секунд. Дозваниваться больше не нужно.",
      uz: "Yozilish — 30 soniya. Endi qoʻngʻiroq qilib ovora boʻlish shart emas.",
      en: "Booking takes 30 seconds. No more calling around.",
    },
    lede: {
      ru: "Запись к врачу в три шага, паспорт питомца с прививками и напоминания в Telegram. Ответы на частые вопросы — ещё до звонка.",
      uz: "Shifokorga uch qadamda yozilish, emlashlar bilan uy hayvoni pasporti va Telegramda eslatmalar. Koʻp beriladigan savollarga javob — qoʻngʻiroqdan oldin.",
      en: "Three-step booking, a pet passport with vaccinations and reminders in Telegram. Answers to common questions before anyone has to call.",
    },
  },
  branches: [
    {
      id: "nasaf",
      name: { ru: "Darel", uz: "Darel", en: "Darel" },
      address: {
        ru: "ул. Насаф, 1/1, Яшнабадский район",
        uz: "Nasaf koʻchasi, 1/1, Yashnobod tumani",
        en: "1/1 Nasaf St, Yashnabad district",
      },
      capacity: 3,
      hours: "09:00–20:00",
    },
  ],
  services: [
    { id: "consult", name: { ru: "Приём терапевта", uz: "Terapevt qabuli", en: "General check-up" }, price: 150000, duration: 30 },
    { id: "vaccine", name: { ru: "Комплексная прививка", uz: "Kompleks emlash", en: "Combined vaccination" }, price: 250000, duration: 20 },
    { id: "chip", name: { ru: "Чипирование", uz: "Chip oʻrnatish", en: "Microchipping" }, price: 200000, duration: 15 },
    { id: "ultrasound", name: { ru: "УЗИ", uz: "UTT", en: "Ultrasound" }, price: 200000, duration: 30 },
    { id: "grooming", name: { ru: "Стрижка когтей", uz: "Tirnoq olish", en: "Nail trim" }, price: 50000, duration: 15 },
  ],
  staff: [
    {
      id: "karimova",
      name: { ru: "Нодира Каримова", uz: "Nodira Karimova", en: "Nodira Karimova" },
      role: { ru: "терапевт", uz: "terapevt", en: "general vet" },
    },
    { id: "rakhimov", name: { ru: "Азиз Рахимов", uz: "Aziz Rahimov", en: "Aziz Rakhimov" }, role: { ru: "хирург", uz: "jarroh", en: "surgeon" } },
    { id: "kim", name: { ru: "Елена Ким", uz: "Yelena Kim", en: "Elena Kim" }, role: { ru: "дерматолог", uz: "dermatolog", en: "dermatologist" } },
  ],
  effects: [
    {
      value: { ru: "30 с", uz: "30 son", en: "30 s" },
      label: { ru: "на запись вместо дозвона", uz: "qoʻngʻiroq oʻrniga yozilishga", en: "to book instead of calling" },
      basis: { ru: "три шага в Telegram или на сайте", uz: "Telegramda yoki saytda uch qadam", en: "three steps in Telegram or on the site" },
    },
    {
      value: "−60%",
      label: { ru: "звонков с вопросами", uz: "savol bilan qoʻngʻiroqlar", en: "question calls" },
      basis: {
        ru: "цены, часы и подготовка к приёму — в ответах бота",
        uz: "narxlar, ish vaqti va tayyorgarlik — bot javoblarida",
        en: "prices, hours and visit prep are in the bot’s answers",
      },
    },
    {
      value: "+25%",
      label: { ru: "повторных прививок вовремя", uz: "oʻz vaqtida takroriy emlash", en: "booster shots on time" },
      basis: {
        ru: "напоминание за 5 дней с записью в одно касание",
        uz: "5 kun oldin eslatma va bir bosishda yozilish",
        en: "a reminder 5 days ahead with one-tap booking",
      },
    },
  ],
  copy: { ru, uz, en },
});
