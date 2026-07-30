import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

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

        <section className="mt-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
              Componentes básicos
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold">
              Campos de formulario
            </h2>

            <p className="mt-4 text-muted-foreground">
              Inputs, áreas de texto, ayudas y estados de validación.
            </p>
          </div>

          <div className="mt-8 grid gap-6 rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)] lg:grid-cols-2">
            <FormField
              htmlFor="recipe-title"
              label="Título de la receta"
              description="Utiliza un nombre claro y descriptivo."
              required
            >
              <Input
                id="recipe-title"
                name="recipe-title"
                placeholder="Ej. Falafel de remolacha"
              />
            </FormField>

            <FormField
              htmlFor="recipe-slug"
              label="URL de la receta"
              description="Se generará automáticamente a partir del título."
            >
              <Input
                id="recipe-slug"
                name="recipe-slug"
                defaultValue="falafel-de-remolacha"
              />
            </FormField>

            <FormField
              htmlFor="recipe-disabled"
              label="Campo deshabilitado"
              description="Ejemplo de un campo que no puede modificarse."
            >
              <Input
                id="recipe-disabled"
                name="recipe-disabled"
                defaultValue="Dato no editable"
                disabled
              />
            </FormField>

            <FormField
              htmlFor="recipe-error"
              label="Campo con error"
              error="Introduce un título de al menos 3 caracteres."
              required
            >
              <Input
                id="recipe-error"
                name="recipe-error"
                defaultValue="Fa"
                hasError
                aria-describedby="recipe-error-error"
              />
            </FormField>

            <FormField
              htmlFor="recipe-description"
              label="Descripción corta"
              description="Se utilizará en tarjetas, buscadores y metadatos."
              className="lg:col-span-2"
              required
            >
              <Textarea
                id="recipe-description"
                name="recipe-description"
                placeholder="Describe brevemente la receta..."
                maxLength={180}
              />
            </FormField>

            <FormField
              htmlFor="recipe-introduction"
              label="Introducción"
              description="Puedes explicar el origen de la receta o añadir contexto personal."
              className="lg:col-span-2"
            >
              <Textarea
                id="recipe-introduction"
                name="recipe-introduction"
                placeholder="Esta receta nació cuando..."
                className="min-h-44"
              />
            </FormField>
          </div>
        </section>

        <section className="mt-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
              Componentes básicos
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold">
              Selectores y controles
            </h2>

            <p className="mt-4 text-muted-foreground">
              Controles para clasificar recetas, seleccionar opciones y gestionar
              estados administrativos.
            </p>
          </div>

          <div className="mt-8 grid gap-8 rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
            <div className="grid gap-6 lg:grid-cols-2">
              <FormField
                htmlFor="recipe-type"
                label="Tipo de receta"
                description="Selecciona el tipo principal."
                required
              >
                <Select id="recipe-type" name="recipe-type" defaultValue="">
                  <option value="" disabled>
                    Selecciona un tipo
                  </option>
                  <option value="breakfast">Desayuno</option>
                  <option value="starter">Entrante</option>
                  <option value="main-course">Plato principal</option>
                  <option value="side-dish">Guarnición</option>
                  <option value="dessert">Postre</option>
                </Select>
              </FormField>

              <FormField
                htmlFor="ingredient-unit"
                label="Unidad de medida"
                description="Unidad utilizada para un ingrediente."
              >
                <Select id="ingredient-unit" name="ingredient-unit">
                  <option value="g">Gramos</option>
                  <option value="kg">Kilogramos</option>
                  <option value="ml">Mililitros</option>
                  <option value="l">Litros</option>
                  <option value="unit">Unidades</option>
                  <option value="tbsp">Cucharadas</option>
                  <option value="tsp">Cucharaditas</option>
                  <option value="to-taste">Al gusto</option>
                </Select>
              </FormField>
            </div>

            <RadioGroup
              name="difficulty"
              legend="Dificultad"
              defaultValue="easy"
              required
              options={[
                {
                  value: "easy",
                  label: "Fácil",
                  description: "No requiere técnicas avanzadas.",
                },
                {
                  value: "medium",
                  label: "Media",
                  description: "Requiere cierta experiencia.",
                },
                {
                  value: "hard",
                  label: "Difícil",
                  description: "Incluye técnicas más complejas.",
                },
              ]}
            />

            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Etiquetas y características
              </h3>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <Checkbox
                  id="vegetarian"
                  name="vegetarian"
                  label="Vegetariana"
                />

                <Checkbox
                  id="quick"
                  name="quick"
                  label="Receta rápida"
                />

                <Checkbox
                  id="economic"
                  name="economic"
                  label="Económica"
                />

                <Checkbox
                  id="share"
                  name="share"
                  label="Para compartir"
                />
              </div>
            </div>

            <Switch
              id="featured"
              name="featured"
              label="Receta destacada"
              description="La receta podrá aparecer en la portada de CociHub."
            />
          </div>
        </section>
      </Container>
    </main>
  );
}