import { z } from "zod";


function normalizeOptionalText(
  value: unknown,
) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized =
    value.trim();

  return normalized === ""
    ? undefined
    : normalized;
}


function normalizeUsername(
  value: unknown,
) {
  if (typeof value !== "string") {
    return value;
  }

  return value
    .trim()
    .toLowerCase();
}


function normalizeEmail(
  value: unknown,
) {
  if (typeof value !== "string") {
    return value;
  }

  return value
    .trim()
    .toLowerCase();
}


export const registerSchema =
  z
    .object({
      displayName:
        z.preprocess(
          normalizeOptionalText,
          z
            .string()
            .min(
              2,
              "El nombre visible debe tener al menos 2 caracteres.",
            )
            .max(
              120,
              "El nombre visible no puede superar los 120 caracteres.",
            )
            .optional(),
        ),

      username:
        z.preprocess(
          normalizeUsername,
          z
            .string()
            .min(
              3,
              "El nombre de usuario debe tener al menos 3 caracteres.",
            )
            .max(
              30,
              "El nombre de usuario no puede superar los 30 caracteres.",
            )
            .regex(
              /^[a-z0-9_]+$/,
              "El nombre de usuario solo puede contener letras, números y guiones bajos.",
            ),
        ),

      email:
        z.preprocess(
          normalizeEmail,
          z
            .string()
            .email(
              "Introduce un correo electrónico válido.",
            ),
        ),

      password:
        z
          .string()
          .min(
            8,
            "La contraseña debe tener al menos 8 caracteres.",
          )
          .max(
            72,
            "La contraseña no puede superar los 72 caracteres.",
          ),

      confirmPassword:
        z
          .string()
          .min(
            1,
            "Confirma tu contraseña.",
          ),
    })
    .superRefine(
      (
        data,
        context,
      ) => {
        if (
          data.password !==
          data.confirmPassword
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode.custom,

            path: [
              "confirmPassword",
            ],

            message:
              "Las contraseñas no coinciden.",
          });
        }
      },
    );


export type RegisterInput =
  z.infer<
    typeof registerSchema
  >;
