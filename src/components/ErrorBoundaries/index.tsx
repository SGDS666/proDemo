
import React from 'react';
import ErrorUI from './errorUI'



class ErrorBoundary extends React.Component<any, any> {
    state: { hasError: boolean, code: string }
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, code: "" };

    }

    static getDerivedStateFromError(error: any) {
        // 更新 state 使下一次渲染能够显示降级后的 UI
        console.log(error)
        return { hasError: true, code: error.toString() };
    }

    componentDidCatch(error: any, errorInfo: any) {
        // 你同样可以将错误日志上报给服务
        console.log(error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            // 你可以自定义降级后的 UI 并渲染
            return <ErrorUI code={this.state.code} />
        }

        return this.props.children;
        // return <ErrorUI />
    }
}


export default ErrorBoundary