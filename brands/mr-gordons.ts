import { defineBrand } from "./types";

/*
 * Mr. Gordon’s English Academy — учебный центр. Адрес — из публичной карточки на картах.
 * Курсы, цены, расписание и преподаватели — примерные, замените на реальные.
 */

const ru = {
  app: {
    title: "Тест уровня",
    cta: "Пройти тест",
  },
};

// TODO: проверить носителем
const uz: typeof ru = {
  app: {
    title: "Darajani aniqlash testi",
    cta: "Testni boshlash",
  },
};

const en: typeof ru = {
  app: {
    title: "Level test",
    cta: "Take the test",
  },
};

export type MrGordonsCopy = typeof ru;

export default defineBrand<MrGordonsCopy>({
  slug: "mr-gordons",
  name: "Mr. Gordon’s",
  niche: { ru: "Английский язык", uz: "Ingliz tili", en: "English academy" },
  modules: ["levelTest", "booking", "leads", "bot", "reminders"],
  theme: {
    scheme: "light",
    color: {
      bg: "#F3F1EA",
      surface: "#FBFAF6",
      raised: "#FFFFFF",
      line: "#B9CBE3",
      ink: "#16244A",
      muted: "#4F5B78",
      accent: "#16244A",
      onAccent: "#F3F1EA",
      accentSoft: "#DCE4F0",
      signal: "#C8272A",
      onSignal: "#FFFFFF",
      mark: "#E2A523",
      focus: "#C8272A",
    },
    font: { display: "spectral", text: "commissioner", mono: "commissioner" },
    display: { weight: 800, tracking: "-0.02em", leading: 1.02, style: "normal" },
    text: { weight: 400, leading: 1.5, strong: 650 },
    radius: { s: "2px", m: "3px", l: "6px" },
    line: { hair: "1px", rule: "2px" },
    shadow: { card: "3px 3px 0 #16244A", pop: "6px 6px 0 #16244A" },
    motion: { ease: "cubic-bezier(0.5, 0, 0.1, 1)", easeOut: "cubic-bezier(0.2, 0.9, 0.1, 1)", fast: 140, base: 260, slow: 520 },
    icon: { stroke: 2 },
    texture: "ruled",
    swatches: [
      { name: { ru: "Тетрадь", uz: "Daftar", en: "Exercise book" }, hex: "#F3F1EA" },
      { name: { ru: "Линовка", uz: "Chiziqlar", en: "Ruling" }, hex: "#B9CBE3" },
      { name: { ru: "Тёмно-синий", uz: "Toʻq koʻk", en: "Navy" }, hex: "#16244A" },
      { name: { ru: "Красная ручка", uz: "Qizil ruchka", en: "Red pen" }, hex: "#C8272A" },
      { name: { ru: "Горчица", uz: "Xantal", en: "Mustard" }, hex: "#E2A523" },
    ],
  },
  pitch: {
    headline: {
      ru: "Ни одна заявка не остаётся без ответа.",
      uz: "Birorta ham ariza javobsiz qolmaydi.",
      en: "No enquiry goes unanswered.",
    },
    lede: {
      ru: "Тест уровня за две минуты, подбор курса и запись на пробный урок. Бот отвечает на заявку за 5 секунд, а о переносе занятия группа узнаёт одной кнопкой.",
      uz: "Ikki daqiqada darajani aniqlash testi, kurs tanlash va sinov darsiga yozilish. Bot arizaga 5 soniyada javob beradi, dars koʻchirilsa, guruh bir tugma bilan xabar oladi.",
      en: "A two-minute level test, a matching course and a trial lesson booking. The bot replies to an enquiry in 5 seconds, and one button tells the whole group about a reschedule.",
    },
  },
  branches: [
    {
      id: "afrosiyob",
      name: { ru: "Mr. Gordon’s", uz: "Mr. Gordon’s", en: "Mr. Gordon’s" },
      address: { ru: "ул. Афросиаб, 41", uz: "Afrosiyob koʻchasi, 41", en: "41 Afrosiyob St" },
      hours: "09:00–21:00",
    },
  ],
  services: [
    {
      id: "general",
      name: { ru: "General English", uz: "General English", en: "General English" },
      note: { ru: "3 раза в неделю, 90 мин", uz: "Haftasiga 3 marta, 90 daq", en: "3 times a week, 90 min" },
      price: 650000,
      duration: 90,
    },
    {
      id: "ielts",
      name: { ru: "IELTS Preparation", uz: "IELTS Preparation", en: "IELTS Preparation" },
      note: { ru: "3 раза в неделю, 120 мин", uz: "Haftasiga 3 marta, 120 daq", en: "3 times a week, 120 min" },
      price: 900000,
      duration: 120,
    },
    {
      id: "kids",
      name: { ru: "Kids English", uz: "Kids English", en: "Kids English" },
      note: { ru: "2 раза в неделю, 60 мин", uz: "Haftasiga 2 marta, 60 daq", en: "Twice a week, 60 min" },
      price: 500000,
      duration: 60,
    },
    {
      id: "speaking",
      name: { ru: "Speaking Club", uz: "Speaking Club", en: "Speaking Club" },
      note: { ru: "по субботам", uz: "shanba kunlari", en: "on Saturdays" },
      price: 300000,
      duration: 90,
    },
  ],
  staff: [
    {
      id: "walker",
      name: { ru: "Джеймс Уокер", uz: "Jeyms Uoker", en: "James Walker" },
      role: { ru: "IELTS, Speaking", uz: "IELTS, Speaking", en: "IELTS, Speaking" },
    },
    {
      id: "smirnova",
      name: { ru: "Анна Смирнова", uz: "Anna Smirnova", en: "Anna Smirnova" },
      role: { ru: "General English", uz: "General English", en: "General English" },
    },
    { id: "aliev", name: { ru: "Тимур Алиев", uz: "Temur Aliyev", en: "Timur Aliev" }, role: { ru: "Kids English", uz: "Kids English", en: "Kids English" } },
  ],
  effects: [
    {
      value: { ru: "5 с", uz: "5 son", en: "5 s" },
      label: { ru: "до первого ответа на заявку", uz: "arizaga birinchi javobgacha", en: "to the first reply to an enquiry" },
      basis: {
        ru: "бот отвечает сразу и предлагает тест уровня",
        uz: "bot darhol javob beradi va daraja testini taklif qiladi",
        en: "the bot replies at once and offers the level test",
      },
    },
    {
      value: "+30%",
      label: { ru: "заявок доходят до пробного урока", uz: "arizalar sinov darsigacha yetadi", en: "more enquiries reach a trial lesson" },
      basis: { ru: "тест → курс → запись в одном сценарии", uz: "test → kurs → yozilish bitta ssenariyda", en: "test → course → booking in one flow" },
    },
    {
      value: "1",
      label: {
        ru: "кнопка, чтобы предупредить группу о переносе",
        uz: "guruhni koʻchirish haqida ogohlantirish uchun tugma",
        en: "button to warn a group about a reschedule",
      },
      basis: {
        ru: "сообщение уходит всем ученикам в Telegram",
        uz: "xabar barcha oʻquvchilarga Telegramda boradi",
        en: "the message goes to every student in Telegram",
      },
    },
  ],
  copy: { ru, uz, en },
});
