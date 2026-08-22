import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { api } from "@/lib/api";
import type { TemplateDTO } from "@/lib/types";
import { useLeadForm } from "@/hooks/useLeadForm";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SuccessCheck } from "@/components/SuccessCheck";
import { Reveal } from "@/components/Reveal";
import { EASE_OUT } from "@/lib/motion";

interface FormErrors {
  name?: string;
  contact?: string;
}

const NO_TEMPLATE = "none";

export function LeadSection() {
  const { preselectedSlug, preselectTemplate } = useLeadForm();
  const reduce = useReducedMotion();

  const [templates, setTemplates] = useState<TemplateDTO[]>([]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [templateSlug, setTemplateSlug] = useState(NO_TEMPLATE);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.listTemplates().then(setTemplates).catch(() => {});
  }, []);

  useEffect(() => {
    if (preselectedSlug) {
      setTemplateSlug(preselectedSlug);
      preselectTemplate(null);
    }
  }, [preselectedSlug, preselectTemplate]);

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (name.trim().length < 2) {
      next.name = "Напишите, как к вам обращаться. Хватит пары букв.";
    }
    const contactClean = contact.trim();
    const looksLikePhone = /^[+\d][\d\s()-]{6,}$/.test(contactClean);
    const looksLikeTelegram = /^@?[a-zA-Z][\w]{3,}$/.test(contactClean);
    if (!looksLikePhone && !looksLikeTelegram) {
      next.contact =
        "Оставьте телефон или ник в Telegram, иначе мы не сможем ответить.";
    }
    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
    try {
      await api.createLead({
        name: name.trim(),
        contact: contact.trim(),
        templateSlug: templateSlug === NO_TEMPLATE ? null : templateSlug,
        comment: comment.trim(),
      });
      setSent(true);
    } catch {
      setErrors({ contact: "Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в Telegram." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="lead"
      aria-labelledby="lead-title"
      className="container-site scroll-mt-20 py-24 md:py-32"
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-5">
          <h2 id="lead-title" className="h-section">
            Расскажите о вашем деле
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-muted">
            Отвечаем в течение рабочего дня. Обсудим задачу, подскажем, какой
            шаблон подойдёт лучше, и назовём точную цену.
          </p>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
            Никакого спама и обзвонов: один осмысленный разговор, дальше решайте
            сами.
          </p>
        </Reveal>

        <Reveal className="lg:col-span-7" delay={0.1}>
          <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex min-h-[420px] flex-col items-center justify-center gap-5 text-center"
                  role="status"
                >
                  <SuccessCheck />
                  <p className="text-xl font-semibold">Заявка у нас</p>
                  <p className="max-w-sm leading-relaxed text-muted">
                    Спасибо, {name.trim()}. Напишем вам в течение рабочего дня.
                    Если хотите быстрее, загляните в наш Telegram внизу
                    страницы.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={false}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0.1 : 0.25, ease: EASE_OUT }}
                  onSubmit={handleSubmit}
                  noValidate
                  className="flex flex-col gap-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="lead-name" className="text-sm font-medium">
                        Как вас зовут
                      </label>
                      <Input
                        id="lead-name"
                        name="name"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={
                          errors.name ? "lead-name-error" : undefined
                        }
                        placeholder="Например, Ольга"
                      />
                      {errors.name && (
                        <p id="lead-name-error" role="alert" className="text-sm text-accent">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="lead-contact"
                        className="text-sm font-medium"
                      >
                        Телефон или Telegram
                      </label>
                      <Input
                        id="lead-contact"
                        name="contact"
                        autoComplete="tel"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        aria-invalid={Boolean(errors.contact)}
                        aria-describedby={
                          errors.contact ? "lead-contact-error" : undefined
                        }
                        placeholder="+7 900 000-00-00 или @nickname"
                      />
                      {errors.contact && (
                        <p id="lead-contact-error" role="alert" className="text-sm text-accent">
                          {errors.contact}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="lead-template"
                      className="text-sm font-medium"
                    >
                      Какой шаблон понравился
                    </label>
                    <Select
                      id="lead-template"
                      name="template"
                      value={templateSlug}
                      onChange={(e) => setTemplateSlug(e.target.value)}
                    >
                      <option value={NO_TEMPLATE}>Пока не выбрал</option>
                      {templates.map((t) => (
                        <option key={t.slug} value={t.slug}>
                          {t.title} ({t.category ?? "—"})
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="lead-comment"
                      className="text-sm font-medium"
                    >
                      Пара слов о деле
                    </label>
                    <Textarea
                      id="lead-comment"
                      name="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Например: кофейня в центре, нужны меню и онлайн-заказ"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full bg-accent px-8 py-3.5 text-base font-medium text-accent-foreground transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? "Отправляем…" : "Отправить заявку"}
                  </button>
                  <p className="text-xs leading-relaxed text-muted">
                    Нажимая кнопку, вы соглашаетесь с политикой
                    конфиденциальности. Данные нужны только для ответа на
                    заявку.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
