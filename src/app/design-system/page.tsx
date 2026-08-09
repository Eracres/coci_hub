import { Container } from "@/components/layout/container";

import { IngredientListDemo } from "@/components/admin/recipes/ingredient-list-demo";
import { ImageUploaderDemo } from "@/components/admin/recipes/image-uploader-demo";
import { RecipeBasicInfoDemo } from "@/components/admin/recipes/recipe-basic-info-demo";
import { RecipeServingsDemo } from "@/components/admin/recipes/recipe-servings-demo";
import { RecipeStepsDemo } from "@/components/admin/recipes/recipe-steps-demo";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RecipeClassificationDemo } from "@/components/admin/recipes/recipe-classification-demo";
import { RecipeTimesDemo } from "@/components/admin/recipes/recipe-times-demo";
import { RecipeAdditionalInfoDemo } from "@/components/admin/recipes/recipe-additional-info-demo";
import { RecipeAllergensDemo } from "@/components/admin/recipes/recipe-allergens-demo";

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

type SectionIntroProps = {
  title: string;
  description: string;
};

function SectionIntro({
  title,
  description,
}: SectionIntroProps) {
  return (
    <div className="max-w-3xl">
      <h3 className="font-serif text-2xl font-bold">
        {title}
      </h3>

      <p className="mt-3 leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="py-12 md:py-16">
      <Container>
        {/* =====================================================
            CABECERA
        ====================================================== */}

        <header className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand">
            Sistema de diseño
          </p>

          <h1 className="font-serif text-4xl font-bold leading-tight md:text-5xl">
            Fundamentos visuales de CociHub
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Tokens, componentes y patrones de interfaz que formarán
            tanto la aplicación pública como el área administrativa.
          </p>
        </header>

        {/* =====================================================
            1. FUNDAMENTOS VISUALES
        ====================================================== */}

        <section className="mt-20">
          <header className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
              01 · Fundamentos
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">
              Fundamentos visuales
            </h2>

            <p className="mt-4 leading-relaxed text-muted-foreground">
              Colores y tipografías que definen la identidad visual
              principal de CociHub.
            </p>
          </header>

          {/* Paleta */}

          <div className="mt-12">
            <SectionIntro
              title="Paleta de colores"
              description="Colores principales, secundarios y estados utilizados en toda la interfaz."
            />

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {colors.map(
                ([name, backgroundClass, hex]) => (
                  <article
                    key={name}
                    className="overflow-hidden rounded-lg border border-border bg-surface shadow-[var(--shadow-sm)]"
                  >
                    <div
                      className={`h-28 border-b border-border ${backgroundClass}`}
                    />

                    <div className="p-5">
                      <h4 className="text-base font-semibold">
                        {name}
                      </h4>

                      <p className="mt-1 font-mono text-sm text-muted-foreground">
                        {hex}
                      </p>
                    </div>
                  </article>
                ),
              )}
            </div>
          </div>

          {/* Tipografía */}

          <div className="mt-14">
            <SectionIntro
              title="Tipografía"
              description="Lora aporta personalidad editorial mientras que Inter mantiene clara y legible la interfaz."
            />

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <article className="rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-xs)]">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand">
                  Lora
                </p>

                <p className="mt-4 font-serif text-4xl font-bold">
                  Tus recetas, siempre a mano
                </p>

                <p className="mt-4 text-muted-foreground">
                  Títulos, nombres de recetas y contenido
                  editorial.
                </p>
              </article>

              <article className="rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-xs)]">
                <p className="text-sm font-semibold uppercase tracking-wider text-secondary-hover">
                  Inter
                </p>

                <p className="mt-4 text-2xl font-semibold">
                  Una interfaz clara y fácil de utilizar
                </p>

                <p className="mt-4 text-muted-foreground">
                  Navegación, formularios, botones y textos de
                  interfaz.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* =====================================================
            2. COMPONENTES UI
        ====================================================== */}

        <section className="mt-24 border-t border-border pt-16">
          <header className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
              02 · Componentes
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">
              Componentes de interfaz
            </h2>

            <p className="mt-4 leading-relaxed text-muted-foreground">
              Elementos reutilizables que utilizaremos para
              construir las pantallas públicas y administrativas.
            </p>
          </header>

          {/* Botones */}

          <div className="mt-12">
            <SectionIntro
              title="Botones"
              description="Variantes, tamaños y estados principales de las acciones de CociHub."
            />

            <div className="mt-6 grid gap-6">
              <article className="rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
                <h4 className="font-serif text-lg font-bold">
                  Variantes
                </h4>

                <div className="mt-5 flex flex-wrap gap-4">
                  <Button>
                    Botón principal
                  </Button>

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
              </article>

              <article className="rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
                <h4 className="font-serif text-lg font-bold">
                  Tamaños
                </h4>

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
              </article>

              <article className="rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
                <h4 className="font-serif text-lg font-bold">
                  Estados
                </h4>

                <div className="mt-5 flex flex-wrap gap-4">
                  <Button disabled>
                    Deshabilitado
                  </Button>

                  <Button isLoading>
                    Guardar receta
                  </Button>
                </div>
              </article>
            </div>
          </div>

          {/* Campos */}

          <div className="mt-16">
            <SectionIntro
              title="Campos de formulario"
              description="Inputs, áreas de texto, ayudas y estados de validación."
            />

            <div className="mt-6 grid gap-6 rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)] lg:grid-cols-2">
              <FormField
                htmlFor="demo-recipe-title"
                label="Título de la receta"
                description="Utiliza un nombre claro y descriptivo."
                required
              >
                <Input
                  id="demo-recipe-title"
                  name="demo-recipe-title"
                  placeholder="Ej. Falafel de remolacha"
                />
              </FormField>

              <FormField
                htmlFor="demo-recipe-slug"
                label="URL de la receta"
                description="Se generará automáticamente a partir del título."
              >
                <Input
                  id="demo-recipe-slug"
                  name="demo-recipe-slug"
                  defaultValue="falafel-de-remolacha"
                />
              </FormField>

              <FormField
                htmlFor="demo-disabled"
                label="Campo deshabilitado"
                description="Ejemplo de un campo que no puede modificarse."
              >
                <Input
                  id="demo-disabled"
                  name="demo-disabled"
                  defaultValue="Dato no editable"
                  disabled
                />
              </FormField>

              <FormField
                htmlFor="demo-error"
                label="Campo con error"
                error="Introduce un título de al menos 3 caracteres."
                required
              >
                <Input
                  id="demo-error"
                  name="demo-error"
                  defaultValue="Fa"
                  hasError
                  aria-describedby="demo-error-error"
                />
              </FormField>

              <FormField
                htmlFor="demo-description"
                label="Descripción corta"
                description="Se utilizará en tarjetas, buscadores y metadatos."
                className="lg:col-span-2"
                required
              >
                <Textarea
                  id="demo-description"
                  name="demo-description"
                  placeholder="Describe brevemente la receta..."
                  maxLength={180}
                />
              </FormField>

              <FormField
                htmlFor="demo-introduction"
                label="Introducción"
                description="Puedes explicar el origen de la receta o añadir contexto personal."
                className="lg:col-span-2"
              >
                <Textarea
                  id="demo-introduction"
                  name="demo-introduction"
                  placeholder="Esta receta nació cuando..."
                  className="min-h-44"
                />
              </FormField>
            </div>
          </div>

          {/* Selectores */}

          <div className="mt-16">
            <SectionIntro
              title="Selectores y controles"
              description="Controles genéricos para seleccionar opciones, clasificar contenido y modificar estados."
            />

            <div className="mt-6 grid gap-8 rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
              <div className="grid gap-6 lg:grid-cols-2">
                <FormField
                  htmlFor="demo-recipe-type"
                  label="Tipo de receta"
                  description="Selecciona el tipo principal."
                  required
                >
                  <Select
                    id="demo-recipe-type"
                    name="demo-recipe-type"
                    defaultValue=""
                  >
                    <option
                      value=""
                      disabled
                    >
                      Selecciona un tipo
                    </option>

                    <option value="breakfast">
                      Desayuno
                    </option>

                    <option value="starter">
                      Entrante
                    </option>

                    <option value="main-course">
                      Plato principal
                    </option>

                    <option value="side-dish">
                      Guarnición
                    </option>

                    <option value="dessert">
                      Postre
                    </option>
                  </Select>
                </FormField>

                <FormField
                  htmlFor="demo-ingredient-unit"
                  label="Unidad de medida"
                  description="Unidad utilizada para un ingrediente."
                >
                  <Select
                    id="demo-ingredient-unit"
                    name="demo-ingredient-unit"
                  >
                    <option value="g">
                      Gramos
                    </option>

                    <option value="kg">
                      Kilogramos
                    </option>

                    <option value="ml">
                      Mililitros
                    </option>

                    <option value="l">
                      Litros
                    </option>

                    <option value="unit">
                      Unidades
                    </option>

                    <option value="tbsp">
                      Cucharadas
                    </option>

                    <option value="tsp">
                      Cucharaditas
                    </option>

                    <option value="to-taste">
                      Al gusto
                    </option>
                  </Select>
                </FormField>
              </div>

              <RadioGroup
                name="demo-difficulty"
                legend="Dificultad"
                defaultValue="easy"
                required
                options={[
                  {
                    value: "easy",
                    label: "Fácil",
                    description:
                      "No requiere técnicas avanzadas.",
                  },
                  {
                    value: "medium",
                    label: "Media",
                    description:
                      "Requiere cierta experiencia.",
                  },
                  {
                    value: "hard",
                    label: "Difícil",
                    description:
                      "Incluye técnicas más complejas.",
                  },
                ]}
              />

              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Etiquetas y características
                </h4>

                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <Checkbox
                    id="demo-vegetarian"
                    name="demo-vegetarian"
                    label="Vegetariana"
                  />

                  <Checkbox
                    id="demo-quick"
                    name="demo-quick"
                    label="Receta rápida"
                  />

                  <Checkbox
                    id="demo-economic"
                    name="demo-economic"
                    label="Económica"
                  />

                  <Checkbox
                    id="demo-share"
                    name="demo-share"
                    label="Para compartir"
                  />
                </div>
              </div>

              <Switch
                id="demo-featured"
                name="demo-featured"
                label="Receta destacada"
                description="La receta podrá aparecer en la portada de CociHub."
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            3. FORMULARIO ADMINISTRATIVO
        ====================================================== */}

        <section className="mt-24 border-t border-border pt-16">
          <header className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
              03 · Administración
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">
              Formulario de receta
            </h2>

            <p className="mt-4 leading-relaxed text-muted-foreground">
              Composición progresiva de los módulos que
              formarán el formulario definitivo para crear y
              editar recetas.
            </p>
          </header>

          {/* Información básica */}

          <div className="mt-12">
            <SectionIntro
              title="Información básica"
              description="Datos principales con los que se identificará y presentará una receta."
            />

            <div className="mt-6">
              <RecipeBasicInfoDemo />
            </div>
          </div>

          {/* Raciones */}

          <div className="mt-16">
            <SectionIntro
              title="Raciones y comensales"
              description="Define para cuántas personas están calculadas las cantidades originales y permite comprobar el futuro selector público."
            />

            <div className="mt-6">
              <RecipeServingsDemo />
            </div>
          </div>

          {/* Imagen */}

          <div className="mt-16">
            <SectionIntro
              title="Imagen principal"
              description="Selección, validación y previsualización de la fotografía principal antes de almacenarla."
            />

            <div className="mt-6">
              <ImageUploaderDemo />
            </div>
          </div>

          {/* Clasificación */}

          <div className="mt-16">
            <SectionIntro
              title="Clasificación"
              description="Define el tipo principal, las categorías, etiquetas, dificultad y visibilidad destacada de la receta."
            />

            <div className="mt-6">
              <RecipeClassificationDemo />
            </div>
          </div>

          {/* Tiempos */}

          <div className="mt-16">
            <SectionIntro
              title="Tiempos"
              description="Define la duración de preparación, cocinado y tiempos adicionales. El total se calcula automáticamente."
            />

            <div className="mt-6">
              <RecipeTimesDemo />
            </div>
          </div>

          {/* Ingredientes */}

          <div className="mt-16">
            <SectionIntro
              title="Ingredientes"
              description="Creación de grupos y gestión individual de ingredientes mediante un formulario reutilizable."
            />

            <div className="mt-6">
              <IngredientListDemo />
            </div>
          </div>

          {/* Pasos */}

          <div className="mt-16">
            <SectionIntro
              title="Elaboración"
              description="Creación, edición, duplicado y reordenación de los pasos necesarios para preparar la receta."
            />

            <div className="mt-6">
              <RecipeStepsDemo />
            </div>
          </div>

          {/* Información adicional */}

          <div className="mt-16">
            <SectionIntro
              title="Información adicional"
              description="Consejos, sustituciones, conservación, congelación, recalentado y procedencia de la receta."
            />

            <div className="mt-6">
              <RecipeAdditionalInfoDemo />
            </div>
          </div>

          {/* Alérgenos */}

          <div className="mt-16">
            <SectionIntro
              title="Alérgenos"
              description="Identificación orientativa de alérgenos presentes y posibles trazas relacionadas con los ingredientes utilizados."
            />

            <div className="mt-6">
              <RecipeAllergensDemo />
            </div>
          </div>

        </section>
      </Container>
    </main>
  );
}