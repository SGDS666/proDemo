import React from 'react';
import { Card } from 'antd';
import RightContainer from '@/components/Global/RightContainer';
import { useSetState } from 'ahooks';
import { ContactTagContainers } from '@/components/DndKit/ContactTagContainers';
import { rectSortingStrategy } from '@dnd-kit/sortable';
import RcResizeObserver from 'rc-resize-observer';

const EnterpriseTeams: React.FC = () => {
  const [state, setState] = useSetState<Record<string, any>>({
    tagColumns: 6,
  });

  return (
    <RightContainer pageTitle={false} pageGroup="settings" pageActive="tags" className='both-down'>
      <Card bodyStyle={{ padding: 0 }}>
        <RcResizeObserver
          key="resize-observer"
          onResize={() => {
            const { innerWidth } = window;
            if (innerWidth >= 1920) {
              setState({ tagColumns: 8 });
            } else if (innerWidth >= 1600) {
              setState({ tagColumns: 8 });
            } else if (innerWidth >= 1200) {
              setState({ tagColumns: 6 });
            } else {
              setState({ tagColumns: 4 });
            }
          }}
        >
          <ContactTagContainers
            columns={state.tagColumns}
            strategy={rectSortingStrategy}

            // wrapperStyle={() => ({
            //   height: 32,
            // })}
            containerStyle={{ width: '100%' }}
            vertical
            handle
          />
        </RcResizeObserver>
      </Card>

      {/* <ProCard split="vertical" style={{ minHeight: '80vh' }}>
        <ProCard
          loading={treeLoading}
          title={false}
          colSpan="200px"
          ghost
          headerBordered
          extra={
            <Button
              type="primary"
              key="addDir"
              onClick={() => setState({ dirCreateVisible: true })}
              style={{ marginRight: 48 }}
            >
              <PlusOutlined /> 新建目录
            </Button>
          }
        >
          <Tree
            blockNode
            treeData={dirTreeData}
            titleRender={titleRender}
            defaultExpandAll
            showLine={{ showLeafIcon: false }}
            style={{ paddingTop: 12 }}
            onSelect={onTeamSelect}
            selectedKeys={[state.parentId]}
          />
        </ProCard>
        <ProCard title={false}>
          <ProTable<API.RuleListItem, API.PageParams>
            toolBarRender={() => [
              <Button
                type="primary"
                key="primary"
                onClick={() => setState({ createVisible: true })}
                style={{ marginRight: 24 }}
              >
                <PlusOutlined /> 新建标签
              </Button>,
            ]}
            headerTitle={'标签列表'}
            actionRef={actionRef}
            rowKey="id"
            search={false}
            columns={columns}
            rowSelection={false}
            onLoad={dataReload}
            request={(params, sorter, filter) =>
              apiContactTagsList({ ...params, sorter, filter, parent: state.parentId })
            }
          />
          
        </ProCard>
      </ProCard> */}
    </RightContainer>
  );
};

export default EnterpriseTeams;
