import { ReactDiv } from '@/components/EditTabs'
import { ReactNode, useEffect, useState } from 'react'
import styles from './index.less'
import { theme } from 'antd'
const { useToken } = theme
interface CheckCardProps extends ReactDiv {
  title: ReactNode,
  avatar?: ReactNode
  value: string | number,
  check?: boolean,
  disabled?: boolean,
  description?: ReactNode,
  extra: ReactNode,


}
interface CheckCardsProps extends ReactDiv {
  /**
  * 
  * @param props 可选以下配置项
  * {value,title,avatar,description,disabled.extra}
  * * value 是必须传入的 用与卡片交互  和父组件的checkcard 值一致时即选中状态
  * * 只传入 avatar 和 title的情况下 图标和标题 水平方向排列  长度比 2:8 充满盒子
  * * title 和 description 都传入的情况下 两者会再右侧垂直排列  高度比:3:7
  * * 不传入 avatar 时 title和 description 所在的容器会自动占满整个卡片
  * * 自定义整个卡片内容  只需要传入description  会自动充满整个卡片 
  * * extra 卡片标签 位置会保持在 卡片右上方
  * 
  */
  Cards: CheckCardProps[] | any[],
  /**
   * 
   * @param checkedValue 子组件点击后会调用onChange 传入自身的value 方便父组件更新状态
   */
  onChange?: (checkedValue: any) => void,
  /**
   * 检查值 如果从父组件传入 onchange中获取最新的值时需要更新状态 
   * 不传入的情况下 状态由CheckCards组件自身维护
   */
  checkValue?: string | number,
  /**
   * * 如果检查值在组件挂载到页面前无法获取 
   * 
   * * 可以传入一个函数会在组件第一次挂载后调用  
   * 
   * * 内部状态会更新成这个函数的返回值
   *  
   * * 当使用这个方法进行获取默认值后 状态将由组件内部维护 由用户交互更新 
   * 
   * * 外部可以通过onChange获取最新值 但在本次生命周期内 外部不再能更改这个状态
   * 
   * * 如果有父组件维护的checkvalue 不要用这个方法!!!
   * 
   * * 如果只是想设置默认值且没有外部更改checkvalue的需求 可以在函数返回值处硬编码 
   * @returns defaultValue 
   */
  getDefaultValue?: () => string | number
  /**
   * 所有子组件Card的样式
   */
  childStyle?: React.CSSProperties,
  /**
   * 所有子组件Card的类名
   */
  childClassName?: string
}

const CheckCard: React.FC<CheckCardProps> = (props) => {
  const { title, avatar, check, disabled, onClick, style, description, extra, className, ...otherPorps } = props
  const { token } = useToken()
  return (
    <div
      className={check ? `${styles.checking} ${className}` : `${styles.checkCard} ${className}`}
      style={
        check ? {
          // background: token.colorPrimaryBgHover,
          outlineColor: token.colorPrimary,
          background: token.colorBgElevated,
          outlineWidth: "2px",
          outlineStyle: "auto",//适配safari 
          ...style
        } : style}
      {...otherPorps}
      onClick={disabled ? undefined : onClick}
    >

      <div className={check ? styles.checkContent : styles.content}>
        {
          avatar &&
          <div className={styles.avatar} >
            {avatar}
          </div>
        }
        <div className={styles.right}>
          {title && <div className={styles.head}>{title}</div>}
          {description && <div className={styles.body} style={{ color: token.colorTextDescription }}>{description}</div>}
        </div>
        {
          extra &&
          <div className={styles.extra}>
            {extra}
          </div>
        }

      </div>
      {disabled && <div className={styles.zz} style={{ background: token.colorBorder, opacity: "0.8" }}></div>}
    </div>
  )
}
const CheckCards: React.FC<CheckCardsProps> = (props) => {
  const { Cards, onChange, getDefaultValue, checkValue, childStyle, childClassName, ...otherPorps } = props
  const [locValue, setLocValue] = useState(checkValue)
  useEffect(() => {
    if (getDefaultValue) {
      setLocValue(getDefaultValue())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className={styles.checkCards} {...otherPorps}>
      {
        Cards.map(card => {
          const { style, onClick, ...otherProps } = card
          return (
            <CheckCard
              className={childClassName}
              style={{ ...childStyle, ...style }} //父组件可统一配置card样式 card自身页可以配置样式 覆盖父组件样式
              key={card.value}
              //一般传入的checkValue 都是父组件的state 通过onchange改变状态 和card的value进行对比 从而改变选中样式
              // 某些情况下 父组件没必要维护选择值 则组件自身进行维护一个state 通过setlocState改变状态 与card的value进行对比 从而改变样式
              check={checkValue ? card.value === checkValue : card.value === locValue}
              onClick={() => {
                //如果检查的值由父组件维护 则样式根据父组件传递改变
                if (!checkValue) {//如果父组件未维护检查值 使用局部状态改变样式
                  setLocValue(card.value) // 组件内部状态
                }
                onChange?.(card.value) //全局事件
                onClick?.()// 自身事件
              }}

              {...otherProps}
            />
          )
        })
      }
    </div>
  )
}

export default CheckCards