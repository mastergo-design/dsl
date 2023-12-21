declare global {
  namespace MGDSL {
    interface MGDSLData {
      /**
       * 版本信息，遵循SemVer规则
       */
      readonly version: string
      /**
       * 框架类型
       */
      readonly frameWorkType: FrameWorkType
      readonly nodeMap: Record<NodeId, MGNode>
      readonly localStyle: StyleMap
      readonly fileMap: Record<FileId, MGDSLFile>
      root: MGNode
      //TODO: 插件补充缺失自定义样式, GRID样式不包含在内
      settings: DSLSettings
      entry: MGDSLFile
    }

    interface JSDSLData {
      /**
       * 全局样式表
       */
      globalStyleMap: {
        [classId: string]: ClassStyle
      },
    }

    interface ReactTemplate extends MGDSLData, JSDSLData {
      readonly frameWorkType: "REACT"
    }
    interface Vue3Template extends MGDSLData, JSDSLData {
      readonly frameWorkType: "VUE3"
    }
    interface Vue2Template extends MGDSLData, JSDSLData {
      readonly frameWorkType: "VUE2"
    }
    interface AndroidTemplate extends MGDSLData {
      readonly frameWorkType: "ANDROID"
    }
    interface IOSTemplate extends MGDSLData {
      readonly frameWorkType: "IOS"
    }

    type FrameWorkType = "REACT" | "VUE2" | "VUE3" | "ANDROID" | "IOS"

    type StyleMap = {
      paints: PaintStyle[]
      texts: TextStyle[]
      effects: EffectStyle[]
      stroke: StrokeStyle[]
    }

    type DSLSettings = {

    }

    type ClassStyle = {
      id: ClassId
      name: string
      scoped: boolean
      value: StyleSet
      // 伪类
      pseudo?: 'HOVER' | 'ACTIVE' | 'FOCUS' | 'DISABLED'
      /**
       * css类型
       *  */
      type: 'group' | 'class' | 'pseudo' | 'id' | 'attribute' | 'combinators'
    }

    type NodeId = LayerId | OperationId
    type LayerId = string
    type OperationId = string

    interface MGNode {
      type: "OPERATION" | "LAYER"
    }

    interface MGLayerNode extends MGNode {
      type: "LAYER"
      id: LayerId
      children: NodeId[]
      name: string
      /**
       * 图层实际类型名称 RECTANGLE TEXT FRAME...
       */
      layerType: NodeType
      layout: NodeLayout
      style: CssNodeStyle | IOSNodeStyle | AndroidNodeStyle
      /**
       * 是否是根元素
       */
      isRoot: boolean
      parent?: NodeId
      /**
       * 是否拆分成新文件,默认false
       */
      isNewFile?: boolean
      /**
       * 关联的文件，当isNewFile为true时存在
       * 修改isNewFile的值后，需要更新一下dsl生成新的MGDSLData
       */
      readonly relatedFile?: FileId
    }

    interface MGComponentNode extends MGLayerNode {
      layerType: "COMPONENT"
      alias: string
      /**
       * 是否是组件集子组件
       */
      isChildOfComponentSet: boolean
      /**
       * 组件别名
       */
      componentNameAlias?: string
    }

    interface MGInstanceNode extends MGLayerNode {
      layerType: "INSTANCE"
      /**
       * 实例的主组件Layer, 这里不开通用模型就不解析
       */
      mainComponent?: MGComponentNode
    }

    type NodeType =
      | 'GROUP'
      | 'FRAME'
      | 'RECTANGLE'
      | 'TEXT'
      | 'LINE'
      | 'ELLIPSE'
      | 'POLYGON'
      | 'STAR'
      | 'PEN'
      | 'COMPONENT'
      | 'COMPONENTSET'
      | 'INSTANCE'
      | 'BOOLEANOPERATION'
      | 'SLICE'
      | 'CONNECTOR'
      | 'SECTION'

    /**
     * 图层的布局信息
     */
    interface NodeLayout {
      /**
       * 相对矩阵
       */
      matrix?: Matrix
      width?: Dimension
      height?: Dimension
      /**
       * 实际在画布渲染的宽 包括阴影外描边
       */
      renderWidth?: Dimension
      /**
      * 实际在画布渲染的高 包括阴影外描边
      */
      renderHeight?: Dimension
      /**
       * 自动布局
       */
      autoLayout?: AutoLayout
      overflow?: "HIDDEN" | "VISIBLE"
      /**
       * 相对于父元素的布局
       */
      relatedLayout?: AbsoluteLayout | RelatedAutoLayout
    }

    /**
     * 自动布局
     */
    type AutoLayout = {
      direction: 'HORIZONTAL' | 'VERTICAL'
      layoutWrap: 'NO_WRAP' | 'WRAP'
      gap: number
      itemSpacing: number
      paddingTop: number
      paddingRight: number
      paddingBottom: number
      paddingLeft: number
      /**
       * 主轴
       */
      mainAxisAlignItems: AlignTypes
      /**
       * 交叉轴
       */
      crossAxisAlignItems: Exclude<AlignTypes, 'SPACE-BETWEEN'>
      /**
       * 描边是否包含在布局内
       */
      strokesIncludedInLayout: boolean
      itemReverseZIndex: boolean
      spacingStyleId: string
      paddingStyleId: string
    }

    /**
     * 绝对定位
     */
    type AbsoluteLayout = {
      type: 'ABSOLUTE'
      bound: {
        left?: Dimension
        right?: Dimension
        top?: Dimension
        bottom?: Dimension
      },
      /**
       * 包含外描边和阴影，实际渲染的bound
       */
      renderBound: {
        left?: Dimension
        right?: Dimension
        top?: Dimension
        bottom?: Dimension
      }
    }

    /**
     * 相对于父元素的自动布局
     */
    type RelatedAutoLayout = {
      type: 'AUTO'
      alignSelf: 'STRETCH' | 'INHERIT' | 'AUTO'
      flexGrow: number
    }

    type Matrix = [[number, number, number], [number, number, number]]
    /**
     * flex布局主轴
     */
    type AlignTypes = 'START' | 'END' | 'CENTER' | 'SPACE-BETWEEN'
    /**
     * 尺寸单位
     */
    type Dimension = {
      type: 'PIXEL' | 'PERCENT' | 'CALC'
      value: number | string
    }

    interface GeometryMixin {
      fills: Array<Paint>
      strokes: Array<Paint>
      strokeWeight: number
      strokeAlign: StrokeAlign
      strokeCap: StrokeCap
      strokeJoin: StrokeJoin
      strokeStyle: StrokeStyle
      dashCap: DashCap
      strokeDashes: Array<number>
      fillStyleId: string
      strokeStyleId: string
    }

    interface BlendMixin {
      opcity: number
      effects: Array<Effect>
      effectStyleId: string
      blendMode: BlendMode
    }

    interface CornerMixin {
      cornerRadius: number[]
    }

    interface LayoutMixin {
      constrainProportions: boolean
      layoutPositioning: 'AUTO' | 'ABSOLUTE' // applicable only inside auto-layout frames
    }

    interface NodeStyle {
      /**
       * 和localClassMap的key保持一致
       */
      id: `style-${NodeId}`
      type: NodeStyleType
      value: NodeStyleValue | NodeTextStyleValue
    }

    interface NodeStyleValue extends GeometryMixin, CornerMixin, BlendMixin, LayoutMixin {
    }

    interface NodeTextStyleValue extends NodeStyleValue {
      characters: string
      hyperlinks: Array<HyperlinkWithRange>
      textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED'
      textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM'
      textAutoResize: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE'
      paragraphSpacing: number
      textStyles: Array<TextSegStyle>
      listStyles: Array<ListStyle>
    }

    interface CssNodeStyle extends NodeStyle {
      /**
      * 样式名数组
      */
      classList: ClassId[]
    }

    interface IOSNodeStyle extends NodeStyle {
    }

    interface AndroidNodeStyle extends NodeStyle {
    }

    type StyleSet = Record<string, string | number>

    // style-class-xx
    type ClassId = string

    type NodeStyleType =
    | 'VIEW'
    | 'SVG'
    | 'IMAGE'
    | 'TEXT'
    | 'INPUT'
    | 'BUTTON'
    | 'SCROLLVIEW'

    interface MGOperationNode extends MGNode {
      type: "OPERATION"
    }

    /**
     * 运算符
     */
    type Operation = IfStatement | Iteration | Raw | TernaryExpression

    /**
     * 条件判断
     */
    interface IfStatement extends MGOperationNode {
      operationType: 'If_STATEMENT'
      // 表达式
      consequent: {
        type: 'MGNode' | 'IDENTIFIER'
        body: MGNode | string
      }
      alternate: {
        type: 'MGNode' | 'IDENTIFIER'
        body: MGNode | string
      }
    }

    /**
     * 迭代器
     */
    interface Iteration extends MGOperationNode {
      operationType: 'ITERATOR'
      // 迭代的变量
      variable: string
      body: MGNode
    }

    /**
     * 原始字符串
     */
    interface Raw extends MGOperationNode {
      operationType: "RAW"
      body: string
    }
    /**
     * 三目运算
     */
    interface TernaryExpression extends MGOperationNode {
      operationType: 'TERNARY_EXPRESSION'
      trueExpression: {
        type: 'MGNode' | 'IDENTIFIER'
        body: MGNode | string
      }
      falseExpression: {
        type: 'MGNode' | 'IDENTIFIER'
        body: MGNode | string
      }
    }

    interface MGDSLFile {
      id: FileId
      name: string
      relatedLayerId: LayerId
      chunks: FileId[]
      data?: any[]
      props?: ComponentProp[]
      methods?: Array<Method>
    }

    type FileId = string

    type ComponentPropType = {
      'STRING': string
      'NUMBER': number
      'BOOLEAN': boolean
      'FUNCTION': CallableFunction
      'OBJECT': Record<string, unknown>
      'ARRAY': Array<unknown>
      'SLOT': string
    }

    type ComponentPropItem<T extends keyof ComponentPropType> = {
      /**
       * 类型
       */
      type: T
      /**
       * 默认值，也可作为初始值使用
       */
      defaultValue?: ComponentPropType[T]
      /**
       * 属性名，根据aliasName和originalName经过处理后的名称，用于最终的展示
       */
      name: string
    }

    type ComponentPropString = ComponentPropItem<'STRING'>
    type ComponentPropNumber = ComponentPropItem<'NUMBER'>
    type ComponentPropBoolean = ComponentPropItem<'BOOLEAN'>
    type ComponentPropFunction = ComponentPropItem<'FUNCTION'>
    type ComponentPropObject = ComponentPropItem<'OBJECT'>
    type ComponentPropArray = ComponentPropItem<'ARRAY'>
    type ComponentPropSlot = ComponentPropItem<'SLOT'>

    type ComponentProp = ComponentPropString | ComponentPropNumber | ComponentPropBoolean | ComponentPropFunction | ComponentPropObject | ComponentPropArray | ComponentPropSlot

    interface Method {
      name: string
      args: Array<string>
      content?: (string | MGNode)
      returnValue?: string | MGNode
    }

  }
}

export { }
