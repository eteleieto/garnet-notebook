import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import OverflowListFactory from "./OverflowList"
import { classNames } from "../util/lang"

// @ts-ignore
import script from "./scripts/explorer.inline"

interface Options {
  title?: string
  folderDefaultState: "collapsed" | "open"
  folderClickBehavior: "collapse" | "link"
  useSavedState: boolean
  sortFn: (a: any, b: any) => number
  filterFn: (node: any) => boolean
  mapFn: (node: any) => any
  order: ("filter" | "map" | "sort")[]
}

const defaultOptions: Options = {
  folderDefaultState: "collapsed",
  folderClickBehavior: "collapse",
  useSavedState: true,
  sortFn: (a, b) => {
    // Sort order: folders first, then files. Sort folders and files alphabetically
    if ((!a.file && !b.file) || (a.file && b.file)) {
      // numeric: true: Whether numeric collation should be used, such that "1" < "2" < "10"
      // sensitivity: "base": Only strings that differ in base letters compare as unequal. Examples: a ≠ b, a = á, a = A
      return a.displayName.localeCompare(b.displayName, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    }
    if (a.file && !b.file) {
      return 1
    } else {
      return -1
    }
  },
  filterFn: (node) => node.name !== "tags",
  mapFn: (node) => node,
  order: ["filter", "map", "sort"],
}

let numExplorers = 0
export default ((userOpts?: Partial<Options>) => {
  const opts: Options = { ...defaultOptions, ...userOpts }
  const { OverflowList, overflowListAfterDOMLoaded } = OverflowListFactory()

  const MobileFooterExplorer: QuartzComponent = ({ cfg, displayClass }: QuartzComponentProps) => {
    const id = `mobile-footer-explorer-${numExplorers++}`

    return (
      <div
        class={classNames(displayClass, "mobile-footer-explorer")}
        data-behavior={opts.folderClickBehavior}
        data-collapsed={opts.folderDefaultState}
        data-savestate={opts.useSavedState}
        data-tree={JSON.stringify({})}
        data-dataFns={JSON.stringify({
          order: opts.order,
          sortFn: opts.sortFn.toString(),
          filterFn: opts.filterFn.toString(),
          mapFn: opts.mapFn.toString(),
        })}
      >
        <h3>{opts.title ?? "Notes"}</h3>
        <div id={id} class="mobile-footer-explorer-content">
          <OverflowList class="explorer-ul" />
        </div>
        <template id="template-file">
          <li>
            <a href="" data-for="">
              <span class="file-name"></span>
            </a>
          </li>
        </template>
        <template id="template-folder">
          <li>
            <div class="folder-container">
              <button class="folder-button" data-folderpath="">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="5 8 14 8"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="folder-icon"
                >
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
                <span class="folder-name"></span>
              </button>
              <div class="folder-outer">
                <ul style="padding-left: 1rem;"></ul>
              </div>
            </div>
          </li>
        </template>
      </div>
    )
  }

  MobileFooterExplorer.css = `
  .mobile-footer-explorer {
    display: none;
  }

  @media all and (max-width: 800px) {
    .mobile-footer-explorer {
      display: block;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--lightgray);
    }

    .mobile-footer-explorer h3 {
      margin: 0 0 1rem 0;
      font-size: 1.2rem;
      color: var(--dark);
    }

    .mobile-footer-explorer .explorer-ul {
      list-style: none;
      overflow: visible;
      max-height: none;
      padding: 0;
      margin: 0;
    }

    .mobile-footer-explorer .folder-container {
      margin-bottom: 0.5rem;
    }

    .mobile-footer-explorer .folder-button {
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0;
      color: var(--dark);
      font-size: 0.9rem;
    }

    .mobile-footer-explorer .folder-icon {
      transition: transform 0.2s ease;
    }

    .mobile-footer-explorer .folder-container[data-folderpath].collapsed .folder-icon {
      transform: rotate(-90deg);
    }

    .mobile-footer-explorer .folder-outer {
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    .mobile-footer-explorer .folder-container.collapsed .folder-outer {
      max-height: 0;
    }

    .mobile-footer-explorer .folder-container:not(.collapsed) .folder-outer {
      max-height: 1000px;
    }

    .mobile-footer-explorer a {
      display: block;
      padding: 0.25rem 0;
      color: var(--darkgray);
      text-decoration: none;
      font-size: 0.9rem;
    }

    .mobile-footer-explorer a:hover {
      color: var(--secondary);
    }

    .mobile-footer-explorer a.active {
      color: var(--secondary);
      font-weight: 600;
    }
  }
  `

  MobileFooterExplorer.afterDOMLoaded = script
  return MobileFooterExplorer
}) satisfies QuartzComponentConstructor
