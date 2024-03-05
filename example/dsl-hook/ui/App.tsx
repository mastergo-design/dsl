import React, { useState, useEffect, useRef } from 'react'
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
            modifyVUEDSL()
        } else if (framework === 'REACT') {
            modifyReactDSL()
        } else if (framework === "ANDROID") {

        }
        // send it back to plugin after being processed
        sendMsgToPlugin({
            type: UIMessage.PREPROCESS,
            data: dsl.current
        })
    }


    const modifyReactDSL = () => {
        const { entry, root, fileMap } = dsl.current
        // modify the global variants of entry file
        const { props, data, methods } = fileMap[entry]
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

    const modifyVUEDSL = () => {
        const { entry, root, fileMap } = dsl.current
        // modify the global variants of entry file
        const { props, data, methods } = fileMap[entry]
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
                value: JSON.stringify({visibility: 'show'}),
                valueType: "OBJECT"
            }
        } else {
            // modify directly
            const prevValue = JSON.parse(dynamicClass['value'])
            Object.assign(prevValue, { visibility: 'show' });
            dynamicClass.value = JSON.stringify(prevValue);
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
    }

    const requestFromRemoteServer = async () => {
        return Promise.resolve({})
    }

    return (
        <div className="hello">Hello {mg}</div>
    )
}
export default App
