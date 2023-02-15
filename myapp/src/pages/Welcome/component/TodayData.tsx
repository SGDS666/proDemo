import { useLink } from '@/hooks/useLink';
import { Card } from 'antd';
import styles from './index.less';
const MockData = [
    { title: "联系人新增数量", value: 0, path:"/contacts/contacts"},
    { title: "联系人删除数量", value: 0, path:"/contacts/recycle"},
    { title: "联系人导出信息", value: 0,path:"/contacts/export-history" },
    { title: "获客额度消耗", value: 0,path:"/search/packages"},
    { title: "获客邮箱增加", value: 0,path:"/search/saved" },
    { title: "获客任务完成", value: 0, path:"/search/tasks"},
    { title: "群发额度消耗", value: 0, path:"/marketing/tasks"},
    { title: "群发邮件数量", value: 0, path:"/marketing/tasks"},
    { title: "群发阅读数量", value: 0, path:"/marketing/tasks"},
]
const TodayData = () => {
    const linkto = useLink()
    return (
        <Card title="今日数据" 
        style={{ marginTop: "10px", height: "30vh" }} 
        bodyStyle={{width:"100%",height:"86%",padding:0}}
        >
            <div className={styles.box} >
                {MockData.map((item, index) => {
                    return (
                        <Card.Grid  key={index} className={styles.carditem} onClick={()=>linkto(item.path)}>
                            <h5>{item.title}</h5>
                            <p>{item.value}</p>
                        </Card.Grid>
                    )

                })}
            </div>


        </Card>
    )
}


export default TodayData