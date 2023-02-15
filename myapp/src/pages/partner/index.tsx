import { Button,  message } from 'antd';
import Partnerlist from './component/Partnerlist';
import TipCard from './component/TipCard';
import UserList from './component/userlist';
import styles from './index.less';
const Partner = () => {
    return (
        <div className={styles.box} >
            <div className={styles.left}>
                <div className={styles.domain}>
                    <div className={styles.h1}>
                        <h1>邀好友 赚现金 </h1>
                        <h1>佣金高达20% 可提现</h1>
                    </div>
                    
                    <div className={styles.cardbox}>
                        <TipCard
                            title="可提佣金"
                            tiptitle='满100可以提现 且每月只能提现一次'
                            value={<>¥<span>0.00</span></>}
                            button={<Button disabled>提现</Button>}
                        />
                        <TipCard
                            title="邀请代码"
                            tiptitle='我的邀请码'
                            value={<>**********</>}
                            button={<Button type="primary" onClick={() => {
                                message.open({
                                    type: 'success',
                                    content: '复制成功',
                                });
                            }}>复制</Button>}
                        />
                        <TipCard
                            title="注册链接"
                            tiptitle='我的邀请注册链接'
                            value={<code>********************</code>}
                            button={<Button type="primary" onClick={() => {

                                message.open({
                                    type: 'success',
                                    content: '复制成功',
                                });
                            }}>复制</Button>}
                        />
                        <TipCard
                            title="邀请人数"
                            tiptitle='邀请的用户总数'
                            value={0}

                        />
                        <TipCard
                            title="邀请消费"
                            tiptitle='邀请的用户累计消费总金额'
                            value={<>¥<span>0.00</span></>}

                        />
                        <TipCard
                            title="获得佣金"
                            tiptitle='累计获取的佣金总金额'
                            value={<>¥<span>0.00</span></>}

                        />
                    </div>
                    <div className={styles.h1}>
                        <h1>专属链接  永久绑定</h1>
                        <h1>笔笔返现  消费就返</h1>
                    </div>
                </div>
                <div className={styles.Rebate}>
                        <UserList/>
                </div>
            </div>
            <div className={styles.right}>
                <Partnerlist />
            </div>
        </div>
    )
}


export default Partner