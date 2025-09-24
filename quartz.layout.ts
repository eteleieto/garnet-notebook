import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    Component.MobileOnly(Component.Flex({
      components: [
        { Component: Component.Logo() },
        { Component: Component.Spacer() },
        { Component: Component.Spacer() },
        { Component: Component.Spacer() }, 
        { Component: Component.Spacer() }, 
        {
          Component: Component.Search(),
          grow: false,
        },
        { Component: Component.Darkmode() },
      ],
    }))
  ],
  afterBody: [Component.MobileOnly(Component.MobileFooterExplorer())],
  footer: Component.Footer({
    links: {
      "@garnet.nyc": "https://instagram.com/garnet.nyc",
      "garnet.nyc": "https://garnet.nyc",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta({ showReadingTime: false }),
    Component.TagList(),
  ],
  left: [
    Component.DesktopOnly(Component.Logo()),
    Component.MobileOnly(Component.Spacer()),
    Component.DesktopOnly(Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    })),
    Component.DesktopOnly(Component.Explorer()),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.DesktopOnly(Component.Logo()),
    Component.MobileOnly(Component.Spacer()),
    Component.DesktopOnly(Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    })),
    Component.DesktopOnly(Component.Explorer()),
  ],
  right: [],
}
