
type logicObj = {
  /**
   * 运行条件
   */
  bool: any,
  /**
   * 
   * run1: 条件成立时运行
   */
  run1: () => void
  /**
   * 
   * run2 条件不成立时运行
   */
  run2: () => void
}
/**
 * 
 * @param logicObjArray
 * 
 * * {bool,run1,run2}[]
 * 
 * * bool:条件,run1:条件为true运行 run2:条件为false 运行
 * 
 * * 每个条件对象都会运行
 * 
 */
type logicFunc = (logicObjArray: logicObj[]) => void


export const logicSort: logicFunc = l => l.forEach(({ bool, run1, run2 }) => bool ? run1?.() : run2?.())

