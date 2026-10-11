import "server-only";

import {
  getResendClient,
  getTransactionalEmailSender,
} from "@/lib/email/resend";


type RecipeSubmittedToAdminNotification = {
  recipeId:
    string;

  recipeTitle:
    string;

  authorDisplayName:
    string;

  authorUsername:
    string | null;

  adminRecipeUrl:
    string;
};


type RecipeReturnedToAuthorNotification = {
  authorEmail:
    string;

  authorDisplayName:
    string;

  recipeTitle:
    string;

  reviewNotes:
    string;

  editRecipeUrl:
    string;
};


type RecipeApprovedToAuthorNotification = {
  authorEmail:
    string;

  authorDisplayName:
    string;

  recipeTitle:
    string;

  publicRecipeUrl:
    string;
};


type EmailDetail = {
  label:
    string;

  value:
    string;
};


type EmailTemplateInput = {
  eyebrow:
    string;

  title:
    string;

  intro:
    string;

  details?:
    EmailDetail[];

  notice?:
    string;

  buttonLabel:
    string;

  buttonUrl:
    string;
};


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHtml(
  value:
    string,
) {
  return value
    .replaceAll(
      "&",
      "&amp;",
    )
    .replaceAll(
      "<",
      "&lt;",
    )
    .replaceAll(
      ">",
      "&gt;",
    )
    .replaceAll(
      "\"",
      "&quot;",
    )
    .replaceAll(
      "'",
      "&#039;",
    );
}


function preserveLineBreaks(
  value:
    string,
) {
  return escapeHtml(
    value,
  ).replaceAll(
    "\n",
    "<br>",
  );
}


/* =========================================================
   CONFIGURATION
========================================================= */

function getAdminEmail() {
  const email =
    process.env
      .COCIHUB_ADMIN_EMAIL
      ?.trim();


  if (!email) {
    throw new Error(
      "COCIHUB_ADMIN_EMAIL is not configured.",
    );
  }


  return email;
}


/* =========================================================
   EMAIL LAYOUT
========================================================= */

