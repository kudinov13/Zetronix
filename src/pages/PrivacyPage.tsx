import { useSEO } from "@/hooks/useSEO";

export function PrivacyPage() {
  useSEO({
    title: "Политика конфиденциальности — Zetronix",
    description:
      "Политика конфиденциальности студии Zetronix. Обработка персональных данных, права пользователя и контакты для обращений.",
    canonical: "/privacy",
  });

  return (
    <article className="container-site max-w-3xl py-24 md:py-32">
      <h1 className="h-section">Политика конфиденциальности</h1>
      <p className="mt-4 text-sm text-muted">
        Последнее обновление: {new Date().getFullYear()} год
      </p>

      <div className="mt-10 space-y-8 leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-xl font-semibold">1. Общие положения</h2>
          <p className="mt-3 text-muted">
            Настоящая политика конфиденциальности определяет порядок обработки и
            защиты персональных данных пользователей сайта zetronix.ru
            (далее — «Сайт»), оператором которого является Кудинов Михаил
            Дмитриевич (далее — «Оператор»).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Какие данные мы собираем</h2>
          <p className="mt-3 text-muted">
            Через формы на Сайте мы собираем следующие данные:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-muted">
            <li>Имя — как к вам обращаться</li>
            <li>Контакт — телефон или ник в Telegram для связи</li>
            <li>Комментарий — описание задачи или вопроса</li>
          </ul>
          <p className="mt-3 text-muted">
            Через AI-чат-бота дополнительно могут быть собраны имя, контакт и
            описание запроса в ходе диалога.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Цель обработки</h2>
          <p className="mt-3 text-muted">
            Персональные данные используются исключительно для:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-muted">
            <li>Связи с вами по поводу заявки</li>
            <li>Консультации и подготовки коммерческого предложения</li>
            <li>Отправки уведомлений о статусе заявки</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Хранение и передача</h2>
          <p className="mt-3 text-muted">
            Данные хранятся в защищённой базе данных и передаются менеджеру через
            Telegram-бота для оперативной обработки. Мы не передаём ваши данные
            третьим лицам и не используем их для рекламных рассылок.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Срок хранения</h2>
          <p className="mt-3 text-muted">
            Персональные данные хранятся до достижения цели обработки или до
            отзыва согласия. По запросу данные удаляются в течение 30 дней.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Права пользователя</h2>
          <p className="mt-3 text-muted">Вы имеете право:</p>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-muted">
            <li>Запросить информацию о ваших данных</li>
            <li>Потребовать исправления или удаления данных</li>
            <li>Отозвать согласие на обработку</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Контакты</h2>
          <p className="mt-3 text-muted">
            По вопросам обработки персональных данных обращайтесь:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-muted">
            <li>Телефон: 8 (909) 505-34-44</li>
            <li>Telegram: @lhdevop</li>
            <li>Оператор: Кудинов Михаил Дмитриевич, ИНН 220453448409</li>
          </ul>
        </section>
      </div>
    </article>
  );
}
