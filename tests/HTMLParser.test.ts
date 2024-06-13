import { describe, expect, it } from 'vitest'
import HTMLParser from '../src/HTMLParser'

describe("Parse HTML string", () => {
    it('should parse HTML', () => {
        const htmlString = `
            <div id="root">
                <h1 class="welcome h1">welcome</h1> 
                <p>please <a href="/login">login</a></p>
                i am plain text
            </div> 
        `
        const target = {
            "tagName": "div",
            "attributes": {
                "id": "root"
            },
            "children": [
                {
                    "tagName": "h1",
                    "attributes": {
                        "class": "welcome h1"
                    },
                    "children": [
                        {
                            "nodeValue": "welcome",
                            "nodeType": 3
                        }
                    ],
                    "nodeType": 1
                },
                {
                    "tagName": "p",
                    "attributes": {

                    },
                    "children": [
                        {
                            "nodeValue": "please ",
                            "nodeType": 3
                        },
                        {
                            "tagName": "a",
                            "attributes": {
                                "href": "/login"
                            },
                            "children": [
                                {
                                    "nodeValue": "login",
                                    "nodeType": 3
                                }
                            ],
                            "nodeType": 1
                        }
                    ],
                    "nodeType": 1
                },
                {
                    "nodeValue": "i am plain text ",
                    "nodeType": 3
                }
            ],
            "nodeType": 1
        }
        const parser = new HTMLParser()
        const result = parser.parse(htmlString)
        expect(result).toEqual(target)
    })
})