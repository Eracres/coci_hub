"use client";

import {
  type ReactNode,
  useState,
} from "react";

import {
  BookOpen,
  Lightbulb,
  PackageCheck,
  RefreshCcw,
  Snowflake,
  UtensilsCrossed,
} from "lucide-react";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type SourceType =
  | ""
  | "own"
  | "family"
  | "book"
  | "magazine"
  | "web"
  | "handwritten"
  | "other";

type AdditionalInfo = {
  tips: string;
  substitutions: string;
  storage: string;
  freezing: string;
  reheating: string;

  sourceType: SourceType;
  sourceTitle: string;
  sourceAuthor: string;
  sourcePage: string;
  sourceUrl: string;
  sourceNotes: string;
};

const emptyAdditionalInfo: AdditionalInfo = {
  tips: "",
  substitutions: "",
  storage: "",
  freezing: "",
  reheating: "",

  sourceType: "",
  sourceTitle: "",
  sourceAuthor: "",
  sourcePage: "",
  sourceUrl: "",
  sourceNotes: "",
};

type InfoBlockProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

function InfoBlock({
  icon,
  title,
  description,
  children,
}: InfoBlockProps) {
  return (
    <section className="rounded-lg border border-border bg-page p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-page-muted text-brand">
          {icon}
        </span>

        <div>
          <h4 className="font-serif text-lg font-bold">
            {title}
          </h4>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

export function RecipeAdditionalInfoDemo() {
  const [info, setInfo] = useState<AdditionalInfo>({
    ...emptyAdditionalInfo,
    tips:
      "Deja reposar la mezcla unos minutos antes de formar los falafel para que tenga más consistencia.",
    storage:
      "Conservar en un recipiente hermético en frigorífico durante un máximo de 3 días.",
    sourceType: "own",
  });

  function updateField<K extends keyof AdditionalInfo>(
    field: K,
    value: AdditionalInfo[K],
  ) {
    setInfo((currentInfo) => ({
      ...currentInfo,
      [field]: value,
    }));
  }

  const hasSourceDetails =
    info.sourceType !== "";

  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
      <div>
        <h3 className="font-serif text-xl font-bold">
          Información adicional
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Añade información útil sobre preparación,
          conservación, sustituciones o procedencia de
          la receta.
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Todos los campos de esta sección son opcionales.
        </p>
      </div>

      <div className="mt-8 grid gap-6">
        {/* Consejos */}

        <InfoBlock
          title="Consejos"
          description="Recomendaciones generales que ayuden a obtener un mejor resultado."
          icon={
            <Lightbulb
              aria-hidden="true"
              className="size-5"
            />
          }
        >
          <Textarea
            id="additional-tips"
            value={info.tips}
            onChange={(event) =>
              updateField(
                "tips",
                event.target.value,
              )
            }
            placeholder="Ej. Deja reposar la mezcla antes de formar los falafel..."
            className="min-h-32"
            maxLength={1200}
          />
        </InfoBlock>

        {/* Sustituciones */}

        <InfoBlock
          title="Sustituciones"
          description="Alternativas para ingredientes o preparaciones."
          icon={
            <RefreshCcw
              aria-hidden="true"
              className="size-5"
            />
          }
        >
          <Textarea
            id="additional-substitutions"
            value={info.substitutions}
            onChange={(event) =>
              updateField(
                "substitutions",
                event.target.value,
              )
            }
            placeholder="Ej. Puedes sustituir el yogur natural por una alternativa vegetal..."
            className="min-h-32"
            maxLength={1200}
          />
        </InfoBlock>

        {/* Conservación */}

        <InfoBlock
          title="Conservación"
          description="Indica cómo guardar correctamente la receta una vez preparada."
          icon={
            <PackageCheck
              aria-hidden="true"
              className="size-5"
            />
          }
        >
          <Textarea
            id="additional-storage"
            value={info.storage}
            onChange={(event) =>
              updateField(
                "storage",
                event.target.value,
              )
            }
            placeholder="Ej. Guardar en frigorífico dentro de un recipiente hermético..."
            className="min-h-32"
            maxLength={1000}
          />
        </InfoBlock>

        {/* Congelación */}

        <InfoBlock
          title="Congelación"
          description="Explica si puede congelarse y cómo hacerlo."
          icon={
            <Snowflake
              aria-hidden="true"
              className="size-5"
            />
          }
        >
          <Textarea
            id="additional-freezing"
            value={info.freezing}
            onChange={(event) =>
              updateField(
                "freezing",
                event.target.value,
              )
            }
            placeholder="Ej. Se pueden congelar ya formados antes de cocinar..."
            className="min-h-32"
            maxLength={1000}
          />
        </InfoBlock>

        {/* Recalentado */}

        <InfoBlock
          title="Recalentado"
          description="Describe la mejor forma de volver a calentar la preparación."
          icon={
            <UtensilsCrossed
              aria-hidden="true"
              className="size-5"
            />
          }
        >
          <Textarea
            id="additional-reheating"
            value={info.reheating}
            onChange={(event) =>
              updateField(
                "reheating",
                event.target.value,
              )
            }
            placeholder="Ej. Recalentar en horno durante 8 minutos a 180 °C..."
            className="min-h-32"
            maxLength={1000}
          />
        </InfoBlock>

        {/* Fuente */}

        <InfoBlock
          title="Fuente y procedencia"
          description="Registra de dónde procede la receta o en qué contenido está inspirada."
          icon={
            <BookOpen
              aria-hidden="true"
              className="size-5"
            />
          }
        >
          <div className="grid gap-6">
            <FormField
              htmlFor="source-type"
              label="Tipo de procedencia"
              description="Este dato ayudará también a identificar futuras recetas importadas mediante IA."
            >
              <Select
                id="source-type"
                value={info.sourceType}
                onChange={(event) =>
                  updateField(
                    "sourceType",
                    event.target.value as SourceType,
                  )
                }
              >
                <option value="">
                  Sin especificar
                </option>

                <option value="own">
                  Receta propia
                </option>

                <option value="family">
                  Receta familiar
                </option>

                <option value="book">
                  Libro
                </option>

                <option value="magazine">
                  Revista
                </option>

                <option value="web">
                  Página web
                </option>

                <option value="handwritten">
                  Receta manuscrita
                </option>

                <option value="other">
                  Otra procedencia
                </option>
              </Select>
            </FormField>

            {hasSourceDetails && (
              <div className="grid gap-6 rounded-lg border border-border bg-surface p-5 lg:grid-cols-2">
                <FormField
                  htmlFor="source-title"
                  label="Título o referencia"
                  description="Nombre del libro, revista, documento o receta original."
                >
                  <Input
                    id="source-title"
                    value={info.sourceTitle}
                    onChange={(event) =>
                      updateField(
                        "sourceTitle",
                        event.target.value,
                      )
                    }
                    placeholder="Ej. Recetario familiar"
                    maxLength={180}
                  />
                </FormField>

                <FormField
                  htmlFor="source-author"
                  label="Autor"
                  description="Opcional."
                >
                  <Input
                    id="source-author"
                    value={info.sourceAuthor}
                    onChange={(event) =>
                      updateField(
                        "sourceAuthor",
                        event.target.value,
                      )
                    }
                    placeholder="Ej. María García"
                    maxLength={120}
                  />
                </FormField>

                <FormField
                  htmlFor="source-page"
                  label="Página"
                  description="Útil para libros o revistas."
                >
                  <Input
                    id="source-page"
                    value={info.sourcePage}
                    onChange={(event) =>
                      updateField(
                        "sourcePage",
                        event.target.value,
                      )
                    }
                    placeholder="Ej. 42"
                    maxLength={30}
                  />
                </FormField>

                <FormField
                  htmlFor="source-url"
                  label="URL"
                  description="Solo cuando la receta procede de una fuente web."
                >
                  <Input
                    id="source-url"
                    type="url"
                    value={info.sourceUrl}
                    onChange={(event) =>
                      updateField(
                        "sourceUrl",
                        event.target.value,
                      )
                    }
                    placeholder="https://..."
                  />
                </FormField>

                <FormField
                  htmlFor="source-notes"
                  label="Notas sobre la procedencia"
                  description="Cambios realizados, adaptación personal u otra información relevante."
                  className="lg:col-span-2"
                >
                  <Textarea
                    id="source-notes"
                    value={info.sourceNotes}
                    onChange={(event) =>
                      updateField(
                        "sourceNotes",
                        event.target.value,
                      )
                    }
                    placeholder="Ej. Adaptada modificando cantidades y sustituyendo varios ingredientes..."
                    className="min-h-32"
                    maxLength={1000}
                  />
                </FormField>
              </div>
            )}
          </div>
        </InfoBlock>
      </div>
    </section>
  );
}