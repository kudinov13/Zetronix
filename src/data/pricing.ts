export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  duration: string;
  features: string[];
  featured: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "landing",
    name: "Лендинг",
    price: "от 10 000 ₽",
    duration: "1–2 дня",
    features: [
      "Одна страница на выбранном шаблоне",
      "Ваши тексты, фото и цвета",
      "Форма заявок в Telegram",
      "Подключение вашего домена",
      "Адаптация под телефон",
    ],
    featured: false,
  },
  {
    id: "site",
    name: "Сайт-визитка",
    price: "от 20 000 ₽",
    duration: "2–4 дня",
    features: [
      "До 5 страниц на выбранном шаблоне",
      "Всё из тарифа «Лендинг»",
      "Базовая настройка для поисковиков",
      "Онлайн-запись или каталог услуг",
      "Видеоурок: как менять тексты самому",
    ],
    featured: true,
  },
  {
    id: "shop",
    name: "Онлайн-магазин",
    price: "от 30 000 ₽",
    duration: "7–14 дней",
    features: [
      "Каталог и корзина",
      "Приём оплаты на сайте",
      "До 30 товаров на старте",
      "Всё из тарифа «Сайт-визитка»",
      "Помощь с наполнением каталога",
    ],
    featured: false,
  },
];
