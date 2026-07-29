import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

const colors = [
  ["Principal", "bg-brand", "#D95D39"],
  ["Principal hover", "bg-brand-hover", "#A63F25"],
  ["Secundario", "bg-secondary", "#718C66"],
  ["Secundario hover", "bg-secondary-hover", "#4E6847"],
  ["Acento", "bg-accent", "#E5A93D"],
  ["Fondo", "bg-page", "#FFF9F2"],
  ["Fondo secundario", "bg-page-muted", "#F4E9DC"],
  ["Superficie", "bg-surface", "#FFFFFF"],
  ["Éxito", "bg-success", "#3F7D57"],
  ["Advertencia", "bg-warning", "#D48B24"],
  ["Error", "bg-error", "#C84545"],
  ["Información", "bg-info", "#3978A8"],
] as const;

export default function DesignSystemPage() {
  return (
    <main className="py-12 md:py-16">
      <Container>
        <header className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand">
            Sistema de diseño
          </p>

          <h1 className="font-serif text-4xl font-bold leading-tight md:text-5xl">
            Fundamentos visuales de CociHub
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Tokens de color, tipografías y componentes que formarán la interfaz
            pública y administrativa.
          </p>
        </header>

        <section className="mt-14">
          <h2 className="font-serif text-3xl font-bold">
            Paleta de colores
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {colors.map(([name, backgroundClass, hex]) => (
              <article
                key={name}
                className="overflow-hidden rounded-lg border border-border bg-surface shadow-[var(--shadow-sm)]"
              >
                <div
                  className={`h-28 border-b border-border ${backgroundClass}`}
                />

                <div className="p-5">
                  <h3 className="font-sans text-base font-semibold">
                    {name}
                  </h3>

                  <p className="mt-1 font-mono text-sm text-muted-foreground">
                    {hex}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl font-bold">
            Tipografía
          </h2>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <article className="rounded-lg border border-border bg-surface p-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand">
                Lora
              </p>

              <p className="mt-4 font-serif text-4xl font-bold">
                Tus recetas, siempre a mano
              </p>

              <p className="mt-4 text-muted-foreground">
                Se utilizará en títulos, nombres de recetas y contenido
                editorial.
              </p>
            </article>

            <article className="rounded-lg border border-border bg-surface p-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-secondary-hover">
                Inter
              </p>

              <p className="mt-4 text-2xl font-semibold">
                Una interfaz clara y fácil de utilizar
              </p>

              <p className="mt-4 text-muted-foreground">
                Se utilizará en navegación, textos, botones, formularios y
                administración.
              </p>
            </article>
          </div>
        </section>
        
        <section className="mt-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
              Componentes básicos
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold">
              Botones
            </h2>

            <p className="mt-4 text-muted-foreground">
              Variantes, tamaños y estados principales de los botones de CociHub.
            </p>
          </div>

          <div className="mt-8 rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
            <h3 className="font-serif text-xl font-bold">
              Variantes
            </h3>

            <div className="mt-5 flex flex-wrap gap-4">
              <Button>Botón principal</Button>

              <Button variant="secondary">
                Botón secundario
              </Button>

              <Button variant="tertiary">
                Botón terciario
              </Button>

              <Button variant="danger">
                Eliminar receta
              </Button>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
            <h3 className="font-serif text-xl font-bold">
              Tamaños
            </h3>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Button size="sm">
                Pequeño
              </Button>

              <Button size="md">
                Mediano
              </Button>

              <Button size="lg">
                Grande
              </Button>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
            <h3 className="font-serif text-xl font-bold">
              Estados
            </h3>

            <div className="mt-5 flex flex-wrap gap-4">
              <Button disabled>
                Deshabilitado
              </Button>

              <Button isLoading>
                Guardar receta
              </Button>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}