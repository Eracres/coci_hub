"use client";

import type { ReactNode } from "react";

import {
    BookOpen,
    ChefHat,
    Clock3,
    ImageIcon,
    Info,
    ListChecks,
    Save,
    ShieldAlert,
    Tags,
    Users,
    Utensils,
} from "lucide-react";

import { ImageUploaderDemo } from "./image-uploader-demo";
import { IngredientListDemo } from "./ingredient-list-demo";
import { RecipeAdditionalInfoDemo } from "./recipe-additional-info-demo";
import { RecipeAllergensDemo } from "./recipe-allergens-demo";
import { RecipeBasicInfoDemo } from "./recipe-basic-info-demo";
import { RecipeClassificationDemo } from "./recipe-classification-demo";
import { RecipePublicationDemo } from "./recipe-publication-demo";
import { RecipeServingsDemo } from "./recipe-servings-demo";
import { RecipeStepsDemo } from "./recipe-steps-demo";
import { RecipeTimesDemo } from "./recipe-times-demo";

type RecipeFormSectionProps = {
    id: string;
    number: string;
    title: string;
    description: string;
    icon: ReactNode;
    children: ReactNode;
};

const navigationItems = [
    {
        id: "basic-info",
        label: "Información básica",
        icon: BookOpen,
    },
    {
        id: "main-image",
        label: "Imagen principal",
        icon: ImageIcon,
    },
    {
        id: "classification",
        label: "Clasificación",
        icon: Tags,
    },
    {
        id: "servings",
        label: "Raciones",
        icon: Users,
    },
    {
        id: "times",
        label: "Tiempos",
        icon: Clock3,
    },
    {
        id: "ingredients",
        label: "Ingredientes",
        icon: Utensils,
    },
    {
        id: "steps",
        label: "Elaboración",
        icon: ChefHat,
    },
    {
        id: "additional-info",
        label: "Información adicional",
        icon: Info,
    },
    {
        id: "allergens",
        label: "Alérgenos",
        icon: ShieldAlert,
    },
    {
        id: "publication",
        label: "Publicación",
        icon: Save,
    },
];

function RecipeFormSection({
    id,
    number,
    title,
    description,
    icon,
    children,
}: RecipeFormSectionProps) {
    return (
        <section
            id={id}
            className="scroll-mt-8"
        >
            <header className="mb-6">
                <div className="flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-inverse">
                        {number}
                    </span>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-brand">
                                {icon}
                            </span>

                            <h2 className="font-serif text-2xl font-bold">
                                {title}
                            </h2>
                        </div>

                        <p className="mt-2 max-w-3xl leading-relaxed text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>
            </header>

            {children}
        </section>
    );
}

