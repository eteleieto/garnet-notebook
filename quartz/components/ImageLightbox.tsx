// @ts-ignore
import script from "./scripts/imagelightbox.inline"
import styles from "./styles/imagelightbox.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const ImageLightbox: QuartzComponent = (_props: QuartzComponentProps) => {
  return null
}

ImageLightbox.afterDOMLoaded = script
ImageLightbox.css = styles

export default (() => ImageLightbox) satisfies QuartzComponentConstructor
