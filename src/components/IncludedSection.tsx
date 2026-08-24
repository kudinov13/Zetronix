import { includedItems } from "@/data/included";
import { Reveal } from "@/components/Reveal";

export function IncludedSection() {
  return (
    <section
      id="included"
      aria-labelledby="included-title"
      className="container-site scroll-mt-20 py-24 md:py-32"
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <h2 id="included-title" className="h-section">
              Что входит в работу
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-muted">
              Всё, что нужно, чтобы сайт начал приносить заявки. Без отдельных
              счетов за каждую мелочь.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          {includedItems.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.05}>
              <div className="border-t border-border py-6 first:border-t-0 first:pt-0 lg:first:border-t lg:first:pt-6">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 max-w-xl leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
