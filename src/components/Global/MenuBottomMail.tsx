import React from 'react';
import { Badge } from 'antd';
import { Link } from '@umijs/max';
import { MailOutlined } from '@ant-design/icons';

const MenuBottomMail: React.FC = () => {
  return (
    <div>
      <Link to="/mails">
        <Badge>
          <MailOutlined />
        </Badge>
        <span style={{ paddingLeft: '12px' }}>邮件</span>
      </Link>
    </div>
  );
};

export default MenuBottomMail;
