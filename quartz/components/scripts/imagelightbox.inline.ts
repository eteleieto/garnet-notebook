import { registerEscapeHandler } from "./util"

function setupImageLightbox() {
  // Create lightbox elements if they don't exist
  let lightbox = document.getElementById("image-lightbox") as HTMLDivElement | null
  if (!lightbox) {
    lightbox = document.createElement("div")
    lightbox.id = "image-lightbox"
    lightbox.innerHTML = `
      <div class="lightbox-backdrop"></div>
      <div class="lightbox-content">
        <img class="lightbox-image" src="" alt="" />
        <button class="lightbox-close" aria-label="Close lightbox">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <button class="lightbox-prev" aria-label="Previous image">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button class="lightbox-next" aria-label="Next image">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    `
    document.body.appendChild(lightbox)
  }

  const backdrop = lightbox.querySelector(".lightbox-backdrop") as HTMLDivElement
  const lightboxImage = lightbox.querySelector(".lightbox-image") as HTMLImageElement
  const closeBtn = lightbox.querySelector(".lightbox-close") as HTMLButtonElement
  const prevBtn = lightbox.querySelector(".lightbox-prev") as HTMLButtonElement
  const nextBtn = lightbox.querySelector(".lightbox-next") as HTMLButtonElement

  // Get all images from all article content areas (supports sliding pane layout)
  const articles = document.querySelectorAll("article.popover-hint")

  const images: HTMLImageElement[] = []
  articles.forEach(article => {
    const articleImages = Array.from(article.querySelectorAll("img")) as HTMLImageElement[]
    images.push(...articleImages)
  })
  if (images.length === 0) return

  let currentIndex = 0

  function updateNavButtons() {
    // Hide prev button at first image
    if (currentIndex === 0) {
      prevBtn.style.visibility = "hidden"
    } else {
      prevBtn.style.visibility = ""
    }

    // Hide next button at last image
    if (currentIndex === images.length - 1) {
      nextBtn.style.visibility = "hidden"
    } else {
      nextBtn.style.visibility = ""
    }
  }

  function openLightbox(index: number) {
    currentIndex = index
    const img = images[currentIndex]
    lightboxImage.src = img.src
    lightboxImage.alt = img.alt
    lightbox!.classList.add("active")
    document.body.style.overflow = "hidden"

    // Hide nav buttons if only one image
    if (images.length <= 1) {
      prevBtn.style.display = "none"
      nextBtn.style.display = "none"
    } else {
      prevBtn.style.display = ""
      nextBtn.style.display = ""
      updateNavButtons()
    }
  }

  function closeLightbox() {
    lightbox!.classList.remove("active")
    document.body.style.overflow = ""
  }

  function showPrev() {
    if (currentIndex > 0) {
      currentIndex--
      const img = images[currentIndex]
      lightboxImage.src = img.src
      lightboxImage.alt = img.alt
      updateNavButtons()
    }
  }

  function showNext() {
    if (currentIndex < images.length - 1) {
      currentIndex++
      const img = images[currentIndex]
      lightboxImage.src = img.src
      lightboxImage.alt = img.alt
      updateNavButtons()
    }
  }

  // Handle keyboard navigation
  function handleKeydown(e: KeyboardEvent) {
    if (!lightbox!.classList.contains("active")) return

    if (e.key === "ArrowLeft") {
      e.preventDefault()
      showPrev()
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      showNext()
    }
  }

  // Attach click handlers to images
  images.forEach((img, index) => {
    // Skip images that are inside links (they should navigate instead)
    if (img.closest("a")) return

    img.style.cursor = "zoom-in"
    img.style.pointerEvents = "auto"
    const clickHandler = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      openLightbox(index)
    }
    img.addEventListener("click", clickHandler)
    window.addCleanup(() => img.removeEventListener("click", clickHandler))
  })

  // Close handlers
  closeBtn.addEventListener("click", closeLightbox)
  window.addCleanup(() => closeBtn.removeEventListener("click", closeLightbox))

  backdrop.addEventListener("click", closeLightbox)
  window.addCleanup(() => backdrop.removeEventListener("click", closeLightbox))

  // Navigation handlers
  prevBtn.addEventListener("click", showPrev)
  window.addCleanup(() => prevBtn.removeEventListener("click", showPrev))

  nextBtn.addEventListener("click", showNext)
  window.addCleanup(() => nextBtn.removeEventListener("click", showNext))

  // Keyboard handlers
  document.addEventListener("keydown", handleKeydown)
  window.addCleanup(() => document.removeEventListener("keydown", handleKeydown))

  // Register escape handler
  registerEscapeHandler(lightbox, closeLightbox)
}

document.addEventListener("nav", setupImageLightbox)
