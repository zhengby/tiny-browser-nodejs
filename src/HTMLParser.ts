import Parser from "./Parser"

export enum NodeType {
    Element = 1,
    Text = 3
}

export interface Element {
    tagName: string
    attributes: Record<string, string>
    children: Node[]
    nodeType: NodeType.Element
}

export interface Text {
    nodeValue: string
    nodeType: NodeType.Text
}

export type Node = Element | Text

function element(tagName: string): Element {
    return {
        tagName,
        attributes: {},
        children: [],
        nodeType: NodeType.Element
    }
}

function text(data: string): Text {
    return {
        nodeValue: data,
        nodeType: NodeType.Text
    }
}

export default class HTMLParser extends Parser {
    private stack: string[] = []
    parse(rawText: string) {
        this.rawText = rawText.trim()
        this.len = this.rawText.length
        this.index = 0
        this.stack = []

        const root = element("root")
        while (this.index < this.len) {
            this.removeSpaces()
            if (this.rawText[this.index].startsWith("<")) {
                this.index++
                this.parseElement(root)
            } else {
                this.parseText(root)
            }
        }
        if (root.children.length === 1) {
            return root.children[0]
        }
        return root.children
    }

    private parseElement(parent: Element) {
        const tagName = this.parseTag()
        const ele = element(tagName)
        this.stack.push(tagName)
        parent.children.push(ele)

        this.parseAttrs(ele)

        while (this.index < this.len) {
            this.removeSpaces()
            if (this.rawText[this.index].startsWith('<')) {
                this.index++
                this.removeSpaces()
                if (this.rawText[this.index].startsWith('/')) {
                    this.index++
                    const startTag = this.stack[this.stack.length - 1]
                    const endTag = this.parseTag()
                    if (startTag !== endTag) {
                        throw Error(`The engTag ${endTag} does not match the startTag ${startTag}`)
                    }
                    this.stack.pop()
                    while (this.index < this.len && this.rawText[this.index] !== '>') {
                        this.index++
                    }
                    break
                }
                this.parseElement(ele)
            } else {
                this.parseText(ele)
            }
        }
        this.index++
    }

    private parseAttrs(ele: Element) {
        while (this.index < this.len && this.rawText[this.index] !== '>') {
            this.removeSpaces()
            this.parseAttr(ele)
            this.removeSpaces()
        }
        this.index++
    }

    private parseAttr(ele: Element) {
        let attr = ''
        let value = ''
        while (this.index < this.len
            && this.rawText[this.index] !== '='
            && this.rawText[this.index] !== '>'
        ) {
            attr += this.rawText[this.index]
            this.index++
        }
        this.sliceText() 
        attr = attr.trim()
        if (!attr) {
            return
        }
        this.index++

        let startSymbol = ''
        if (this.rawText[this.index] === "'" || this.rawText[this.index] === '"') {
            startSymbol = this.rawText[this.index]
            this.index++
        }

        while (this.index < this.len && this.rawText[this.index] !== startSymbol) {
            value += this.rawText[this.index]
            this.index++
        }
        this.index++
        ele.attributes[attr] = value.trim()
        this.sliceText()
    }

    private parseText(parent: Element) {
        let str = ''
        while (this.index < this.len 
            && !(this.rawText[this.index] === '<'
                // && /\w|\//.test(this.rawText[this.index+1])
            )
        ) {
            str += this.rawText[this.index]
            this.index++
        }
        this.sliceText()
        parent.children.push(text(this.removeExtraSpaces(str)))
    }

    private parseTag() {
        let tagName = ''

        this.removeSpaces()
        while (this.index < this.len && this.rawText[this.index] !== ' '
            && this.rawText[this.index] !== '>'
        ) {
            tagName += this.rawText[this.index]
            this.index++
        }

        this.sliceText()
        return tagName
    }

    private removeExtraSpaces(str: string) {
        let index = 0
        let len = str.length
        let hasSpace = false
        let result = ''
        while (index < len) {
            if (str[index] === ' ' || str[index] === '\n') {
                if (!hasSpace) {
                    hasSpace = true
                    result += ' '
                }
            } else {
                result += str[index]
                hasSpace = false
            }
            index++
        }
        return result
    }
}