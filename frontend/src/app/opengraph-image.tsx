import { ImageResponse } from "next/og";

export const alt = "Demsew Andarge — Video Editor & Motion Storyteller";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{
      alignItems: "flex-start",
      background: "radial-gradient(ellipse at 75% 35%, #51402a, #151716 65%)",
      color: "#f0eee8",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      justifyContent: "space-between",
      padding: "76px",
      width: "100%",
    }}>
      <div style={{ color: "#e8a64c", fontSize: 22, letterSpacing: "0.22em" }}>DEMSEW ANDARGE</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ color: "#e8a64c", fontSize: 18, letterSpacing: "0.2em" }}>VIDEO EDITOR & MOTION STORYTELLER</div>
        <div style={{ fontFamily: "Georgia", fontSize: 88, letterSpacing: "-0.06em", lineHeight: 1 }}>Stories in motion.</div>
      </div>
      <div style={{ color: "#aaa89e", fontSize: 17, letterSpacing: "0.15em" }}>ETHIOPIA · INDEPENDENT CREATIVE STUDIO</div>
    </div>,
    size,
  );
}
