// Message from plugin
export enum PluginMessage {
  DSLGENERATED = "dsl_generated",
}

// Message from ui
export enum UIMessage {
  PREPROCESS = "preprocess",
}

type MessageType = {
  type: UIMessage | PluginMessage,
  data?: any;
}

/**
 * send message to ui
 */
export const sendMsgToUI = (data: MessageType) => {
  mg.ui.postMessage(data, "*")
}


/**
 * send message to plugin
 */
export const sendMsgToPlugin = (data: MessageType) => {
  parent.postMessage(data, "*")
}
