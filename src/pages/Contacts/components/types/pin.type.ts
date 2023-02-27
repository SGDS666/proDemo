
export type pinTabClick = (params: pinTabClickParams) => JSX.Element

export interface PinTabNameProps {
  viewId: string
  index: number
  state: { [key: string]: any }
  setState: (pre: { [key: string]: any }) => void
  viewType?: string
  savePinView: (params: any) => Promise<any>
}
export interface pinTabClickParams extends PinTabNameProps {
  viewName: string
}