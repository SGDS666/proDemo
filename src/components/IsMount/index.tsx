import { ReactNode, useEffect } from "react"



interface IsMountProps {
  bool: any// 当显示条件成立时挂载子组件
  fallback?: ReactNode // 当显示条件不成立时的替代组件(可选) 默认为空
  mountAction?: () => ReactNode//当条件成立且需要通过数组遍历组件且chilren为空时调用
  children?: ReactNode
}

/**
 * 
 * @param bool 当显示条件成立时挂载子组件
 * @param fallback // 当显示条件不成立时的替代组件(可选) 默认为空
 * @param mountAction: //当条件成立且children为空时调用 赋值给children
 * @returns 
 */
const IsMount: React.FC<IsMountProps> = (
  {
    bool,
    children,
    fallback,
    mountAction
  }) => {

  useEffect(() => {
    if (children && mountAction) {
      console.warn("children 和 mapCompontent 同时有值");
    }
  }, [children, mountAction])


  return (
    <>
      {

        bool ? children ?? mountAction?.() ?? null
          :
          fallback ? fallback : null
      }
    </>


  )
}

export default IsMount