import { ImageResponse } from "next/og";
import { MARK } from "@/components/mark-geometry";

export const alt = "WOY Consulting. Win Over Yourself. Practitioner-led leadership advisory.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** A static brand card rendered at build time; no external image or font requests. */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#FBF9F7", color: "#14171D", padding: "58px 70px", flexDirection: "column", justifyContent: "space-between", borderTop: "10px solid #CD1421" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <svg width="220" height="118" viewBox="55 30 230 115">
            <g fill="none" stroke="#CD1421" strokeWidth={MARK.ringStroke} strokeLinecap="square" strokeLinejoin="miter">
              <path d={MARK.w} />
              <path d={MARK.yFork} />
              <path d={MARK.yStem} />
              <circle cx={MARK.cx} cy={MARK.cy} r={MARK.r} />
              <g strokeWidth={MARK.spokeStroke}>
                {MARK.spokes.map((d) => <path key={d} d={d} />)}
              </g>
            </g>
            <path d={MARK.needle} fill="#CD1421" />
          </svg>
          <span style={{ fontSize: 17, letterSpacing: 7, color: "#CD1421", marginLeft: 5 }}>CONSULTING</span>
        </div>
        <div style={{ display: "flex", color: "#4B525C", fontSize: 22 }}>Practitioner-led since 2015</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
        <div style={{ display: "flex", fontSize: 83, letterSpacing: -4, lineHeight: 1.06 }}>Win Over Yourself.</div>
        <div style={{ display: "flex", marginTop: 26, maxWidth: 1060, fontSize: 28, lineHeight: 1.45, color: "#4B525C" }}>
          Empowering leaders. Transforming organizations. Accelerating impact.
        </div>
      </div>
      <div style={{ display: "flex", width: "100%", paddingTop: 22, borderTop: "1px solid #D2C8BE", color: "#4B525C", fontSize: 20 }}>
        Leadership · Culture · Strategy · Execution
      </div>
    </div>,
    size
  );
}
