import { history } from "@umijs/max"
import { useCallback } from "react"

export const useLink = () => {
    const linkto = useCallback((href:string) => {
        history.push(href)
    }, [])
    return linkto
}