import type { Properties, PropertiesHyphen } from 'csstype';

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
      readonly framework: Framework
      readonly nodeMap: Record<NodeId, MGNode>
      readonly localStyle: StyleMap
      readonly fileMap: Record<FileId, MGDSLFile>
      root: MGNode
      settings: DSLSettings
      entry: MGDSLFile
    }

    // js dsl模板
    interface JSDSLData extends MGDSLData{
      /**
       * 全局样式表
       */
      globalStyleMap: {
        [classId: string]: ClassStyle
      }
    }
    interface ReactDSLData extends JSDSLData {
      readonly framework: 'REACT'
    }
    interface Vue3DSLData extends JSDSLData {
      readonly framework: 'VUE3'
    }
    interface Vue2DSLData extends JSDSLData {
      readonly framework: 'VUE2'
    }
    interface AndroidDSLData extends MGDSLData {
      readonly framework: 'ANDROID'
    }
    interface IOSDSLData extends MGDSLData {
      readonly framework: 'IOS'
    }

    type Framework = 'REACT' | 'VUE2' | 'VUE3' | 'ANDROID' | 'IOS'

    interface StyleMap {
      paints: PaintStyle[]
      texts: TextStyle[]
      effects: EffectStyle[]
      stroke: StrokeStyle[]
    }

    /**
     * 配置
     */
    interface DSLSettings {
      /**
       * 是否使用自定义样式，默认为true
       */
      useToken: boolean
    }

    interface ClassStyle {
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
      type: 'OPERATION' | 'LAYER'
    }

    interface MGLayerNode extends MGNode {
      type: 'LAYER'
      id: LayerId
      children: NodeId[]
      name: string
      /**
       * 图层实际类型名称 RECTANGLE TEXT FRAME...
       */
      layerType: NodeType
      // 是否是蒙版
      isMask: boolean
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
      layerType: 'COMPONENT'
      alias: string
      /**
       * 是组件集子组件的话则存在
       */
      componentSetId?: string
    }

    interface MGInstanceNode extends MGLayerNode {
      layerType: 'INSTANCE'
      /**
       * 实例的主组件Layer, 这里不开通用模型就不解析
       */
      mainComponent?: LayerId
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
      overflow?: 'HIDDEN' | 'VISIBLE'
      /**
       * 相对于父元素的布局
       */
      relatedLayout?: AbsoluteLayout | RelatedAutoLayout
    }

    /**
     * 自动布局
     */
    type AutoLayout = {
      direction: 'COLUMN' | 'ROW',
      layoutWrap: 'NO_WRAP' | 'WRAP'
      // 轴距
      itemSpacing: Dimension | 'AUTO'
      // 交叉轴距, 只有在 layoutWrap = 'WRAP'时生效
      crossAxisSpacing: Dimension | 'AUTO' | null
      paddingTop: Dimension
      paddingRight: Dimension
      paddingBottom: Dimension
      paddingLeft: Dimension
      /**
       * 主轴对齐方式
       */
      mainAxisAlignItems: AlignTypes
      /**
       * 交叉轴对齐方式
       */
      crossAxisAlignItems: Exclude<AlignTypes, 'SPACE_BETWEEN'>
      /**
       * 仅当换行的时候，交叉轴的多行对齐方式
       */
      crossAxisAlignContent: 'AUTO' | 'SPACE_BETWEEN'
      /**
       * 描边是否包含在布局内
       */
      strokesIncludedInLayout: boolean
      itemReverseZIndex: boolean
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
    type AlignTypes = 'START' | 'END' | 'CENTER' | 'SPACE_BETWEEN'
    /**
     * 尺寸单位
     */
    type Dimension = {
      type: 'PIXEL' | 'PERCENT' | 'CALC'
      value: number | string
    }

    interface NodeStyle {
      /**
       * 和localClassMap的key保持一致
       */
      id: `style-${NodeId}`
      type: NodeStyleType
    }

    interface CssNodeStyle extends NodeStyle {
      value: StyleSet
      /**
       * key为属性名称
       */
      attributes: Record<string, AttributeItem>
      /**
       * 行内样式
       */
      inlineStyles?: Record<keyof StyleSet, string | Raw>
      /**
      * 样式名数组
      */
      classList?: ClassId[]
      /**
       * 标签名称
       */
      tag?: 'img' | 'div' | 'button' | 'input' | 'slot' | 'svg'
    }

    /**
     * static 静态属性
     * dynamic 动态属性
     * method 方法
     * unbind 无需绑定的属性
     */
    type Attribute = 'static' | 'dynamic' | 'method' | 'unbind'

    interface AttributeItem {
      type: Attribute
      /**
       * 属性名
       */
      name: string
      /**
       * 属性值或者是对应的函数名称
       */
      value: string
      /**
       * 参数类型
       */
      valueType: ComponentPropType
      /**
       * 属性值的来源
       */
      valueSource?: 'props' | 'methods' | 'data'
      /**
       * 函数的表达式
       */
      expression?: string
      /**
       * 默认值
       */
      defaultValue?: string | number | boolean
      /**
       * 方法的传参
       */
      arguments?: string[]
    }

    type IOSNodeStyle = NodeStyle

    type AndroidNodeStyle = NodeStyle

    interface StyleSet
      extends Properties<string | number>,
      PropertiesHyphen<string | number> {
    }

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
      type: 'OPERATION'
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
      operationType: 'RAW'
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
      data: Record<string, any>
      props: Record<string, ComponentProp>
      methods: Record<string, Method>
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

export { };
