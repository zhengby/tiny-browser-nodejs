import Parser from "./Parser";

export interface Rule {
    selectors: Selector[]
    declarations: Declaration[]
}

export interface Selector {
    tagNmae: string
    id: string
    class: string
}

export interface Declaration {
    name: string
    value: string | number
}

export default class CSSParser extends Parser {
    private identifierRE = /\w|-|_/
    parse(rawText: string) {
        this.rawText = rawText.trim()
        this.len = this.rawText.length
        this.index = 0
        return this.parseRules()
    }

    private parseRules() {
        const rules: Rule[] = []
        while (this.index < this.len) {
            this.removeSpaces()
            rules.push(this.parseRule())
            this.index++
        }

        return rules
    }

    private parseRule() {
        const rule: Rule = {
            selectors: [],
            declarations: []
        }
        rule.selectors = this.parseSelectors()
        rule.declarations = this.parseDeclarations()

        return rule
    }
    private parseSelectors() {
        const selectors: Selector[] = []
        const symbols = ['*', '.', '#']

        while (this.index < this.len) {
            this.removeSpaces()
            const char = this.rawText[this.index]
            if (this.identifierRE.test(char) || symbols.includes(char)) {
                selectors.push(this.parseSelector())
            } else if (char === ',') {
                this.removeSpaces()
                selectors.push(this.parseSelector())
            } else if (char === '{') {
                this.index++
                break
            }

            this.index++
        }

        return selectors
    }

    private parseDeclarations() {
        const declarations: Declaration[] = []
        while (this.index < this.len
            && this.rawText[this.index] !== '}'
        ) {
            declarations.push(this.parseDeclaration())
        }

        return declarations
    }

    private parseSelector() {
        const selector: Selector = {
            id: '',
            class: '',
            tagNmae: '',
        }
        switch (this.rawText[this.index]) {
            case '.':
                this.index++
                selector.class = this.parseIdentifier()
                break
            case '#':
                this.index++
                selector.id = this.parseIdentifier()
                break
            case '*':
                this.index++
                selector.tagNmae = '*'
                break
            default:
                selector.tagNmae = this.parseIdentifier()

        }

        return selector
    }
    private parseDeclaration() {
        const declaration: Declaration = {
            name: '',
            value: '',
        }
        this.removeSpaces()
        declaration.name = this.parseIdentifier()
        this.removeSpaces()

        while (this.index < this.len
            && this.rawText[this.index] !== ':'
        ) {
            this.index++
        }
        this.index++
        this.removeSpaces()
        declaration.value = this.parseValue()
        this.removeSpaces()

        return declaration
    }

    private parseValue() {
        let result = ''
        while (this.index < this.len
            && this.rawText[this.index] !== ';'
        ) {
            result += this.rawText[this.index]
            this.index++
        }
        this.index++
        this.sliceText()
        return result.trim()
    }

    private parseIdentifier() {
        let result = ''
        while (this.index < this.len
            && this.identifierRE.test(this.rawText[this.index])
        ) {
            result += this.rawText[this.index++]
        }

        this.sliceText()
        return result
    }
}