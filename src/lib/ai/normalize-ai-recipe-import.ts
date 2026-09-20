import type {
  AiRecipeImport,
} from "@/schemas/ai-recipe-import-schema";


/*
 * Caracteres que consideramos letras
 * para detectar textos completamente
 * escritos en mayúsculas o minúsculas.
 */
const LETTER_PATTERN =
  /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g;


const FIRST_LETTER_PATTERN =
  /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/;


/*
 * Acrónimos culinarios habituales que
 * queremos conservar en mayúsculas.
 *
 * Podemos ampliar esta lista en el
 * futuro si encontramos otros casos
 * reales durante el uso de CociHub.
 */
const PRESERVED_ACRONYMS =
  new Set([
    "AOVE",
    "BBQ",
    "MSG",
  ]);


/*
 * Limpia espacios innecesarios sin
 * destruir saltos de línea existentes.
 *
 * No reorganizamos párrafos:
 * eso pertenece a otra mejora futura.
 */
function normalizeSpacing(
  value:
    string,
) {
  return value
    .replace(
      /\r\n/g,
      "\n",
    )
    .split(
      "\n",
    )
    .map(
      (
        line,
      ) =>
        line
          .trim()
          .replace(
            /[ \t]+/g,
            " ",
          ),
    )
    .join(
      "\n",
    )
    .trim();
}


/*
 * Devuelve únicamente las letras de un
 * texto para poder comprobar si la fuente
 * original estaba completamente en
 * mayúsculas o completamente en minúsculas.
 */
function getLetters(
  value:
    string,
) {
  return (
    value.match(
      LETTER_PATTERN,
    )?.join(
      "",
    ) ??
    ""
  );
}


/*
 * Pone en mayúscula la primera letra real
 * del texto.
 *
 * Esto permite manejar textos que comiencen
 * con números, símbolos, comillas, etc.
 */
function capitalizeFirstLetter(
  value:
    string,
) {
  return value.replace(
    FIRST_LETTER_PATTERN,
    (
      letter,
    ) =>
      letter.toLocaleUpperCase(
        "es-ES",
      ),
  );
}


/*
 * Normalización principal para títulos,
 * ingredientes, nombres de grupos,
 * títulos de pasos, etc.
 *
 * Ejemplos:
 *
 * "TARTA DE QUESO"
 * → "Tarta de queso"
 *
 * "tarta de queso"
 * → "Tarta de queso"
 *
 * "Salsa Worcestershire"
 * → "Salsa Worcestershire"
 *
 * Los textos que ya contienen una mezcla
 * razonable de mayúsculas/minúsculas se
 * conservan prácticamente intactos.
 */
function normalizeDisplayText(
  value:
    string,
) {
  const trimmed =
    normalizeSpacing(
      value,
    );


  if (
    !trimmed
  ) {
    return trimmed;
  }


  if (
    PRESERVED_ACRONYMS.has(
      trimmed,
    )
  ) {
    return trimmed;
  }


  const letters =
    getLetters(
      trimmed,
    );


  if (
    !letters
  ) {
    return trimmed;
  }


  const allUppercase =
    letters ===
    letters.toLocaleUpperCase(
      "es-ES",
    );


  const allLowercase =
    letters ===
    letters.toLocaleLowerCase(
      "es-ES",
    );


  /*
   * Si toda la fuente está en mayúsculas
   * o minúsculas aplicamos sentence case.
   */
  if (
    allUppercase ||
    allLowercase
  ) {
    const lowercase =
      trimmed.toLocaleLowerCase(
        "es-ES",
      );


    return capitalizeFirstLetter(
      lowercase,
    );
  }


  /*
   * Si ya existe capitalización mixta,
   * suponemos que puede ser intencionada
   * y únicamente garantizamos una primera
   * letra correcta.
   */
  return capitalizeFirstLetter(
    trimmed,
  );
}


function normalizeOptionalText(
  value:
    string | null,
) {
  if (
    value ===
    null
  ) {
    return null;
  }


  const normalized =
    normalizeDisplayText(
      value,
    );


  return normalized ||
    null;
}


/*
 * Para metadatos cuya capitalización puede
 * ser significativa (autor, URL, título de
 * una fuente...) limpiamos únicamente
 * espacios.
 */
function normalizeSourceText(
  value:
    string | null,
) {
  if (
    value ===
    null
  ) {
    return null;
  }


  const normalized =
    normalizeSpacing(
      value,
    );


  return normalized ||
    null;
}


export function normalizeAiRecipeImport(
  recipe:
    AiRecipeImport,
): AiRecipeImport {
  return {
    ...recipe,


    title:
      normalizeOptionalText(
        recipe.title,
      ),


    shortDescription:
      normalizeOptionalText(
        recipe.shortDescription,
      ),


    introduction:
      normalizeOptionalText(
        recipe.introduction,
      ),


    ingredientGroups:
      recipe.ingredientGroups.map(
        (
          group,
        ) => ({
          ...group,


          name:
            normalizeOptionalText(
              group.name,
            ),


          ingredients:
            group.ingredients.map(
              (
                ingredient,
              ) => ({
                ...ingredient,


                name:
                  normalizeDisplayText(
                    ingredient.name,
                  ),


                /*
                 * La unidad se conserva porque
                 * su escritura puede tener
                 * significado:
                 *
                 * g
                 * ml
                 * cucharada
                 * unidad
                 */
                unit:
                  ingredient.unit
                    ? normalizeSpacing(
                        ingredient.unit,
                      )
                    : null,


                notes:
                  normalizeOptionalText(
                    ingredient.notes,
                  ),
              }),
            ),
        }),
      ),


    steps:
      recipe.steps.map(
        (
          step,
        ) => ({
          ...step,


          title:
            normalizeOptionalText(
              step.title,
            ),


          instructions:
            normalizeDisplayText(
              step.instructions,
            ),


          tip:
            normalizeOptionalText(
              step.tip,
            ),
        }),
      ),


    allergens:
      recipe.allergens.map(
        (
          allergen,
        ) => ({
          ...allergen,

          name:
            normalizeDisplayText(
              allergen.name,
            ),
        }),
      ),


    classification: {
      ...recipe.classification,


      recipeType:
        normalizeOptionalText(
          recipe.classification
            .recipeType,
        ),


      categories:
        recipe.classification
          .categories
          .map(
            normalizeDisplayText,
          ),


      tags:
        recipe.classification
          .tags
          .map(
            normalizeDisplayText,
          ),
    },


    source: {
      ...recipe.source,


      /*
       * La fuente se trata como información
       * bibliográfica y no como contenido
       * editorial de CociHub.
       */
      title:
        normalizeSourceText(
          recipe.source.title,
        ),


      author:
        normalizeSourceText(
          recipe.source.author,
        ),


      page:
        normalizeSourceText(
          recipe.source.page,
        ),


      url:
        normalizeSourceText(
          recipe.source.url,
        ),


      notes:
        normalizeSourceText(
          recipe.source.notes,
        ),
    },


    /*
     * rawText conserva deliberadamente
     * exactamente lo detectado por Gemini.
     *
     * Así siempre podemos comparar el
     * resultado normalizado con la fuente
     * original.
     */
    rawText:
      recipe.rawText,


    uncertainFields:
      recipe.uncertainFields.map(
        (
          field,
        ) =>
          normalizeSpacing(
            field,
          ),
      ),


    warnings:
      recipe.warnings.map(
        (
          warning,
        ) =>
          normalizeSpacing(
            warning,
          ),
      ),
  };
}