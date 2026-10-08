import { defineBrand } from "./types";

/*
 * Doctor Vet — ветклиника. Адрес — из публичной карточки на картах.
 * Врачи, цены и расписание — примерные, замените на реальные.
 */

const ru = {
  app: {
    title: "Электронная очередь",
    cta: "Встать в очередь",
  },
};

// TODO: проверить носителем
const uz: typeof ru = {
  app: {
    title: "Elektron navbat",
    cta: "Navbatga turish",
  },
};

const en: typeof ru = {
  app: {
    title: "Digital queue",
    cta: "Join the queue",
  },
};

export type DoctorVetCopy = typeof ru;

export default defineBrand<DoctorVetCopy>({
  slug: "doctor-vet",
  name: "Doctor Vet",
  niche: { ru: "Ветеринарная клиника", uz: "Veterinariya klinikasi", en: "Veterinary clinic" },
  modules: ["queue", "crm", "bot"],
  theme: {
    scheme: "light",
    color: {
      bg: "#FFFFFF",
      surface: "#F4F8F6",
      raised: "#FFFFFF",
      line: "#D3DDD8",
      ink: "#1C2326",
      muted: "#56636A",
      accent: "#1C6E55",
      onAccent: "#FFFFFF",
      accentSoft: "#E6EFEA",
      signal: "#D23C2A",
      onSignal: "#FFFFFF",
      mark: "#DCEBE3",
      focus: "#1C6E55",
    },
    font: { display: "plexSans", text: "plexSans", mono: "plexMono" },
    display: { weight: 300, tracking: "-0.035em", leading: 1, style: "normal" },
    text: { weight: 400, leading: 1.5, strong: 600 },
    radius: { s: "3px", m: "4px", l: "6px" },
    line: { hair: "1px", rule: "1px" },
    shadow: { card: "none", pop: "0 0 0 1px #D3DDD8, 0 24px 48px -24px rgba(28, 35, 38, 0.25)" },
    motion: { ease: "cubic-bezier(0.2, 0, 0, 1)", easeOut: "cubic-bezier(0.2, 0, 0, 1)", fast: 120, base: 180, slow: 260 },
    icon: { stroke: 1.5 },
    texture: "clinical-grid",
    swatches: [
      { name: { ru: "Белый", uz: "Oq", en: "White" }, hex: "#FFFFFF" },
      { name: { ru: "Шалфей", uz: "Shalfey", en: "Sage" }, hex: "#E6EFEA" },
      { name: { ru: "Мята", uz: "Yalpiz", en: "Mint ink" }, hex: "#1C6E55" },
      { name: { ru: "Графит", uz: "Grafit", en: "Graphite" }, hex: "#1C2326" },
      { name: { ru: "Линия", uz: "Chiziq", en: "Rule" }, hex: "#D3DDD8" },
      { name: { ru: "Срочно", uz: "Shoshilinch", en: "Urgent" }, hex: "#D23C2A" },
    ],
  },
  pitch: {
    headline: {
      ru: "Видно очередь. Видно цену. Видно каждую оплату.",
      uz: "Navbat koʻrinadi. Narx koʻrinadi. Har bir toʻlov koʻrinadi.",
      en: "See the queue. See the price. See every payment.",
    },
    lede: {
      ru: "Электронная очередь с номером в телефоне, открытый прайс без звонка и касса, где каждая оплата сразу превращается в чек.",
      uz: "Telefonda raqamli elektron navbat, qoʻngʻiroqsiz ochiq narxlar va har bir toʻlov darhol chekka aylanadigan kassa.",
      en: "A digital queue with your number on the phone, open prices without a call, and a till where every payment becomes a receipt.",
    },
  },
  branches: [
    {
      id: "aviasozlar",
      name: { ru: "Doctor Vet", uz: "Doctor Vet", en: "Doctor Vet" },
      address: {
        ru: "Городок Авиастроителей, 2-й квартал, 56А, Яшнабадский район",
        uz: "Aviasozlar shaharchasi, 2-mavze, 56A, Yashnobod tumani",
        en: "56A, block 2, Aviasozlar town, Yashnabad district",
      },
      capacity: 2,
      hours: "09:00–21:00",
    },
  ],
  services: [
    { id: "consult", name: { ru: "Приём терапевта", uz: "Terapevt qabuli", en: "General check-up" }, price: 120000, duration: 20 },
    { id: "vaccine", name: { ru: "Вакцинация", uz: "Emlash", en: "Vaccination" }, price: 180000, duration: 15 },
    { id: "ultrasound", name: { ru: "УЗИ брюшной полости", uz: "Qorin boʻshligʻi UTT", en: "Abdominal ultrasound" }, price: 220000, duration: 25 },
    { id: "blood", name: { ru: "Анализ крови", uz: "Qon tahlili", en: "Blood test" }, price: 150000, duration: 10 },
    { id: "castration", name: { ru: "Кастрация кота", uz: "Mushukni bichish", en: "Cat neutering" }, price: 450000, duration: 60 },
    { id: "parasites", name: { ru: "Обработка от паразитов", uz: "Parazitlarga qarshi ishlov", en: "Parasite treatment" }, price: 60000, duration: 10 },
  ],
  staff: [
    {
      id: "yuldashev",
      name: { ru: "Шахзод Юлдашев", uz: "Shahzod Yoʻldoshev", en: "Shakhzod Yuldashev" },
      role: { ru: "терапевт", uz: "terapevt", en: "general vet" },
    },
    { id: "akhmedova", name: { ru: "Дилноза Ахмедова", uz: "Dilnoza Ahmedova", en: "Dilnoza Akhmedova" }, role: { ru: "хирург", uz: "jarroh", en: "surgeon" } },
  ],
  effects: [
    {
      value: { ru: "≈15 мин", uz: "≈15 daq", en: "≈15 min" },
      label: { ru: "в зале вместо двух часов", uz: "ikki soat oʻrniga zalda", en: "in the waiting room instead of two hours" },
      basis: {
        ru: "номер в телефоне, приходите к своей очереди",
        uz: "raqam telefonda, navbatingizga keling",
        en: "your number is on the phone, come when it’s your turn",
      },
    },
    {
      value: "100%",
      label: { ru: "оплат с чеком в системе", uz: "tizimda chekli toʻlovlar", en: "of payments logged with a receipt" },
      basis: {
        ru: "касса дня считается сама, без бумажного журнала",
        uz: "kunlik kassa qogʻoz jurnalsiz oʻzi hisoblanadi",
        en: "the daily till adds up itself, no paper log",
      },
    },
    {
      value: "−50%",
      label: { ru: "звонков «сколько стоит?»", uz: "“qancha turadi?” qoʻngʻiroqlari", en: "“how much is it?” calls" },
      basis: { ru: "открытый прайс в Telegram и на сайте", uz: "Telegramda va saytda ochiq narxlar", en: "open prices in Telegram and on the site" },
    },
  ],
  copy: { ru, uz, en },
});
