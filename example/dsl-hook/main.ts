import { UIMessage, sendMsgToUI, PluginMessage } from '@messages/sender'

mg.showUI(__html__)

let sendDSLToMG = (processedDSLData: MGDSL.MGDSLData) => {}
//@ts-ignore
mg.codegen.on("generateDSL", ({ data, callback }) => {
  sendDSLToMG = callback
  // send to ui to process it properly
  sendMsgToUI({
    type: PluginMessage.DSLGENERATED,
    data,
  })
});

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