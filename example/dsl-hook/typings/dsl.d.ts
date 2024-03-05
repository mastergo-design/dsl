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
      framework: Framework
      readonly nodeMap: Record<NodeId, MGNode>
      readonly localStyleMap: StyleMap
      readonly fileMap: Record<FileId, MGDSLFile>
      root: MGLayerNode
      settings: DSLSettings
      entry: FileId
      /**
       * 预览代码时所引入esm模块，需要讲配置模型上的依赖模块引入
       */
      esmImportMap: Record<string, string>
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

    type TokenName = string
    type TokenValue = MGDSL.StyleSet[keyof MGDSL.StyleSet]
    /**
     * 自定义样式
     */
    type TokenItem = TokenCommonItem | TokenTextItem
    type TokenCommonItem = {
      id: string,
      type:
      | 'color'
      | 'padding'
      | 'border-radius'
      | 'border-width'
      | 'gap'
      name: TokenName,
      value: TokenValue,
      /**
       * 是否是多段
       */
      isMultiple?: boolean
    }
    type TokenTextSubItemType =
    | 'fontfamily'
    | 'fontstyle'
    | 'fontsize'
    | 'lineheight'
    | 'decoration'
    | 'letterspacing'

    type TokenTextItem = {
      id: string,
      type: 'text'
      name: TokenName,
      textItems: Record<TokenTextSubItemType, TokenTextSubItem>
    };

    type TokenTextSubItem = {
      type: TokenTextSubItemType
      name: TokenName,
      value: TokenValue | TokenName,
    }

    /**
     * TODO: 安卓自定义样式
     */
    type AndroidStyleItem = any
    /**
     * 自定义样式map
     */
    type StyleMap = {
      [styleId: string]: TokenItem | AndroidStyleItem
    };

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

    type MGNode = MGLayerNode | MGOperationNode

    interface MGLayerNode {
      type: 'LAYER'
      id: LayerId
      children: NodeId[]
      name: string
      /**
       * 图层在代码中的组件名
       */
      componentName: string
      /**
       * 图层实际类型名称 RECTANGLE TEXT FRAME...
       */
      layerType: NodeType
      // 是否是蒙版
      isMask: boolean
      // 是否隐藏
      isVisible: boolean
      layout: NodeLayout
      style: CssNodeStyle | IOSNodeStyle | AndroidNodeStyle
      /**
       * 是否是根元素
       */
      isRoot: boolean
      parent?: NodeId
      /**
       * 关联的文件
       */
      relatedFile: FileId
      /**
       * 是否拆分成新文件,默认false
       */
      isNewFile?: boolean
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

    interface MGCustomNode extends MGLayerNode {
      layerType: 'CUSTOM'
      tagName?: string
      props?: ComponentProp[]
      imports: ImportItem[]
    }

    interface MGTextNode extends MGLayerNode {
      characters: string
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
      | 'CUSTOM'

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
      disable?: boolean
    }

    /**
     * 分段样式
     */
    type TextSegStyle = {
      start: number
      end: number
      textStyleId: string
      textStyle: StyleSet
    }

    interface CssNodeStyle extends NodeStyle {
      /**
       * css类名
       */
      name: string
      /**
       * UI样式
       */
      value: StyleSet
      /**
       * 布局样式
       */
      layoutStyles: StyleSet
      /**
       * key为属性名称
       */
      attributes: Record<string, AttributeItem>
      /**
       * 行内样式
       */
      inlineStyles?: StyleSet
      /**
       * 动态行内样式
       */
      dynamicInlineStyles?: {
        [key in keyof StyleSet]: string
      }
      /**
       * 文字分段样式
       */
      textStyles?: TextSegStyle[]
      /**
      * 样式名数组
      */
      classList?: ClassId[]
      /**
       * 标签名称
       */
      tag?: 'IMG' | 'DIV' | 'TEXT' | 'BUTTON' | 'INPUT' | 'SLOT' | 'SVG' | 'OPTION'
      /**
       * 子选择器
       */
      subSelectors?: Array<ClassStyle>
    }

    /**
     * STATIC 静态属性
     * DYNAMIC 动态属性
     * METHOD 方法
     * UNBIND 只定义，但没有使用的属性
     */
    type Attribute = 'STATIC' | 'DYNAMIC' | 'METHOD' | 'UNBIND'

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
      valueType: keyof ComponentPropType
      /**
       * 属性值的来源
       */
      valueSource?: 'PROPS' | 'METHODS' | 'DATA'
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

    /**
     * 运算符
     */
    type MGOperationNode = IfStatement | Iteration | Raw | TernaryExpression

    /**
     * 条件判断
     */
    interface IfStatement {
      type: 'OPERATION'
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
    interface Iteration {
      type: 'OPERATION'
      operationType: 'ITERATOR'
      // 迭代的变量
      variable: string
      body: MGNode
    }

    /**
     * 原始字符串
     */
    interface Raw {
      type: 'OPERATION'
      operationType: 'RAW'
      body: string
    }
    /**
     * 三目运算
     */
    interface TernaryExpression {
      type: 'OPERATION'
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

    type ImportItem = {
      name: string
      path: string
      /**
       * DEFAULT: import name from 'path'
       * ALL: import * as name from 'path'
       * NAMED: import { name } from 'path'
       */
      type: 'DEFAULT' | 'ALL'// | 'NAMED'
    }

    interface MGDSLFile {
      id: FileId
      name: string
      entryLayerId: LayerId
      chunks: FileId[]
      data: Record<string, Data>
      props: Record<string, ComponentProp>
      methods: Record<string, Method>
      computed: Record<string, Computed>
      // 导入
      imports: ImportItem[]
    }

    type FileId = string

    type ComponentPropType = {
      'STRING': string
      'NUMBER': number
      'BOOLEAN': boolean
      'FUNCTION': string
      'OBJECT': Record<string, ComponentPropValue<keyof ComponentPropType>>
      'ARRAY': ComponentPropValue<keyof ComponentPropType>[]
      'SLOT': string | MGLayerNode[]
    }

    type ComponentPropValue<T extends keyof ComponentPropType> = {
      type: T
      value: ComponentPropType[T]
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
      content: string
      returnValue?: string
    }

    type Data = ComponentPropString | ComponentPropNumber | ComponentPropBoolean | ComponentPropFunction | ComponentPropObject | ComponentPropArray

    interface Computed {
      name: string
      args: Array<string>
      content: string
      returnValue?: string
      dependencies?: Array<string>
    }
  }
}

export { };