export function RecipeFormDemo() {
    return (
        <div className="grid gap-10 xl:grid-cols-[240px_minmax(0,1fr)]">
            {/* Navegación lateral */}

            <aside className="hidden xl:block">
                <div className="sticky top-8">
                    <div className="rounded-lg border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
                        <div className="flex items-center gap-2">
                            <ListChecks
                                aria-hidden="true"
                                className="size-5 text-brand"
                            />

                            <h2 className="font-serif text-lg font-bold">
                                Nueva receta
                            </h2>
                        </div>

                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            Completa las distintas secciones antes de publicar.
                        </p>

                        <nav
                            className="mt-5"
                            aria-label="Secciones del formulario"
                        >
                            <ol className="grid gap-1">
                                {navigationItems.map(
                                    (item, index) => {
                                        const Icon = item.icon;

                                        return (
                                            <li key={item.id}>
                                                <a
                                                    href={`#${item.id}`}
                                                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-page-muted hover:text-foreground"
                                                >
                                                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-page-muted text-xs font-semibold">
                                                        {index + 1}
                                                    </span>

                                                    <Icon
                                                        aria-hidden="true"
                                                        className="size-4 shrink-0"
                                                    />

                                                    <span>
                                                        {item.label}
                                                    </span>
                                                </a>
                                            </li>
                                        );
                                    },
                                )}
                            </ol>
                        </nav>
                    </div>
                </div>
            </aside>

            {/* Formulario */}

            <div className="min-w-0">
                {/* Cabecera */}

                <header className="rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)] md:p-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                        Administración
                    </p>

                    <h1 className="mt-3 font-serif text-3xl font-bold md:text-4xl">
                        Nueva receta
                    </h1>

                    <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
                        Completa la información necesaria para crear una
                        receta. Puedes guardarla como borrador y continuar
                        editándola antes de publicarla.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2 text-sm">
                        <span className="rounded-full border border-warning/30 bg-warning/5 px-3 py-1.5 font-semibold text-warning">
                            Borrador
                        </span>

                        <span className="rounded-full border border-border bg-page px-3 py-1.5 text-muted-foreground">
                            Sin guardar
                        </span>
                    </div>
                </header>

                {/* Navegación móvil / tablet */}

                <nav
                    aria-label="Secciones del formulario"
                    className="mt-6 overflow-x-auto rounded-lg border border-border bg-surface p-3 xl:hidden"
                >
                    <ol className="flex min-w-max gap-2">
                        {navigationItems.map(
                            (item, index) => (
                                <li key={item.id}>
                                    <a
                                        href={`#${item.id}`}
                                        className="flex items-center gap-2 rounded-md bg-page px-3 py-2 text-sm font-medium"
                                    >
                                        <span className="text-xs font-bold text-brand">
                                            {index + 1}
                                        </span>

                                        {item.label}
                                    </a>
                                </li>
                            ),
                        )}
                    </ol>
                </nav>

                {/* Módulos */}

                <div className="mt-10 grid gap-16">
                    <RecipeFormSection
                        id="basic-info"
                        number="01"
                        title="Información básica"
                        description="Datos principales con los que se identificará y presentará la receta."
                        icon={
                            <BookOpen
                                aria-hidden="true"
                                className="size-5"
                            />
                        }
                    >
                        <RecipeBasicInfoDemo />
                    </RecipeFormSection>

                    <RecipeFormSection
                        id="main-image"
                        number="02"
                        title="Imagen principal"
                        description="Fotografía que representará visualmente la receta en listados y en su página de detalle."
                        icon={
                            <ImageIcon
                                aria-hidden="true"
                                className="size-5"
                            />
                        }
                    >
                        <ImageUploaderDemo />
                    </RecipeFormSection>

                    <RecipeFormSection
                        id="classification"
                        number="03"
                        title="Clasificación"
                        description="Tipo principal, categorías, etiquetas, dificultad y configuración como receta destacada."
                        icon={
                            <Tags
                                aria-hidden="true"
                                className="size-5"
                            />
                        }
                    >
                        <RecipeClassificationDemo />
                    </RecipeFormSection>

                    <RecipeFormSection
                        id="servings"
                        number="04"
                        title="Raciones y comensales"
                        description="Cantidad de personas para las que están calculadas originalmente las cantidades."
                        icon={
                            <Users
                                aria-hidden="true"
                                className="size-5"
                            />
                        }
                    >
                        <RecipeServingsDemo />
                    </RecipeFormSection>

                    <RecipeFormSection
                        id="times"
                        number="05"
                        title="Tiempos"
                        description="Duración de preparación, cocinado y tiempos adicionales necesarios."
                        icon={
                            <Clock3
                                aria-hidden="true"
                                className="size-5"
                            />
                        }
                    >
                        <RecipeTimesDemo />
                    </RecipeFormSection>

                    <RecipeFormSection
                        id="ingredients"
                        number="06"
                        title="Ingredientes"
                        description="Organiza los ingredientes mediante grupos y define qué cantidades se adaptarán automáticamente a las raciones."
                        icon={
                            <Utensils
                                aria-hidden="true"
                                className="size-5"
                            />
                        }
                    >
                        <IngredientListDemo />
                    </RecipeFormSection>

                    <RecipeFormSection
                        id="steps"
                        number="07"
                        title="Elaboración"
                        description="Añade y ordena los pasos necesarios para preparar correctamente la receta."
                        icon={
                            <ChefHat
                                aria-hidden="true"
                                className="size-5"
                            />
                        }
                    >
                        <RecipeStepsDemo />
                    </RecipeFormSection>

                    <RecipeFormSection
                        id="additional-info"
                        number="08"
                        title="Información adicional"
                        description="Consejos, sustituciones, conservación, congelación, recalentado y procedencia."
                        icon={
                            <Info
                                aria-hidden="true"
                                className="size-5"
                            />
                        }
                    >
                        <RecipeAdditionalInfoDemo />
                    </RecipeFormSection>

                    <RecipeFormSection
                        id="allergens"
                        number="09"
                        title="Alérgenos"
                        description="Información orientativa sobre alérgenos presentes y posibles trazas."
                        icon={
                            <ShieldAlert
                                aria-hidden="true"
                                className="size-5"
                            />
                        }
                    >
                        <RecipeAllergensDemo />
                    </RecipeFormSection>

                    <RecipeFormSection
                        id="publication"
                        number="10"
                        title="Publicación"
                        description="Revisión final de requisitos y gestión del estado de la receta."
                        icon={
                            <Save
                                aria-hidden="true"
                                className="size-5"
                            />
                        }
                    >
                        <RecipePublicationDemo />
                    </RecipeFormSection>
                </div>
            </div>
        </div>
    );
}