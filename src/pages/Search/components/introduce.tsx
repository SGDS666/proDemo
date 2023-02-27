import { CompanyIcon, UserIcon } from "@/components/Icon"
import { yieldDelayCss } from "@/utils/animation"
import { IeOutlined, LinkOutlined } from "@ant-design/icons"
import { useModel } from "@umijs/max"
import { Card, Divider, List, Image } from "antd"

const Introduce: React.FC<{ title: string }> = ({ title }) => {
    const themeMode = useModel("themeMode")
    const itemDelay = yieldDelayCss({ max: 6, delay: 0.15 })
    return (
        <Card
            style={{ marginTop: 12, width: 860, justifyContent: 'left', alignItems: 'left' }}
            title={title ?? ""}
            className="both-up "
        >
            <List itemLayout="horizontal">
                <List.Item>
                    <List.Item.Meta
                        avatar={<CompanyIcon style={{ width: 64 }} />}
                        title="企业信息"
                        description="为您展示企业基础信息、经营信息及联系信息"
                        className="both-left"
                        style={{ animationDelay: itemDelay.next().value! }}
                    />
                </List.Item>
                <List.Item>
                    <List.Item.Meta
                        avatar={<UserIcon style={{ width: 64 }} />}
                        title="联系人信息"
                        description="为您展示企业相关联系人信息"
                        className="both-left"
                        style={{ animationDelay: itemDelay.next().value! }}
                    />
                </List.Item>
                <List.Item>
                    <List.Item.Meta
                        avatar={<IeOutlined style={{ fontSize: 64, color: '#007FFC' }} />}
                        title="域名网址信息"
                        description="为您展示企业官网及域名相关信息"
                        className="both-left"
                        style={{ animationDelay: itemDelay.next().value! }}
                    />
                </List.Item>
                <List.Item>
                    <List.Item.Meta
                        avatar={<LinkOutlined style={{ fontSize: 64, color: '#007FFC' }} />}
                        title="相关企业推荐"
                        description="为您推荐同行业同地区的其他企业"
                        className="both-left"
                        style={{ animationDelay: itemDelay.next().value! }}
                    />
                </List.Item>
            </List>
            <Divider />
            <Image src="/examples/google.png" style={themeMode === "dark" ? { filter: "invert(1)" } : {}} />
        </Card>
    )
}
export default Introduce