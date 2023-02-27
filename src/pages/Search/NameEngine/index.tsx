import React from 'react';
import RightContainer from '@/components/Global/RightContainer';
import { useSetState } from 'ahooks';
import TaskList from './components/TaskList';
import TaskCompanyViews from '../TaskCompanyViews';

const NameEngine: React.FC = () => {
  const [state, setState] = useSetState({
    step: 'task', // task | org | people
    task_id: '', // 当前任务ID
    taskInfo: {},
  });

  return (
    <RightContainer pageTitle={false} pageGroup="search" pageActive="tasks">
      <div hidden={state.step !== 'task'}>
        <TaskList
          setStep={(step: string) => setState({ step })}
          setTaskInfo={(info: any) => setState({ taskInfo: info })}
        />
      </div>
      <div hidden={state.step !== 'company'}>
        <TaskCompanyViews
          taskInfo={state.taskInfo}
          setStep={(step: string) => setState({ step })}
        />
      </div>
    </RightContainer>
  );
};

export default NameEngine;
