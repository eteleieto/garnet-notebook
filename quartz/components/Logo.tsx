import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { joinSegments, pathToRoot } from "../util/path"

const Logo: QuartzComponent = ({ cfg, fileData }: QuartzComponentProps) => {
  const homeHref = "/"
  const baseDir = fileData.slug === "404" ? "/" : pathToRoot(fileData.slug!)
  const logoLightPath = joinSegments(baseDir, "static/logo-light.svg")
  const logoDarkPath = joinSegments(baseDir, "static/logo-dark.svg")
  
  return (
    <a href={homeHref} aria-label={cfg.pageTitle} class="site-logo">
      <img class="logo-light" src={logoLightPath} alt={cfg.pageTitle} />
      <img class="logo-dark" src={logoDarkPath} alt={cfg.pageTitle} />
    </a>
  )
}

Logo.css = `
.site-logo {
  display: inline-flex;
  align-items: center;
  transition: opacity 0.3s ease;
}

.site-logo:hover {
  opacity: 0.7;
}

.site-logo img {
  height: 50px;
  width: auto;
  display: block;
  transition: filter 0.3s ease;
}

.site-logo:hover img {
  filter: brightness(0.8);
}

/* Mobile adjustments */
@media all and (max-width: 800px) {
  .site-logo img {
    height: 30px;
  }
  
  /* Hide logo in sidebar on mobile (it's now in header) */
  .sidebar.left .site-logo {
    display: none;
  }
  
  /* Mobile header layout - logo inline with controls */
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0.25rem 0.25rem 1rem; /* Left padding stays, right padding reduced */
    background-color: transparent;
    margin: 0;
    position: relative;
    top: 0.5rem;
    margin-bottom: -1rem;
  }
  
  header .flex-component {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
  }
  
  /* Logo in header on mobile */
  header .site-logo {
    margin-left: -1rem;
    order: 0;
  }

  /* Flex container stretches */
  header .flex-component {
    flex: 1 1 auto;
    gap: 0.5rem;
    justify-content: flex-start;
  }
  /* Push controls to the far right */
  header .flex-component > :last-child {
    margin-right: 0;
  }
  
  /* Adjust mobile page header */
  .page-header {
    padding: 0.25rem 1rem;
    margin: 0;
  }
  
  /* Reduce top spacing on mobile */
  .page > #quartz-body {
    margin: 0;
    padding: 0;
  }
  
  /* Remove any default body margins on mobile */
  body {
    margin: 0;
    padding: 0;
  }
}

/* Light mode: show dark logo, hide light logo */
.site-logo .logo-light { display: none; }
.site-logo .logo-dark { display: block; }

/* Dark mode: show light logo, hide dark logo */
:root[saved-theme="dark"] .site-logo .logo-light { display: block; }
:root[saved-theme="dark"] .site-logo .logo-dark { display: none; }
`

export default (() => Logo) satisfies QuartzComponentConstructor


