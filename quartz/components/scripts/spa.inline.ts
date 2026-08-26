import { normalizeRelativeURLs } from "../../util/path"
import { fetchCanonical } from "./util"

// Sliding Panes Router Implementation

// Cleanup system for event listeners (required by all Quartz components)
const cleanupFns: Set<(...args: any[]) => void> = new Set()
window.addCleanup = (fn) => cleanupFns.add(fn)

const CONTAINER_SELECTOR = ".center"
const PANE_SELECTOR = ".sliding-pane"
const PANE_WIDTH = 40 // px, width of the spine
const MOBILE_BREAKPOINT = 800

function getContainer() {
  return document.querySelector(CONTAINER_SELECTOR)
}

function getPanes() {
  const container = getContainer()
  return container ? Array.from(container.querySelectorAll(PANE_SELECTOR)) : []
}

function isMobile() {
  return window.innerWidth <= MOBILE_BREAKPOINT
}

function isHomeSlug(slug?: string) {
  const normalized = slug?.toLowerCase()
  return (
    normalized === "index" || normalized === "index.html" || normalized === "" || normalized === "/"
  )
}

// True while panes from a ?stacked= URL are still being fetched, so we don't
// briefly flash the solo reading view before the stack is restored.
let restoringStack = false

// A single pane (e.g. a link shared from mobile, with no ?stacked=) reads as a
// full-width reading view instead of one narrow column pinned to the left.
function updateSoloState() {
  const container = getContainer()
  if (!container) return
  const panes = getPanes()
  const onlyPane = panes.length === 1 ? (panes[0] as HTMLElement) : undefined
  // The homepage keeps its own layout - reading view is for note pages only.
  const solo =
    !isMobile() && !restoringStack && panes.length <= 1 && !isHomeSlug(onlyPane?.dataset.slug)
  container.classList.toggle("solo-pane", solo)
}

// Custom horizontal-only scroll function to avoid vertical displacement from scrollIntoView
function scrollPaneIntoView(pane: Element, behavior: ScrollBehavior = "smooth") {
  const container = getContainer() as HTMLElement
  if (!container || !pane) return

  // On mobile the panes are a vertical column with only the last one shown, so
  // there is nothing to scroll horizontally - just return to the top of the note.
  if (isMobile()) {
    container.scrollTo({ left: 0, top: 0, behavior })
    window.scrollTo({ top: 0, behavior })
    return
  }

  const panes = getPanes()
  const paneIndex = panes.indexOf(pane)
  if (paneIndex === -1) return

  // Compute the natural horizontal position of the pane (sum of prior pane widths),
  // then offset by the sticky spine widths so earlier spines remain visible.
  let targetLeft = 0
  for (let i = 0; i < paneIndex; i++) {
    targetLeft += (panes[i] as HTMLElement).offsetWidth
  }
  targetLeft = targetLeft - paneIndex * PANE_WIDTH

  const maxLeft = container.scrollWidth - container.clientWidth
  const clampedLeft = Math.max(0, Math.min(targetLeft, maxLeft))

  container.scrollTo({
    left: clampedLeft,
    top: 0,
    behavior: behavior,
  })
}

function updatePanePositions() {
  const panes = getPanes()
  panes.forEach((pane, index) => {
    const p = pane as HTMLElement
    // Set sticky left position
    p.style.left = `${index * PANE_WIDTH}px`
    // Ensure z-index is correct so later panes slide over earlier ones
    p.style.zIndex = `${5 + index}`
  })

  updateSoloState()

  // Check obscured state immediately after position update
  checkObscured()
}

function createSpine(doc: Document | HTMLElement, title?: string) {
  const fileTitle =
    doc instanceof Document ? doc.body?.dataset?.fileTitle : (doc as HTMLElement).dataset?.fileTitle
  const slug =
    doc instanceof Document ? doc.body?.dataset?.slug : (doc as HTMLElement).dataset?.slug
  const isHome = isHomeSlug(slug)
  const spine = document.createElement("div")
  spine.className = "sliding-pane-spine"
  spine.innerText =
    (isHome ? "HOME" : fileTitle) || doc.querySelector("h1")?.innerText || title || "Untitled"
  spine.onclick = (e) => {
    e.stopPropagation()
    const pane = (e.target as HTMLElement).closest(PANE_SELECTOR)
    if (pane) scrollPaneIntoView(pane)
  }
  return spine
}

