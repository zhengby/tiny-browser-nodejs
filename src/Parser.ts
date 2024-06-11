export default class Parser {
    protected rawText: string = ''
    protected len: number = 0
    protected index: number = 0

    protected removeSpaces() {
        while (this.index < this.len && (
            this.rawText[this.index] === ' '
            || this.rawText[this.index] === '\n'
        )) {
            this.index++
        }
        this.sliceText()
    }

    protected sliceText() {
        this.rawText = this.rawText.slice(this.index)
        this.len = this.rawText.length
        this.index = 0
    }
}