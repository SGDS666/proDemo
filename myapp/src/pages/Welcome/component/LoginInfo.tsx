// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Alert, Card, Descriptions, Tag } from 'antd';
import Desc from '@/components/Desc';
// import styles from './index.less';
const LoginInfo = () => {
    return (
        <Card title="登陆信息" style={{ marginTop: "10px", height: "30vh" }}>
            <Desc data={[
                { label: "当前ip", value: "http://127.0.0.1", key: "1" },
                { label: "位置信息", value: "中国江苏省南京 (China Unicom Jiangsu Province Network)", key: "2" },
                { label: "访问速度", value: <Tag color="red">1000ms</Tag>, key: "3" },
                {
                    label: "提示信息", 
                    value: <Alert
                        message={<code>您正在使用代理软件，建议关闭以提升访问体验</code>}
                        type="info"
                        showIcon
                        style={{
                            fontSize: "12px",


                        }}/>, 
                    key: "4"
                },
            ]} />
        </Card>

    )
}


export default LoginInfo