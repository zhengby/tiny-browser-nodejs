import { Display, StyleNode, getDisplayValue } from "../StyleTree";
import Dimensions from "./Dimensions";
import { BoxType } from "./type";

export default class LayoutBox {
    dimensions: Dimensions
    boxType: BoxType
    children: LayoutBox[]
    styleNode: StyleNode | undefined 

    constructor(styleNode?: StyleNode) {
        this.boxType = this.getBoxType(styleNode)
        this.dimensions = new Dimensions()
        this.children = []
        this.styleNode = styleNode
    }

    layout(parentBlock: Dimensions) {
        if (this.boxType === BoxType.InlineNode) {
            return
        }
        this.calculateBlockWidth(parentBlock)
        this.calculateBlockPosition(parentBlock)
        this.layoutBlockChildren()
        this.calculateBlockHeight()
    }
    calculateBlockHeight() {
        const height = this.styleNode?.values.height
        if (height) {
            this.dimensions.content.height = parseInt(height)
        }
    }
    layoutBlockChildren() {
        const { dimensions } = this
        for (const child of this.children) {
            child.layout(dimensions)
            dimensions.content.height += child.dimensions.marginBox().height
        }
    }
    calculateBlockPosition(parentBlock: Dimensions) {
        const styleValues = this.styleNode?.values || {}
        const { x, y, height } = parentBlock.content
        const dimensions = this.dimensions

        dimensions.margin.top = transformValueSafe(styleValues['margin-top'] || styleValues.margin || 0)
        dimensions.margin.bottom = transformValueSafe(styleValues['margin-bottom'] || styleValues.margin || 0)

        dimensions.border.top = transformValueSafe(styleValues['border-top'] || styleValues.border|| 0)
        dimensions.border.bottom = transformValueSafe(styleValues['border-bottom'] || styleValues.border || 0)

        dimensions.padding.top = transformValueSafe(styleValues['padding-top'] || styleValues.padding || 0)
        dimensions.padding.bottom = transformValueSafe(styleValues['padding-bottom'] || styleValues.padding || 0)

        dimensions.content.x = x + dimensions.margin.left + dimensions.border.left + dimensions.padding.left
        dimensions.content.y = y + height + dimensions.margin.top + dimensions.border.top + dimensions.padding.top
    }
    calculateBlockWidth(parentBlock: Dimensions) {
        const styleValues = this.styleNode?.values || {}
        const parentWidth = parentBlock.content.width

        let width = styleValues.width ?? 'auto'
        let marginLeft = styleValues['margin-left'] || styleValues.margin || 0
        let marginRight = styleValues['margin-right'] || styleValues.margin || 0

        let borderLeft = styleValues['border-left'] || styleValues.border || 0
        let borderRight = styleValues['border-right'] || styleValues.border || 0

        let paddingLeft = styleValues['padding-left'] || styleValues.padding || 0
        let paddingRight = styleValues['padding-right'] || styleValues.padding || 0

        let totalWidth = sum(width, marginLeft, marginRight, borderLeft, borderRight, paddingLeft, paddingRight)

        const isWidthAuto = width === 'auto'
        const isMarginLeftAuto = marginLeft === 'auto'
        const isMarginRightAuto = marginRight === 'auto'

        if (!isWidthAuto && totalWidth > parentWidth) {
            if (isMarginLeftAuto) {
                marginLeft = 0
            }
            if (isMarginRightAuto) {
                marginRight = 0
            }
        }

        const underFlow = parentWidth - totalWidth

        if (!isWidthAuto && !isMarginLeftAuto && !isMarginRightAuto) {
            marginRight += underFlow
        } else if (!isWidthAuto && !isMarginLeftAuto && isMarginLeftAuto) {
            marginRight = underFlow
        } else if (!isWidthAuto && isMarginLeftAuto && !isMarginRightAuto) {
            marginLeft = underFlow
        } else if (isWidthAuto) {
            if (isMarginLeftAuto) {
                marginLeft = 0
            }
            if (isMarginRightAuto) {
                marginRight = 0
            }
            if (underFlow >= 0) {
                width = underFlow
            } else {
                width = 0
                marginRight += underFlow
            }
        } else if (!isWidthAuto && isMarginLeftAuto && isMarginRightAuto) {
            marginLeft = underFlow / 2
            marginRight = underFlow / 2
        }

        const dimensions = this.dimensions
        dimensions.content.width = parseInt(width)

        dimensions.margin.left = parseInt(marginLeft)
        dimensions.margin.right = parseInt(marginRight)

        dimensions.border.left = parseInt(borderLeft)
        dimensions.border.right = parseInt(borderRight)

        dimensions.padding.left = parseInt(paddingLeft)
        dimensions.padding.right = parseInt(paddingRight)
    }


    getBoxType(styleNode?: StyleNode) {
        if (!styleNode) {
            return BoxType.AnonymousBlock
        }
        const display = getDisplayValue(styleNode)
        if (display === Display.Block) {
            return BoxType.BlockNode
        }
        return BoxType.InlineNode
    }
}

function sum(...args: (string | number)[]) {
    return args.reduce((prev: number, cur: string | number) => {
        if (cur === 'auto') {
            return prev
        }
        return prev + parseInt(String(cur))
    }, 0) as number
}

function transformValueSafe(val: number | string) {
    if (val === 'auto') {
        return 0
    }
    return parseInt(String(val))
}
