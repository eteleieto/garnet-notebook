import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { pathToRoot } from "../util/path"

const Logo: QuartzComponent = ({ fileData, displayClass, cfg }: QuartzComponentProps) => {
    const baseDir = pathToRoot(fileData.slug!)
    return (
        <h1 class={classNames(displayClass, "page-title")}>
            <a href={baseDir}>
                garnet
            </a>
        </h1>
    )
}

Logo.css = `
`

export default (() => Logo) satisfies QuartzComponentConstructor
