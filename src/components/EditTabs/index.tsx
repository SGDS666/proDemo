
import { CloseOutlined, DownCircleOutlined } from '@ant-design/icons'
import { theme } from 'antd'
import React, { MouseEvent, ReactNode } from 'react'
import styles from './index.less'
export type ReactDiv = {
  style?: React.CSSProperties,
  onClick?: (e: MouseEvent) => void,
  children?: ReactNode,
  key?: string | number,
  className?: string
}
export interface EditItem extends ReactDiv {
  /**标签页名称 */
  label: ReactNode,
  /**删除标签页的动作 */
  onDelete?: () => void,
  /**编辑标签页的动作 */
  onEdit?: () => void,

}
export interface EditTabsProps extends ReactDiv {
  /**
   * 标签页对象数组
   */
  items: EditItem[],
  /**
   * 所有标签页的样式
   */
  childStyle?: React.CSSProperties,
  /**
   * 所有标签页的类名 (不是唯一的 子组件自身也可以设置类名)
   */
  childClassName?: string,
  /**
   * 右侧的功能标签
   */
  optionItems?: EditItem[]

}
interface EditItemProps extends ReactDiv {
  item: EditItem
}
const { useToken } = theme
const Item: React.FC<EditItemProps> = (props) => {
  const { item, style, className, ...otherprops } = props
  const { token } = useToken()
  return (
    <div className={`${styles.item} ${className} both-big`} {...otherprops} style={{ ...style }}>
      <div className={styles.label} style={{ color: token.colorTextLabel }} onClick={item?.onClick}>{item?.label}</div>
      {item?.children &&
        <div className={styles.more} style={{ color: token.colorTextLabel }}>
          {item?.children ?? <DownCircleOutlined onClick={item?.onEdit} />}

        </div>}
      {item?.onDelete && <div className={styles.closd} style={{ color: token.colorTextLabel }} onClick={item.onDelete}>
        <CloseOutlined style={{ color: token.colorTextLabel, width: '100%', height: "100%" }} />
      </div>}


    </div>
  )
}
const EditTabs: React.FC<EditTabsProps> = (props) => {
  const { items, optionItems, style, childClassName, childStyle, className, ...otherprops } = props
  const { token } = useToken()

  return (
    <div
      className={`${styles.box} ${className} `}
      style={{ borderColor: token.colorBorderSecondary, ...style }}
      {...otherprops}
    >
      <div
        className={`${styles.pinbox} `}
        style={{ borderColor: token.colorBorderSecondary }}>
        {items?.map((item) => {
          return (
            item?.label && <Item item={item} key={item?.key} style={{ ...childStyle, ...item.style }} className={`${item.className} ${childClassName}`} />
          )
        })}
      </div>
      <div style={{ marginLeft: "20px", "display": "flex", flexWrap: "wrap" }}>
        {optionItems?.map((item) => {

          return (
            <Item item={item} key={item?.key} style={{ ...childStyle, ...item.style }} className={`${item.className} ${childClassName}`} />
          )
        })}
      </div>

    </div>
  )
}

export default EditTabs