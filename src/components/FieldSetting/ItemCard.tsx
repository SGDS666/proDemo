import React, { useRef } from 'react';
import type { DropTargetMonitor } from 'react-dnd';
import { useDrag, useDrop } from 'react-dnd';
import { CloseOutlined } from '@ant-design/icons';
import type { XYCoord } from 'dnd-core';
import { Row, Col } from 'antd';

const style = {
  border: '1px dashed gray',
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  backgroundColor: 'white',
  cursor: 'move',
  height: 40,
};

const firstStyle = {
  border: '1px solid gray',
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  backgroundColor: 'white',
  height: 40,
};

const ItemTypes = { CARD: 'card' };

export interface CardProps {
  id: string;
  text: string;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  removeCard: (index: number) => void;
  changeCard: (index: number, value: string) => void;
  belongTo: string;
}
/*
interface DragItem {
  index: number;
  id: string;
  type: string;
}*/
export const ItemCard: React.FC<CardProps> = ({
  id,
  index,
  text,
  moveCard,
  removeCard,
  belongTo,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  let fixHeaderNum = 3;
  if (belongTo === 'company') {
    fixHeaderNum = 1;
  }
  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover(item: any, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: { type: ItemTypes.CARD, id, index },
    type: ItemTypes.CARD,
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  if (index < fixHeaderNum) {
    return (
      <div style={firstStyle}>
        <Row>
          <Col span={22}>
            <span>{text}</span>
          </Col>
        </Row>
      </div>
    );
  } else {
    return (
      <div ref={ref} style={{ ...style, opacity }}>
        <Row>
          <Col span={23} key="1">
            <div>{text}</div>
          </Col>
          <Col span={1} key="2">
            <a onClick={() => removeCard(index)}>
              <CloseOutlined />
            </a>
          </Col>
        </Row>
      </div>
    );
  }
};
