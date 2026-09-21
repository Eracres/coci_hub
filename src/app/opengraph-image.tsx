import {
  ImageResponse,
} from "next/og";

import {
  siteConfig,
} from "@/config/site";


export const alt =
  "CociHub — Recetas para cocinar, conservar y compartir";


export const size = {
  width:
    1200,

  height:
    630,
};


export const contentType =
  "image/png";


export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width:
            "100%",

          height:
            "100%",

          display:
            "flex",

          position:
            "relative",

          overflow:
            "hidden",

          backgroundColor:
            "#fff9f2",

          color:
            "#292522",

          padding:
            "72px",

          fontFamily:
            "sans-serif",
        }}
      >
        <div
          style={{
            position:
              "absolute",

            width:
              "420px",

            height:
              "420px",

            borderRadius:
              "9999px",

            backgroundColor:
              "#f4e9dc",

            top:
              "-160px",

            right:
              "-100px",
          }}
        />


        <div
          style={{
            position:
              "absolute",

            width:
              "380px",

            height:
              "380px",

            borderRadius:
              "9999px",

            backgroundColor:
              "#718c66",

            opacity:
              0.13,

            bottom:
              "-190px",

            left:
              "-90px",
          }}
        />


        <div
          style={{
            display:
              "flex",

            flexDirection:
              "column",

            justifyContent:
              "space-between",

            width:
              "100%",

            position:
              "relative",
          }}
        >
          <div
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap:
                "22px",
            }}
          >
            <div
              style={{
                width:
                  "76px",

                height:
                  "76px",

                borderRadius:
                  "22px",

                backgroundColor:
                  "#d95d39",

                color:
                  "#ffffff",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                fontSize:
                  "40px",

                fontWeight:
                  700,
              }}
            >
              C
            </div>


            <div
              style={{
                display:
                  "flex",

                alignItems:
                  "baseline",

                fontFamily:
                  "serif",

                fontSize:
                  "54px",

                fontWeight:
                  700,
              }}
            >
              <span>
                Coci
              </span>

              <span
                style={{
                  color:
                    "#d95d39",
                }}
              >
                Hub
              </span>
            </div>
          </div>


          <div
            style={{
              display:
                "flex",

              flexDirection:
                "column",

              maxWidth:
                "920px",
            }}
          >
            <div
              style={{
                fontFamily:
                  "serif",

                fontSize:
                  "62px",

                lineHeight:
                  1.12,

                fontWeight:
                  700,

                letterSpacing:
                  "-2px",
              }}
            >
              Recetas que merecen
              seguir pasando de una
              cocina a otra
            </div>


            <div
              style={{
                marginTop:
                  "28px",

                maxWidth:
                  "900px",

                fontSize:
                  "28px",

                lineHeight:
                  1.45,

                color:
                  "#4e6847",
              }}
            >
              {
                siteConfig.slogan
              }
            </div>
          </div>


          <div
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap:
                "12px",

              fontSize:
                "20px",

              fontWeight:
                600,

              color:
                "#6f675f",
            }}
          >
            <div
              style={{
                width:
                  "36px",

                height:
                  "5px",

                borderRadius:
                  "999px",

                backgroundColor:
                  "#e5a93d",
              }}
            />

            Cocinar · conservar · compartir
          </div>
        </div>
      </div>
    ),

    {
      width:
        size.width,

      height:
        size.height,
    },
  );
}