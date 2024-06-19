import { describe, expect, it } from 'vitest'
import HTMLParser, { Node } from '../src/HTMLParser'
import { StyleNode, getStyleTree } from '../src/StyleTree'
import CSSParser from '../src/CSSParser'
import { Dimensions, getLayoutTree } from '../src/layout'
import painting from '../src/painting'
import path from 'path'

describe("Parse Layout Tree", () => {

    it('should parse simple style tree', () => {
        const htmlString = `
            <div>test</div>
        `
        const cssString = `
            div {
                font-size: 88px;
                color: #000;
            } 
        `
        const htmlParser = new HTMLParser()
        const domTree = htmlParser.parse(htmlString)
        const cssParser = new CSSParser()
        const cssTree = cssParser.parse(cssString)
        const styleTree = getStyleTree(domTree, cssTree)

        expect(styleTree).toEqual({
            "node": { // DOM 节点
                "tagName": "div",
                "attributes": {},
                "children": [
                    {
                        "nodeValue": "test",
                        "nodeType": 3
                    }
                ],
                "nodeType": 1
            },
            "values": { // CSS 属性值
                "font-size": "88px",
                "color": "#000"
            },
            "children": [ // style tree 子节点
                {
                    "node": {
                        "nodeValue": "test",
                        "nodeType": 3
                    },
                    "values": { // text 节点继承了父节点样式
                        "font-size": "88px",
                        "color": "#000"
                    },
                    "children": []
                }
            ]
        })
    })

    it('should parse complex style tree', () => {
        const htmlString = `
            <div id="root">
                <h1 class="welcome h1">welcome</h1> 
                <p>please <a href="/login">login</a></p>
                i am plain text
            </div> 
        `
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
        const htmlParser = new HTMLParser()
        const domTree = htmlParser.parse(htmlString)
        const cssParser = new CSSParser()
        const cssTree = cssParser.parse(cssString)
        const styleTree = getStyleTree(domTree, cssTree)

        expect(styleTree).toEqual({
            "node": {
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
            },
            "values": {
                "width": "100%",
                "height": "100%",
                "font-size": "14px",
                "margin": "0",
                "padding": "0"
            },
            "children": [
                {
                    "node": {
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
                    "values": {
                        "font-size": "14px",
                        "color": "red"
                    },
                    "children": [
                        {
                            "node": {
                                "nodeValue": "welcome",
                                "nodeType": 3
                            },
                            "values": {
                                "font-size": "14px",
                                "color": "red"
                            },
                            "children": [
        
                            ]
                        }
                    ]
                },
                {
                    "node": {
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
                    "values": {
                        "font-size": "14px",
                        "margin": "0",
                        "padding": "0"
                    },
                    "children": [
                        {
                            "node": {
                                "nodeValue": "please ",
                                "nodeType": 3
                            },
                            "values": {
                                "font-size": "14px"
                            },
                            "children": [
        
                            ]
                        },
                        {
                            "node": {
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
                            },
                            "values": {
                                "font-size": "14px",
                                "margin": "0",
                                "padding": "0"
                            },
                            "children": [
                                {
                                    "node": {
                                        "nodeValue": "login",
                                        "nodeType": 3
                                    },
                                    "values": {
                                        "font-size": "14px"
                                    },
                                    "children": [
        
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "node": {
                        "nodeValue": "i am plain text ",
                        "nodeType": 3
                    },
                    "values": {
                        "font-size": "14px"
                    },
                    "children": [
        
                    ]
                }
            ]
        })
    })

    it('should parse layout tree', () => {
        const htmlString = `
            <div id="root">
                <h1>From Entering a URL to Page Display</h1> 
                <ul>
                    <li>First, the browser process receives the URL request entered by the user, and then the browser process forwards the URL to the network process.</li>
                    <li>Then, the network process initiates the actual URL request.</li> 
                    <li>Next, the network process receives the response header data, parses it, and forwards the data to the browser process.</li> 
                </ul>
            </div> 
        `
        const cssString = `
            h1 {
                font-size: 18px; 
                font-weight: 600;
            }
            #root {
                width: 1000px; 
                height: 1000px;
                font-size: 14px;
                background: #fff;
            }
     
            * {
                display: block;
                margin: 10px;
                padding: 10px;
                background: #fff;
                color: #000;
            }
        `
        const htmlParser = new HTMLParser()
        const domTree = htmlParser.parse(htmlString)
        const cssParser = new CSSParser()
        const cssTree = cssParser.parse(cssString)
        const styleTree = getStyleTree(domTree, cssTree) as StyleNode

        const dimensions = new Dimensions()
        dimensions.content.width = 1800
        dimensions.content.height = 1200

        const layoutTree = getLayoutTree(styleTree, dimensions)
        console.log(JSON.stringify(layoutTree))

        painting(layoutTree, path.resolve(__dirname, '../preview/result1.jpg'))
        // expect(styleTree).toEqual({})
    })
})