function checkObscured() {
  const container = getContainer() as HTMLElement
  if (!container) return

  const panes = getPanes()

  panes.forEach((pane, index) => {
    const p = pane as HTMLElement
    const rect = p.getBoundingClientRect()

    let isObscured = false
    if (index < panes.length - 1) {
      const nextPane = panes[index + 1] as HTMLElement
      const nextRect = nextPane.getBoundingClientRect()

      const visibleWidth = nextRect.left - rect.left

      if (visibleWidth < 150) {
        isObscured = true
      }
    }

    if (isObscured) {
      p.classList.add("obscured")
    } else {
      p.classList.remove("obscured")
    }
  })
}

// Helper to determine if a URL is local and should be handled
// Copied from original spa.inline.ts
const isLocalUrl = (href: string) => {
  try {
    const url = new URL(href)
    if (window.location.origin === url.origin) {
      return true
    }
  } catch (e) { }
  return false
}

// Update the URL to reflect current stack
function updateUrlState() {
  const panes = getPanes()
  if (panes.length === 0) return

  // Store stacked slugs in URL
  const stackedSlugs = panes
    .slice(1)
    .map((p) => (p as HTMLElement).dataset.slug)
    .filter(Boolean)
  const url = new URL(window.location.href)

  if (stackedSlugs.length > 0) {
    url.searchParams.set("stacked", stackedSlugs.join(","))
  } else {
    url.searchParams.delete("stacked")
  }

  history.pushState({}, "", url.toString())
}

// Revisiting a note that is already open. On desktop it is still on screen, so
// scrolling back to it is enough. On mobile only the last pane is displayed, so
// scrolling is a no-op and the tap would appear to do nothing - drop the panes
// stacked above it instead, which walks the stack (and the URL) back to it.
function revealExistingPane(existing: Element, scroll: boolean) {
  // Not while a ?stacked= URL is still being rebuilt - the panes above are the
  // stack being restored, not a chain the reader navigated past.
  if (isMobile() && !restoringStack) {
    const panes = getPanes()
    const index = panes.indexOf(existing)
    if (index !== -1) {
      panes.slice(index + 1).forEach((p) => p.remove())
      updatePanePositions()
      updateUrlState()
    }
  }
  if (scroll) scrollPaneIntoView(existing)
}

async function appendPane(url: URL, scroll: boolean = true, replaceFromIndex?: number) {
  const container = getContainer()
  if (!container) return

  let panes = getPanes()

  // Prune panes if replaceFromIndex is provided
  if (replaceFromIndex !== undefined && replaceFromIndex >= 0 && replaceFromIndex < panes.length) {
    const panesToRemove = panes.slice(replaceFromIndex + 1)
    panesToRemove.forEach((p) => p.remove())
    panes = getPanes()
  }

  // Optimistic check using URL
  const existing = panes.find((p) => (p as HTMLElement).dataset.url === url.href)
  if (existing) {
    revealExistingPane(existing, scroll)
    return
  }

  // Fetch content
  try {
    const res = await fetchCanonical(url)
    if (!res.ok) throw new Error("Failed to load")

    const text = await res.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, "text/html")
    normalizeRelativeURLs(doc, url)

    const newContent = doc.querySelector(PANE_SELECTOR)
    if (!newContent) {
      console.warn("No sliding pane content found in response")
      window.location.assign(url)
      return
    }

    const newPane = newContent.cloneNode(true) as HTMLElement

    // Set metadata on pane
    const pageSlug = doc.body.dataset.slug
    newPane.dataset.slug = pageSlug
    newPane.dataset.url = url.href

    // Check for duplicates by slug after fetch (authoritative)
    const existingBySlug = panes.find((p) => (p as HTMLElement).dataset.slug === pageSlug)
    if (existingBySlug) {
      revealExistingPane(existingBySlug, scroll)
      return
    }

    // Add spine - PREPEND so it comes before content in Flex
    const title = doc.title || doc.querySelector("h1")?.innerText
    const spine = createSpine(doc, title)
    newPane.prepend(spine)

    container.appendChild(newPane)
    updatePanePositions() // Update sticky offsets

    const event = new CustomEvent("nav", { detail: { url: pageSlug } })
    document.dispatchEvent(event)

    if (scroll) {
      scrollPaneIntoView(newPane)
    }

    updateUrlState()
  } catch (e) {
    console.error(e)
    window.location.assign(url)
  }
}

