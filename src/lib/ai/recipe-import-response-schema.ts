const nullableString = {
  anyOf: [
    {
      type:
        "string",
    },
    {
      type:
        "null",
    },
  ],
};


const nullableNumber = {
  anyOf: [
    {
      type:
        "number",
    },
    {
      type:
        "null",
    },
  ],
};


const nullableInteger = {
  anyOf: [
    {
      type:
        "integer",
    },
    {
      type:
        "null",
    },
  ],
};


export const RECIPE_IMPORT_RESPONSE_SCHEMA =
  {
    type:
      "object",

    properties: {
      version: {
        type:
          "integer",

        enum: [
          1,
        ],
      },

      title:
        nullableString,

      shortDescription:
        nullableString,

      introduction:
        nullableString,

      baseServings:
        nullableInteger,

      difficulty: {
        anyOf: [
          {
            type:
              "string",

            enum: [
              "easy",
              "medium",
              "hard",
            ],
          },

          {
            type:
              "null",
          },
        ],
      },

      preparationMinutes:
        nullableInteger,

      cookingMinutes:
        nullableInteger,

      additionalMinutes:
        nullableInteger,

      ingredientGroups: {
        type:
          "array",

        items: {
          type:
            "object",

          properties: {
            name:
              nullableString,

            ingredients: {
              type:
                "array",

              items: {
                type:
                  "object",

                properties: {
                  quantity:
                    nullableNumber,

                  unit:
                    nullableString,

                  name: {
                    type:
                      "string",
                  },

                  notes:
                    nullableString,

                  scalable: {
                    type:
                      "boolean",
                  },
                },

                required: [
                  "quantity",
                  "unit",
                  "name",
                  "notes",
                  "scalable",
                ],

                additionalProperties:
                  false,
              },
            },
          },

          required: [
            "name",
            "ingredients",
          ],

          additionalProperties:
            false,
        },
      },

      steps: {
        type:
          "array",

        items: {
          type:
            "object",

          properties: {
            title:
              nullableString,

            instructions: {
              type:
                "string",
            },

            durationMinutes:
              nullableInteger,

            tip:
              nullableString,
          },

          required: [
            "title",
            "instructions",
            "durationMinutes",
            "tip",
          ],

          additionalProperties:
            false,
        },
      },

      allergens: {
        type:
          "array",

        items: {
          type:
            "object",

          properties: {
            name: {
              type:
                "string",
            },

            presence: {
              type:
                "string",

              enum: [
                "present",
                "possible",
              ],
            },

            explicitlyMentioned: {
              type:
                "boolean",
            },
          },

          required: [
            "name",
            "presence",
            "explicitlyMentioned",
          ],

          additionalProperties:
            false,
        },
      },

      classification: {
        type:
          "object",

        properties: {
          recipeType:
            nullableString,

          categories: {
            type:
              "array",

            items: {
              type:
                "string",
            },
          },

          tags: {
            type:
              "array",

            items: {
              type:
                "string",
            },
          },
        },

        required: [
          "recipeType",
          "categories",
          "tags",
        ],

        additionalProperties:
          false,
      },

      source: {
        type:
          "object",

        properties: {
          type: {
            anyOf: [
              {
                type:
                  "string",

                enum: [
                  "own",
                  "family",
                  "book",
                  "magazine",
                  "web",
                  "handwritten",
                  "other",
                ],
              },

              {
                type:
                  "null",
              },
            ],
          },

          title:
            nullableString,

          author:
            nullableString,

          page:
            nullableString,

          url:
            nullableString,

          notes:
            nullableString,
        },

        required: [
          "type",
          "title",
          "author",
          "page",
          "url",
          "notes",
        ],

        additionalProperties:
          false,
      },

      rawText:
        nullableString,

      confidence: {
        type:
          "string",

        enum: [
          "high",
          "medium",
          "low",
        ],
      },

      uncertainFields: {
        type:
          "array",

        items: {
          type:
            "string",
        },
      },

      warnings: {
        type:
          "array",

        items: {
          type:
            "string",
        },
      },
    },

    required: [
      "version",
      "title",
      "shortDescription",
      "introduction",
      "baseServings",
      "difficulty",
      "preparationMinutes",
      "cookingMinutes",
      "additionalMinutes",
      "ingredientGroups",
      "steps",
      "allergens",
      "classification",
      "source",
      "rawText",
      "confidence",
      "uncertainFields",
      "warnings",
    ],

    additionalProperties:
      false,
  } as const;