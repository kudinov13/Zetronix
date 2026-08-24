import { useEffect } from "react";

interface SEOOptions {
  title: string;
  description?: string;
  canonical?: string;
  ogType?: string;
}

const SITE_URL = "https://zetronix.ru";
const DEFAULT_TITLE = "Сайты и автоматизация для вашего бизнеса — Zetronix";
const DEFAULT_DESCRIPTION =
  "Делаем готовые сайты за 1 день и внедряем автоматизацию бизнес-процессов: Telegram-боты, CRM, мобильные и десктопные приложения.";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(url: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

export function useSEO({ title, description, canonical, ogType }: SEOOptions) {
  useEffect(() => {
    const fullTitle = title || DEFAULT_TITLE;
    const desc = description || DEFAULT_DESCRIPTION;
    const url = canonical ? `${SITE_URL}${canonical}` : `${SITE_URL}/`;

    document.title = fullTitle;
    setMeta("name", "description", desc);
    setCanonical(url);

    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", ogType || "website");

    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta("name", "description", DEFAULT_DESCRIPTION);
      setCanonical(`${SITE_URL}/`);
      setMeta("property", "og:title", "Zetronix — сайты и автоматизация для вашего бизнеса");
      setMeta("property", "og:description", DEFAULT_DESCRIPTION);
      setMeta("property", "og:url", `${SITE_URL}/`);
      setMeta("property", "og:type", "website");
      setMeta("name", "twitter:title", "Zetronix — сайты и автоматизация для вашего бизнеса");
      setMeta("name", "twitter:description", DEFAULT_DESCRIPTION);
    };
  }, [title, description, canonical, ogType]);
}
