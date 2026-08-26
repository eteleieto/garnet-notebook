import { readFileSync } from "node:fs"
import { joinSegments, QUARTZ } from "./path"
import { SocialImageOptions } from "./og"
import { getFontSpecificationName } from "./theme"

const paperPath = joinSegments(QUARTZ, "static", "paper.png")
const paperTexture = `data:image/png;base64,${readFileSync(paperPath).toString("base64")}`

export const garnetOgImage: SocialImageOptions["imageStructure"] = ({ cfg, title }) => {
  const headerFont = getFontSpecificationName(cfg.theme.typography.header)
  const titleSize = title.length > 70 ? 42 : title.length > 42 ? 50 : 58

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        color: "#332e2a",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage: `url(${paperTexture})`,
          backgroundRepeat: "repeat",
          backgroundSize: "500px 593px",
          opacity: 0.25,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "42px",
          left: "52px",
          display: "flex",
          fontFamily: "Recovered",
          fontSize: 32,
          fontStyle: "italic",
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: "0.05em",
          color: "#332e2a",
          opacity: 0.75,
        }}
      >
        GARNET
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "900px",
          padding: "56px",
          fontFamily: headerFont,
          fontSize: titleSize,
          fontWeight: 400,
          lineHeight: 1.15,
          letterSpacing: "0.1em",
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
    </div>
  )
}
