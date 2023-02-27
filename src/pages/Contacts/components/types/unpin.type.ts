import { EditItem } from "@/components/EditTabs"

export type OnCLickView = (viewId: string) => void

export type OnClickRename = (viewId: string, viewName: string) => void

export type unpinTabContent = (viewId: string, viewName: string, onClickView: OnCLickView, onCLickRename: OnClickRename) => JSX.Element

export interface UnpinTabProps {
  viewId: string
  name: string
  state: { [key: string]: any }
  setState: (prestate: { [key: string]: any }) => void
  viewType?: string
  savePinView: (params: any) => Promise<any>
}


export interface renderUnpinViewParams {
  state: { [key: string]: any }
  setState: (prestate: { [key: string]: any }) => void
  viewType?: string
  savePinView: (params: any) => Promise<any>
  onViewEdit: (targetKey: any, action: 'add' | 'remove') => void,
  onViewChange: (key: string) => void
}

export type renderView = (params: renderUnpinViewParams) => EditItem | null