import { ReactNode } from 'react';
import styles from './index.less';

type DescData = { label: ReactNode, value: ReactNode, key: string }
const DefaultData: DescData[] = [
    { label: "当前ip", value: "127.0.0.1", key: "1" },
    { label: "位置信息", value: "地球", key: "2" },
    { label: "访问速度", value: "1000ms", key: "3" },
    { label: "提示信息", value: "66666", key: "4" },

]
const Desc: React.FC<{ data?: DescData[] }> = ({ data=DefaultData }) => {
    return (
        <div className={styles.box} >
            {
                data.map((item) => {
                    return (
                        <div className={styles.item} key={item.key}>
                            <div className={styles.label}>{item.label}</div>
                            <div className={styles.value}>{item.value}</div>
                        </div>
                    )
                })
            }
        </div>
    )
}


export default Desc