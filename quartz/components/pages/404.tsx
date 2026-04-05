import { i18n } from "../../i18n"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

const NotFound: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
  // If baseUrl contains a pathname after the domain, use this as the home link
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  const baseDir = url.pathname

  return (
    <article class="popover-hint">
      <h1>This note hasn&apos;t been made yet.</h1>
      <a href={baseDir} data-router-ignore>
        {i18n(cfg.locale).pages.error.home}
      </a>
    </article>
  )
}

export default (() => NotFound) satisfies QuartzComponentConstructor
