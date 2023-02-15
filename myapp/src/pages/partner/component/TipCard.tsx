import { QuestionCircleTwoTone } from '@ant-design/icons'
import { Tooltip} from 'antd'
import { ReactNode } from 'react'
import styles from '../index.less'
interface TipCardProps {
    title:ReactNode,
    value:ReactNode,
    tiptitle: string,

    button?: ReactNode,

}
const TipCard:React.FC<TipCardProps> = ({title,tiptitle,value,button}) => {
    return (
        <div className={styles.infocard}>
        <div className={styles.title}>
            <h2>{title}</h2>
            <Tooltip title={tiptitle}>
                <QuestionCircleTwoTone
                    style={{ fontSize: "20px" }} />
            </Tooltip>
        </div>
        <h3>{value}</h3>
        {button}
    </div>
    )
}
export default TipCard