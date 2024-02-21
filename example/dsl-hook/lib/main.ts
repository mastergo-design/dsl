import { UIMessage, sendMsgToUI, PluginMessage } from '@messages/sender'

mg.showUI(__html__)

const handler = ({ data, callback }: { data: MGDSL.MGDSLData, callback(dslData: MGDSL.MGDSLData): void }) => {
  sendDSLToMG = callback
  // send to ui to process it properly
  sendMsgToUI({
    type: PluginMessage.DSLGENERATED,
    data,
  })
}

let sendDSLToMG = (processedDSLData: MGDSL.MGDSLData) => {}

/**
 * monitor when dslData has been
 */
//@ts-ignore
mg.codegen.on("generateDSL", handler)

/**
 * plugin closed
 */
mg.once('close', () => {
  //@ts-ignore
  mg.codegen.off('generateDSL', handler)
})

function restore() {
  sendDSLToMG = (processedDSLData: MGDSL.MGDSLData) => {}
}

mg.ui.onmessage = (msg: { type: UIMessage, data: MGDSL.MGDSLData }) => {
  const { type, data } = msg
  if (type === UIMessage.PREPROCESS) {
    // get the dsl processed
    sendDSLToMG(data)
    restore();
  }
}