import { describe, expect, it } from 'vitest'
import CSSParser from '../src/CSSParser'

describe("Parse CSS string", () => {
    it('should parse CSS', () => {
        const cssString = `
            #root {
                width: 100%; 
                height: 100%;
                font-size: 14px;
            }
            .welcome {
                color: red; 
            }
            div,
            p,
            a {
                margin: 0;
                padding: 0; 
            }
        `
        const target = [
            {
                "selectors": [
                    {
                        "id": "root",
                        "class": "",
                        "tagNmae": ""
                    }
                ],
                "declarations": [
                    {
                        "name": "width",
                        "value": "100%"
                    },
                    {
                        "name": "height",
                        "value": "100%"
                    },
                    {
                        "name": "font-size",
                        "value": "14px"
                    }
                ]
            },
            {
                "selectors": [
                    {
                        "id": "",
                        "class": "welcome",
                        "tagNmae": ""
                    }
                ],
                "declarations": [
                    {
                        "name": "color",
                        "value": "red"
                    }
                ]
            },
            {
                "selectors": [
                    {
                        "id": "",
                        "class": "",
                        "tagNmae": "div"
                    },
                    {
                        "id": "",
                        "class": "",
                        "tagNmae": "p"
                    },
                    {
                        "id": "",
                        "class": "",
                        "tagNmae": "a"
                    }
                ],
                "declarations": [
                    {
                        "name": "margin",
                        "value": "0"
                    },
                    {
                        "name": "padding",
                        "value": "0"
                    }
                ]
            }
        ]
        const parser = new CSSParser()
        const result = parser.parse(cssString)
        expect(result).toEqual(target)
    })
})