function createEmailHtml(
  input:
    EmailTemplateInput,
) {
  const detailsHtml =
    input.details
      ?.map(
        (
          detail,
        ) => `
          <div
            style="
              margin-bottom: 18px;
            "
          >
            <div
              style="
                margin-bottom: 6px;
                color: #888888;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
              "
            >
              ${escapeHtml(
                detail.label,
              )}
            </div>

            <div
              style="
                color: #393e46;
                font-size: 16px;
                font-weight: 700;
                line-height: 1.5;
              "
            >
              ${escapeHtml(
                detail.value,
              )}
            </div>
          </div>
        `,
      )
      .join(
        "",
      ) ??
    "";


  const detailsBlock =
    detailsHtml
      ? `
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            margin-bottom: 28px;
            background-color: #fff7f2;
            border: 1px solid #ffe0d2;
            border-radius: 12px;
          "
        >
          <tr>
            <td
              style="
                padding: 20px 20px 2px 20px;
              "
            >
              ${detailsHtml}
            </td>
          </tr>
        </table>
      `
      : "";


  const noticeBlock =
    input.notice
      ? `
        <div
          style="
            margin-bottom: 28px;
            padding: 18px;
            background-color: #fff7f2;
            border: 1px solid #ffe0d2;
            border-radius: 12px;
            color: #555555;
            font-size: 15px;
            line-height: 1.7;
          "
        >
          ${preserveLineBreaks(
            input.notice,
          )}
        </div>
      `
      : "";


  return `
    <!doctype html>

    <html lang="es">
      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f4f4f9;
          font-family: Arial, Helvetica, sans-serif;
          color: #2e2e2e;
        "
      >
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width: 100%;
            background-color: #f4f4f9;
            padding: 32px 16px;
          "
        >
          <tr>
            <td align="center">

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width: 100%;
                  max-width: 600px;
                  background-color: #ffffff;
                  border: 1px solid #e5e5e5;
                  border-radius: 20px;
                  overflow: hidden;
                "
              >

                <tr>
                  <td
                    align="center"
                    style="
                      background-color: #ff6f3c;
                      padding: 30px 24px;
                    "
                  >
                    <div
                      style="
                        margin-bottom: 10px;
                        font-size: 40px;
                        line-height: 1;
                      "
                    >
                      🍳
                    </div>

                    <div
                      style="
                        color: #ffffff;
                        font-size: 28px;
                        font-weight: 700;
                      "
                    >
                      CociHub
                    </div>

                    <div
                      style="
                        margin-top: 6px;
                        color: #ffffff;
                        font-size: 14px;
                      "
                    >
                      ${escapeHtml(
                        input.eyebrow,
                      )}
                    </div>
                  </td>
                </tr>


                <tr>
                  <td
                    style="
                      padding: 36px 32px;
                    "
                  >
                    <h1
                      style="
                        margin: 0 0 16px 0;
                        color: #393e46;
                        font-size: 25px;
                        line-height: 1.3;
                      "
                    >
                      ${escapeHtml(
                        input.title,
                      )}
                    </h1>


                    <p
                      style="
                        margin: 0 0 24px 0;
                        color: #555555;
                        font-size: 16px;
                        line-height: 1.7;
                      "
                    >
                      ${escapeHtml(
                        input.intro,
                      )}
                    </p>


                    ${detailsBlock}

                    ${noticeBlock}


                    <table
                      role="presentation"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                      align="center"
                    >
                      <tr>
                        <td
                          align="center"
                          bgcolor="#FF6F3C"
                          style="
                            border-radius: 12px;
                          "
                        >
                          <a
                            href="${escapeHtml(
                              input.buttonUrl,
                            )}"
                            style="
                              display: inline-block;
                              padding: 15px 28px;
                              background-color: #ff6f3c;
                              border-radius: 12px;
                              color: #ffffff;
                              font-size: 16px;
                              font-weight: 700;
                              line-height: 1;
                              text-decoration: none;
                            "
                          >
                            ${escapeHtml(
                              input.buttonLabel,
                            )}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>


                <tr>
                  <td
                    align="center"
                    style="
                      padding: 24px 32px;
                      background-color: #393e46;
                    "
                  >
                    <p
                      style="
                        margin: 0 0 8px 0;
                        color: #ffffff;
                        font-size: 14px;
                        font-weight: 700;
                      "
                    >
                      CociHub
                    </p>

                    <p
                      style="
                        margin: 0;
                        color: #dddddd;
                        font-size: 12px;
                        line-height: 1.6;
                      "
                    >
                      Comer es un placer,
                      cocinar un privilegio,<br>
                      enseñar una responsabilidad.
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}


/* =========================================================
   SEND EMAIL
========================================================= */

async function sendTransactionalEmail(
  input: {
    to:
      string;

    subject:
      string;

    text:
      string;

    html:
      string;
  },
) {
  const resend =
    getResendClient();


  const from =
    getTransactionalEmailSender();


  const {
    error,
  } =
    await resend.emails.send({
      from,

      to:
        input.to,

      subject:
        input.subject,

      text:
        input.text,

      html:
        input.html,
    });


  if (error) {
    throw new Error(
      `Resend could not send the transactional email: ${error.message}`,
    );
  }
}


/* =========================================================
   RECIPE SUBMITTED → ADMIN
========================================================= */

export async function sendRecipeSubmittedToAdminNotification(
  input:
    RecipeSubmittedToAdminNotification,
) {
  const authorText =
    input.authorUsername
      ? `${input.authorDisplayName} (@${input.authorUsername})`
      : input.authorDisplayName;


  await sendTransactionalEmail({
    to:
      getAdminEmail(),

    subject:
      `Nueva receta pendiente de revisión: ${input.recipeTitle}`,

    text: [
      "Nueva receta pendiente de revisión",
      "",
      `Receta: ${input.recipeTitle}`,
      `Autor: ${authorText}`,
      "",
      "Puedes revisarla desde el panel de administración:",
      input.adminRecipeUrl,
    ].join(
      "\n",
    ),

    html:
      createEmailHtml({
        eyebrow:
          "Panel de moderación",

        title:
          "Nueva receta pendiente de revisión",

        intro:
          "Un miembro de la comunidad ha enviado una receta para que sea revisada por el equipo de CociHub.",

        details: [
          {
            label:
              "Receta",

            value:
              input.recipeTitle,
          },
          {
            label:
              "Autor",

            value:
              authorText,
          },
        ],

        buttonLabel:
          "Revisar receta",

        buttonUrl:
          input.adminRecipeUrl,
      }),
  });
}


/* =========================================================
   RECIPE RETURNED → AUTHOR
========================================================= */

export async function sendRecipeReturnedToAuthorNotification(
  input:
    RecipeReturnedToAuthorNotification,
) {
  await sendTransactionalEmail({
    to:
      input.authorEmail,

    subject:
      `Tu receta necesita algunos cambios: ${input.recipeTitle}`,

    text: [
      `Hola ${input.authorDisplayName},`,
      "",
      `Hemos revisado tu receta "${input.recipeTitle}".`,
      "",
      "Antes de publicarla necesitamos que realices algunos cambios:",
      "",
      input.reviewNotes,
      "",
      "Puedes volver a editarla desde:",
      input.editRecipeUrl,
    ].join(
      "\n",
    ),

    html:
      createEmailHtml({
        eyebrow:
          "Revisión de recetas",

        title:
          "Tu receta necesita algunos cambios",

        intro:
          `Hola ${input.authorDisplayName}. Hemos revisado tu receta y queremos que hagas unas pequeñas correcciones antes de publicarla.`,

        details: [
          {
            label:
              "Receta",

            value:
              input.recipeTitle,
          },
        ],

        notice:
          input.reviewNotes,

        buttonLabel:
          "Corregir mi receta",

        buttonUrl:
          input.editRecipeUrl,
      }),
  });
}


/* =========================================================
   RECIPE APPROVED → AUTHOR
========================================================= */

export async function sendRecipeApprovedToAuthorNotification(
  input:
    RecipeApprovedToAuthorNotification,
) {
  await sendTransactionalEmail({
    to:
      input.authorEmail,

    subject:
      `🎉 Tu receta ya está publicada: ${input.recipeTitle}`,

    text: [
      `Hola ${input.authorDisplayName},`,
      "",
      `¡Buenas noticias! Tu receta "${input.recipeTitle}" ha sido aprobada.`,
      "",
      "Ya está publicada y disponible para toda la comunidad de CociHub.",
      "",
      "Puedes verla aquí:",
      input.publicRecipeUrl,
    ].join(
      "\n",
    ),

    html:
      createEmailHtml({
        eyebrow:
          "Tu receta ya está en CociHub",

        title:
          "¡Tu receta ha sido publicada! 🎉",

        intro:
          `Hola ${input.authorDisplayName}. Tu receta ha superado la revisión y ya forma parte de CociHub.`,

        details: [
          {
            label:
              "Receta",

            value:
              input.recipeTitle,
          },
        ],

        buttonLabel:
          "Ver receta publicada",

        buttonUrl:
          input.publicRecipeUrl,
      }),
  });
}