// Initialize
function init() {
  if (typeof window === "undefined") return

  // Set initial pane attributes
  const container = getContainer()
  const initialPane = container?.querySelector(PANE_SELECTOR) as HTMLElement
  if (initialPane) {
    initialPane.dataset.slug = document.body.dataset.slug
    initialPane.dataset.url = window.location.href

    const spine = createSpine(document)
    initialPane.prepend(spine) // Prepended here too

    updatePanePositions()

    const event = new CustomEvent("nav", { detail: { url: document.body.dataset.slug } })
    document.dispatchEvent(event)
  }

  // Load stacked panes from URL. This runs on mobile as well: only the last pane
  // is visible there, but keeping the whole stack in the DOM (and in the URL) is
  // what lets a narrow window widen back into the full sliding view.
  {
    const params = new URLSearchParams(window.location.search)
    const stacked = params.get("stacked")
    if (stacked) {
      const slugs = stacked.split(",")
      restoringStack = true
      container?.classList.add("restoring-stack")
      updateSoloState()
      const loadStacked = async () => {
        for (const slug of slugs) {
          const url = new URL(slug, window.location.origin)
          await appendPane(url, false)
        }
        restoringStack = false
        container?.classList.remove("restoring-stack")
        updateSoloState()
        const panes = getPanes()
        if (panes.length > 0) {
          scrollPaneIntoView(panes[panes.length - 1], "instant")
        }
      }
      loadStacked()
    }
  }

  // Scroll Listener for Obscured State
  const containerEl = getContainer()
  if (containerEl) {
    containerEl.addEventListener(
      "scroll",
      () => {
        checkObscured()
      },
      { passive: true },
    )
    // Widening past the breakpoint turns the single visible pane back into the
    // full sliding stack, so bring the deepest pane into view. The breakpoint
    // check is debounced: a drag fires resize continuously, and acting on every
    // tick would both thrash and let a transient width consume the crossing.
    let wasMobile = isMobile()
    let breakpointTimer: ReturnType<typeof setTimeout> | undefined
    window.addEventListener(
      "resize",
      () => {
        updateSoloState()
        checkObscured()
        clearTimeout(breakpointTimer)
        breakpointTimer = setTimeout(() => {
          const nowMobile = isMobile()
          if (wasMobile === nowMobile) return
          wasMobile = nowMobile
          if (nowMobile) return
          updatePanePositions()
          const panes = getPanes()
          if (panes.length > 0) {
            scrollPaneIntoView(panes[panes.length - 1], "instant")
          }
        }, 150)
      },
      { passive: true },
    )
  }

  // Event Listeners
  window.addEventListener("click", async (event) => {
    const target = event.target as Element
    const a = target.closest("a")
    if (!a) return

    // Ignore if special keys, target blank, or non-internal
    if (event.ctrlKey || event.metaKey || a.target === "_blank") return
    if (!isLocalUrl(a.href)) return
    if ("routerIgnore" in a.dataset) return

    const url = new URL(a.href)

    if (url.pathname === window.location.pathname && url.hash) {
      return // Let browser handle hash
    }

    if (url.href === window.location.href) {
      event.preventDefault()
      return
    }

    event.preventDefault()

    // Find which pane this click came from
    const sourcePane = a.closest(PANE_SELECTOR)
    let replaceIndex = undefined
    if (sourcePane) {
      const panes = getPanes()
      replaceIndex = panes.indexOf(sourcePane as Element)
    }

    await appendPane(url, true, replaceIndex)
  })

  // Popstate
  window.addEventListener("popstate", () => {
    window.location.reload()
  })

  // Expose for debugging
  window.spaNavigate = (url) =>
    appendPane(url instanceof URL ? url : new URL(url, window.location.origin))

  // Initial check
  updateSoloState()
  checkObscured()
}

init()
