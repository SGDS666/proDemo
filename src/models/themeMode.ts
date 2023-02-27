import { useModel } from "@umijs/max"


export default () => {
    const { initialState } = useModel("@@initialState")
    const settings = initialState?.settings
    if (settings?.navTheme === "light") {
        return "light"
    }
    return "dark"


}