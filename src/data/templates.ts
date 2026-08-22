export type TemplateCategory =
  | "Кафе"
  | "Салон красоты"
  | "Автосервис"
  | "Строительство"
  | "Фитнес"
  | "Онлайн-магазин"
  | "Портфолио"
  | "Медицина";

export interface Template {
  slug: string;
  title: string;
  category: TemplateCategory;
  tags: string[];
  demoUrl: string;
  previewImage: string;
}

export const templateCategories: Array<"Все" | TemplateCategory> = [
  "Все",
  "Кафе",
  "Салон красоты",
  "Автосервис",
  "Строительство",
  "Фитнес",
  "Онлайн-магазин",
  "Портфолио",
  "Медицина",
];

export const templates: Template[] = [
  {
    slug: "kofeinya",
    title: "Кофейня «Утро»",
    category: "Кафе",
    tags: ["Меню", "Онлайн-заказ", "Карта проезда"],
    demoUrl: "https://demo.nashsait.ru/kofeinya",
    previewImage: "/media/templates/kofeinya.webp",
  },
  {
    slug: "salon-aura",
    title: "Салон «Аура»",
    category: "Салон красоты",
    tags: ["Онлайн-запись", "Прайс", "Мастера"],
    demoUrl: "https://demo.nashsait.ru/salon-aura",
    previewImage: "/media/templates/salon-aura.webp",
  },
  {
    slug: "avtoservis-pro",
    title: "Автосервис «Про»",
    category: "Автосервис",
    tags: ["Запись на сервис", "Калькулятор", "Услуги"],
    demoUrl: "https://demo.nashsait.ru/avtoservis-pro",
    previewImage: "/media/templates/avtoservis-pro.webp",
  },
  {
    slug: "stroymontazh",
    title: "СтройМонтаж",
    category: "Строительство",
    tags: ["Портфолио работ", "Смета", "Этапы"],
    demoUrl: "https://demo.nashsait.ru/stroymontazh",
    previewImage: "/media/templates/stroymontazh.webp",
  },
  {
    slug: "fitnes-atlant",
    title: "Фитнес «Атлант»",
    category: "Фитнес",
    tags: ["Расписание", "Абонементы", "Тренеры"],
    demoUrl: "https://demo.nashsait.ru/fitnes-atlant",
    previewImage: "/media/templates/fitnes-atlant.webp",
  },
  {
    slug: "shop-domashniy",
    title: "Магазин «Домашний»",
    category: "Онлайн-магазин",
    tags: ["Каталог", "Корзина", "Оплата"],
    demoUrl: "https://demo.nashsait.ru/shop-domashniy",
    previewImage: "/media/templates/shop-domashniy.webp",
  },
  {
    slug: "portfolio-foto",
    title: "Фотограф Анна Ветрова",
    category: "Портфолио",
    tags: ["Галерея", "Пакеты съёмок", "Заявка"],
    demoUrl: "https://demo.nashsait.ru/portfolio-foto",
    previewImage: "/media/templates/portfolio-foto.webp",
  },
  {
    slug: "klinika-zdorovie",
    title: "Клиника «Здоровье»",
    category: "Медицина",
    tags: ["Запись к врачу", "Услуги", "Врачи"],
    demoUrl: "https://demo.nashsait.ru/klinika-zdorovie",
    previewImage: "/media/templates/klinika-zdorovie.webp",
  },
];

export function getTemplateBySlug(slug: string): Template | undefined {
  return templates.find((t) => t.slug === slug);
}
