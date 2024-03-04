import React, { useState, useEffect, useRef, useMemo } from 'react'
import './App.css'
import { sendMsgToPlugin, UIMessage, PluginMessage } from '@messages/sender'

function App() {
    const [mg] = useState('MasterGo');
    const dsl = useRef({} as MGDSL.JSDSLData);

    useEffect(() => {
        window.onmessage =  (event: MessageEvent) => {
            const { data: res } = event
            const { type, data }: { data: MGDSL.JSDSLData, type: PluginMessage } = res
            if (type === PluginMessage.DSLGENERATED) {
                dsl.current = data
                // hook dsl
                handleDsl();
            }
        }
    }, [])
    const handleDsl = async () => {
        // something requested from the remote server
        const res = await requestFromRemoteServer();
        const { framework } = dsl.current
        if (framework === "VUE3") {
            modifyVUEDSL(res)
        } else if (framework === 'REACT') {
            modifyReactDSL()
        } else if (framework === "ANDROID") {

        }
        console.log('修改后的数据', dsl.current);
        // send it back to plugin after being processed
        sendMsgToPlugin({
            type: UIMessage.PREPROCESS,
            data: dsl.current
        })
    }



    const modifyReactDSL = () => {
        const { entry, root, fileMap } = dsl.current
        const entryFile = fileMap[entry]
        // modify the global variants of entry file
        const { props, data, methods } = entryFile
        props['show'] = {
            type: 'BOOLEAN',
            defaultValue: true,
            name: 'show'
        }
        data['count'] = {
            type: 'NUMBER',
            defaultValue: 1,
            name: 'count',
        }
        methods['countdown'] = {
            name: 'countdown',
            args: ['timeout'],
            content: `
            setTimeout(() => {
                setCount(() => {
                  const newCount = Math.random() * 100
                  console.log('newCount is ', newCount);
                  return newCount
                })
            }, timeout);`
        };
        const cssStyle = (root as MGDSL.MGLayerNode).style as MGDSL.CssNodeStyle;
        cssStyle.dynamicInlineStyles = {
            visibility: 'show'
        }
    }

    const modifyVUEDSL = (res: any) => {
        const { entry, root, fileMap } = dsl.current
        const entryFile = fileMap[entry]
        // modify the global variants of entry file
        const { props, data, methods } = entryFile
        props['show'] = {
            type: 'BOOLEAN',
            defaultValue: true,
            name: 'show'
        }
        data['count'] = {
            type: 'NUMBER',
            defaultValue: 1,
            name: 'count',
        }
        methods['countdown'] = {
            name: 'countdown',
            args: ['timeout'],
            content: `
            setTimeout(() => {
                count.value = Math.random() * 100
                console.log('newCount is ', count.value);
            }, timeout);`
        };
        const cssStyle = (root as MGDSL.MGLayerNode).style as MGDSL.CssNodeStyle;
        const dynamicClass = cssStyle.attributes['style']
        // see if their is the attribute of style
        if (!dynamicClass) {
            cssStyle.attributes['style'] = {
                name: 'style',
                type: "DYNAMIC",
                value: `{visibility: show? 'visible': 'hidden'}`,
                valueType: "OBJECT"
            }
        }
        // option 2
        // const vIfOrVShow = cssStyle.attributes['v-if'] || cssStyle.attributes['v-show']
        // if (!vIfOrVShow) {
        //     cssStyle.attributes['v-if'] = {
        //         name: 'v-if',
        //         type: "STATIC",
        //         value: 'show',
        //         valueType: "STRING"
        //     }
        // }
        addOperationToDSL(res);
    }

    // addOperation
    const addOperationToDSL = (data: Array<{ id: string, description: string }>) => {
        const { root, nodeMap, fileMap } = dsl.current
        // add operation to childNode
        const childId = root.children[0]
        if (nodeMap[childId]) {
            const node = nodeMap[childId]
            // generate operationNode
            const iteration = generateIterator(node, 'list');
            // replace layerNode with iteration
            root.children[0] = iteration.id
            // store it
            nodeMap[iteration.id] = iteration
            // root has been serialized so we should update the nodeMap after we change it
            nodeMap[root.id] = root;
            // insert text to node
            const raw = generateRaw(`{{item.description}}`);
            (node as MGDSL.MGLayerNode).children.push(raw.id);
            nodeMap[raw.id] = raw

            // changeFileData
            const file = fileMap[(node as MGDSL.MGLayerNode).relatedFile]
            file.data['list'] = {
                name: 'list',
                type: 'ARRAY',
                defaultValue: data,
            }
        }
    }

    // generate iteration operation
    const generateIterator = (node: MGDSL.MGNode, name: string): MGDSL.Iteration => {
        return {
            id: `iteration-${node.id}`,
            type: 'OPERATION',
            operationType: "ITERATOR",
            variable: name,
            // key: 'id',
            body: node
        }
    }

    // generate raw
    const generateRaw = (rawString: string): MGDSL.Raw => ({
        id: 'raw_1',
        type: 'OPERATION',
        operationType: 'RAW',
        body: rawString
    })

    const requestFromRemoteServer = async () => {
        return Promise.resolve([{
            id: 'item_id_1',
            description: 'item1'
        }, {
            id: 'item_id_2',
            description: 'item2'
        }])
    }

    return (
        <div className="hello">Hello {mg}</div>
    )
}
export default App
