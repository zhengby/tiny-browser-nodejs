import { Declaration, Rule, Selector } from './CSSParser'
import { Element, Node, NodeType } from './HTMLParser'

interface AnyObject {
    [key: string]: any
}

export enum Display {
    Inline = 'inline',
    Block = 'block',
    None = 'none',
}

export interface StyleNode {
    node: Node
    values: AnyObject
    children: StyleNode[]
}

const inheritableAttrs = ['color', 'font-size']

export function getStyleTree(
    eles: Node | Node[],
    cssRules: Rule[],
    parent?: StyleNode
) {
    if (Array.isArray(eles)) {
        return eles.map(ele => getStyleNode(ele, cssRules, parent))
    }
    return getStyleNode(eles, cssRules, parent)
}

export function getDisplayValue(styleNode: StyleNode) {
    return styleNode.values?.display ?? Display.Inline
}

function getStyleNode(ele: Node, cssRules: Rule[], parent?: StyleNode) {
    const styleNode: StyleNode = {
        node: ele,
        values: getStyleValues(ele, cssRules, parent),
        children: []
    }

    // 合并行内样式
    if (ele.nodeType === NodeType.Element) {
        if (ele.attributes.style) {
            styleNode.values = {
                ...styleNode.values,
                ...getInlineStyle(ele.attributes.style)
            }
        }

        styleNode.children = ele.children.map(e => {
            return getStyleNode(e, cssRules, styleNode)
        }) as unknown as StyleNode[]
    }

    return styleNode
}

function getStyleValues(
    ele: Node,
    cssRules: Rule[],
    parent?: StyleNode
) {
    const inheritableAttrValue = getInheritableAttrValues(parent)

    if (ele.nodeType === NodeType.Text) {
        return inheritableAttrValue
    }

    return cssRules.reduce((result: AnyObject, rule) => {
        if (isMatch(ele as Element, rule.selectors)) {
            result = {
                ...result,
                ...cssValueArrToObject(rule.declarations)
            }
        }
        return result
    }, inheritableAttrValue)
}

function getInheritableAttrValues(parent?: StyleNode) {
    if (!parent) {
        return {}
    }
    const keys = Object.keys(parent.values)
    return keys.reduce((result: AnyObject, key) => {
        if (inheritableAttrs.includes(key)) {
            result[key] = parent.values[key]
        }
        return result
    }, {})
}

function isMatch(ele: Element, selectors: Selector[]): boolean {
    return selectors.some((selector) => {
        if (selector.tagNmae === '*') {
            return true
        }
        if (selector.tagNmae === ele.tagName) {
            return true
        }
        if (ele.attributes.id === selector.id) {
            return true
        }

        if (ele.attributes.class) {
            const classes = ele.attributes.class
                .split(' ')
                .filter(Boolean)
            const classes2 = selector.class
                .split(' ')
                .filter(Boolean)
            for (const name of classes) {
                if (classes2.includes(name)) {
                    return true
                }
            }
        }

        return false
    })
}

function cssValueArrToObject(declarations: Declaration[]) {
    return declarations.reduce((result: AnyObject, declaration: Declaration) => {
        result[declaration.name] = declaration.value
        return result
    }, {})
}

function getInlineStyle(str: string) {
    str = str.trim()
    if (!str) {
        return {}
    }
    const arr = str.split(';')
    if (!arr.length) {
        return {}
    }
    return arr.reduce((result: AnyObject, item: string) => {
        const [name, value] = item.split(':')
        if (name && value) {
            result[name.trim()] = value.trim()
        }
        return result
    }, {})
}