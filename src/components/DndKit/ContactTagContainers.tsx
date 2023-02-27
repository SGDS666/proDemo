import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal, unstable_batchedUpdates } from 'react-dom';
import type {
  CancelDrop,
  CollisionDetection,
  DropAnimation,
  Modifiers,
  UniqueIdentifier,
  KeyboardCoordinateGetter,
} from '@dnd-kit/core';
import {
  closestCenter,
  pointerWithin,
  rectIntersection,
  DndContext,
  DragOverlay,
  getFirstCollision,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensors,
  useSensor,
  MeasuringStrategy,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type { AnimateLayoutChanges, SortingStrategy } from '@dnd-kit/sortable';
import {
  SortableContext,
  useSortable,
  arrayMove,
  defaultAnimateLayoutChanges,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { coordinateGetter as multipleContainersCoordinateGetter } from './multipleContainersKeyboardCoordinates';

import type { ContainerProps } from './components';
import { ItemTag, Container } from './components';

import { exTagsItems } from './utilities';

import { apiTagsItems, apiTagsDirsSort, apiTagsSort } from '@/services/contacts';
import { useRequest } from '@umijs/max';
import { Button, Dropdown, message, Modal, Space } from 'antd';
import { DeleteOutlined, DownOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import TagsCreate from '../Contacts/TagsCreate';
import { useSetState } from 'ahooks';
import TagsUpdate from '../Contacts/TagsUpdate';
import TagsDirCreate from '../Contacts/TagsDirCreate';
import TagsDirUpdate from '../Contacts/TagsDirUpdate';
import { apiContactTagsDelete } from '@/services/settings';

interface SortableItemProps {
  containerId: UniqueIdentifier;
  id: UniqueIdentifier;
  index: number;
  handle: boolean;
  disabled?: boolean;
  style: (args: any) => React.CSSProperties;
  getIndex: (id: UniqueIdentifier) => number;
  renderItem: () => React.ReactElement;
  wrapperStyle: ({ index }: { index: number }) => React.CSSProperties;
  color?: string;
  value: any;
}

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}

function SortableItem({
  disabled,
  id,
  index,
  handle,
  renderItem,
  style,
  containerId,
  getIndex,
  wrapperStyle,
  color,
  value,
}: SortableItemProps) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    isDragging,
    isSorting,
    over,
    overIndex,
    transform,
    transition,
  } = useSortable({
    id,
  });
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  return (
    <ItemTag
      ref={disabled ? undefined : setNodeRef}
      value={value}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={handle ? { ref: setActivatorNodeRef } : undefined}
      index={index}
      wrapperStyle={wrapperStyle({ index })}
      style={style({
        index,
        value: id,
        isDragging,
        isSorting,
        overIndex: over ? getIndex(over.id) : overIndex,
        containerId,
      })}
      color={color}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
      renderItem={renderItem}
    />
  );
}

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

function DroppableContainer({
  children,
  columns = 1,
  disabled,
  id,
  items,
  style,
  ...props
}: ContainerProps & {
  disabled?: boolean;
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  style?: React.CSSProperties;
}) {
  const { active, attributes, isDragging, listeners, over, setNodeRef, transition, transform } =
    useSortable({
      id,
      data: {
        type: 'container',
        children: items,
      },
      animateLayoutChanges,
    });
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== 'container') || items.includes(over.id)
    : false;

  if (id === '0') {
    return (
      <Container columns={columns} {...props} handle={false}>
        {children}
      </Container>
    );
  }

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      hover={isOverContainer}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      columns={columns}
      {...props}
    >
      {children}
    </Container>
  );
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

interface Props {
  adjustScale?: boolean;
  cancelDrop?: CancelDrop;
  columns?: number;
  containerStyle?: React.CSSProperties;
  coordinateGetter?: KeyboardCoordinateGetter;
  getItemStyles?: (args: {
    value: UniqueIdentifier;
    index: number;
    overIndex: number;
    isDragging: boolean;
    containerId: UniqueIdentifier;
    isSorting: boolean;
    isDragOverlay: boolean;
  }) => React.CSSProperties;
  wrapperStyle?: (args: { index: number }) => React.CSSProperties;
  itemCount?: number;
  items?: Items;
  handle?: boolean;
  renderItem?: any;
  strategy?: SortingStrategy;
  modifiers?: Modifiers;
  minimal?: boolean;
  trashable?: boolean;
  scrollable?: boolean;
  vertical?: boolean;
}

export const TRASH_ID = 'void';
const PLACEHOLDER_ID = 'placeholder';

// 回收站
function Trash({ id }: { id: UniqueIdentifier }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        left: '50%',
        marginLeft: -150,
        bottom: 20,
        width: 300,
        height: 60,
        borderRadius: 5,
        border: '1px solid',
        borderColor: isOver ? 'red' : '#DDD',
      }}
    >
      Drop here to delete
    </div>
  );
}

export function ContactTagContainers({
  adjustScale = false,
  cancelDrop,
  columns,
  handle = false,
  containerStyle,
  coordinateGetter = multipleContainersCoordinateGetter,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  minimal = false,
  modifiers,
  renderItem,
  strategy = verticalListSortingStrategy,
  trashable = false,
  vertical = false,
  scrollable,
}: Props) {
  const [items, setItems] = useState<Items>({});
  const [containers, setContainers] = useState<UniqueIdentifier[]>([]);
  const [tagsObjs, setTagsOjbs] = useState<any>({});
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer = activeId ? containers.includes(activeId) : false;

  const [state, setState] = useSetState<Record<string, any>>({
    parentId: '',
    current: {},
    createVisible: false,
    updateVisible: false,
    dirCreateVisible: false,
    dirUpdateVisible: false,
  });

  const { run: itemsRun } = useRequest(apiTagsItems, {
    onSuccess: (data: any) => {
      if (!data) return;
      const { tagsItems, tagsObjs: _tagsObjs } = exTagsItems(data);
      setTagsOjbs(_tagsObjs);
      setItems(tagsItems);
      setContainers(Object.keys(tagsItems));
    },
  });

  const actionReload = () => {
    itemsRun();
  };

  const { run: deleteRun } = useRequest(apiContactTagsDelete, {
    manual: true,
    onSuccess: () => {
      actionReload();
    },
  });

  const { run: dirSortRun } = useRequest(apiTagsDirsSort, {
    manual: true,
    onSuccess: () => {
      actionReload();
    },
  });

  const { run: sortRun } = useRequest(apiTagsSort, {
    manual: true,
    onSuccess: () => {
      actionReload();
    },
  });

  const onDeleteTagsDir = (id: any) => {
    if (items[id]?.length) {
      message.error('目录内存在标签时不可删除');
      return;
    }
    deleteRun({ id });
  };

  const onDeleteTag = (id: any, name: string, desc: string) => {
    if (!desc) {
      // eslint-disable-next-line no-param-reassign
      desc = '无';
    }
    Modal.confirm({
      centered: true,
      title: `确认删除标签: ${name}`,
      content: `标签备注：${desc}`,
      onOk: () => deleteRun({ id }),
    });
  };

  const getTagMessage = (id: any) => {
    if (tagsObjs[id]) {
      return tagsObjs[id];
    }
    return {};
  };

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in items,
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
          pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, 'id');

      if (overId !== null) {
        if (overId === TRASH_ID) {
          // If the intersecting droppable is the trash, return early
          // Remove this if you're not using trashable functionality in your app
          return intersections;
        }

        if (overId in items) {
          const containerItems = items[overId];

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) => container.id !== overId && containerItems.includes(container.id),
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, items],
  );
  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    }),
  );
  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) => items[key].includes(id));
  };

  const getIndex = (id: UniqueIdentifier) => {
    const container = findContainer(id);

    if (!container) {
      return -1;
    }

    const index = items[container].indexOf(id);

    return index;
  };

  const onDragCancel = () => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      setItems(clonedItems);
    }

    setActiveId(null);
    setClonedItems(null);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  function renderSortableItemDragOverlay(id: UniqueIdentifier) {
    const { name, color } = getTagMessage(id);
    return (
      <ItemTag
        value={name}
        handle={handle}
        style={getItemStyles({
          containerId: findContainer(id) as UniqueIdentifier,
          overIndex: -1,
          index: getIndex(id),
          value: id,
          isSorting: true,
          isDragging: true,
          isDragOverlay: true,
        })}
        color={color}
        wrapperStyle={wrapperStyle({ index: 0 })}
        renderItem={renderItem}
        dragOverlay
      />
    );
  }

  function renderContainerDragOverlay(containerId: UniqueIdentifier) {
    const { name: dirName } = getTagMessage(containerId);
    return (
      <Container
        label={dirName}
        columns={columns}
        style={{
          height: '100%',
          background: "none"
        }}
        shadow
        unstyled={false}
      >
        {items[containerId].map((item, index) => {
          const { name, color } = getTagMessage(item);
          return (
            <ItemTag
              key={item}
              value={name}
              handle={handle}
              style={getItemStyles({
                containerId,
                overIndex: -1,
                index: getIndex(item),
                value: item,
                isDragging: false,
                isSorting: false,
                isDragOverlay: false,
              })}
              color={color}
              wrapperStyle={wrapperStyle({ index })}
              renderItem={renderItem}
            />
          );
        })}
      </Container>
    );
  }

  function getNextContainerId() {
    const containerIds = Object.keys(items);
    const lastContainerId = containerIds[containerIds.length - 1];

    return String.fromCharCode(lastContainerId.charCodeAt(0) + 1);
  }

  return (
    <DndContext

      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={({ active }) => {
        setActiveId(active.id);
        setClonedItems(items);
      }}
      onDragOver={({ active, over }) => {
        const overId: any = over?.id;

        if (overId === null || overId === TRASH_ID || active.id in items) {
          return;
        }

        const overContainer = findContainer(overId);
        const activeContainer = findContainer(active.id);

        if (!overContainer || !activeContainer) {
          return;
        }

        if (activeContainer !== overContainer) {
          setItems(() => {
            const activeItems = items[activeContainer];
            const overItems = items[overContainer];
            const overIndex = overItems.indexOf(overId);
            const activeIndex = activeItems.indexOf(active.id);

            let newIndex: number;

            if (overId in items) {
              newIndex = overItems.length + 1;
            } else {
              const isBelowOverItem =
                over &&
                active.rect.current.translated &&
                active.rect.current.translated.top > over.rect.top + over.rect.height;

              const modifier = isBelowOverItem ? 1 : 0;

              newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            recentlyMovedToNewContainer.current = true;

            return {
              ...items,
              [activeContainer]: items[activeContainer].filter((item) => item !== active.id),
              [overContainer]: [
                ...items[overContainer].slice(0, newIndex),
                items[activeContainer][activeIndex],
                ...items[overContainer].slice(newIndex, items[overContainer].length),
              ],
            };
          });
        }
      }}
      onDragEnd={({ active, over }) => {
        if (active.id in items && over?.id) {
          // 标签组移动
          setContainers(() => {
            const activeIndex = containers.indexOf(active.id);
            const overIndex = containers.indexOf(over.id);
            const ids = arrayMove(containers, activeIndex, overIndex);
            if (active.id !== over.id) {
              dirSortRun({ ids });
            }
            return ids;
          });
        }

        const activeContainer = findContainer(active.id);

        if (!activeContainer) {
          setActiveId(null);
          return;
        }

        const overId: any = over?.id;

        if (overId === null) {
          setActiveId(null);
          return;
        }

        if (overId === TRASH_ID) {
          setItems(() => ({
            ...items,
            [activeContainer]: items[activeContainer].filter((id) => id !== activeId),
          }));
          setActiveId(null);
          return;
        }

        if (overId === PLACEHOLDER_ID) {
          const newContainerId = getNextContainerId();

          unstable_batchedUpdates(() => {
            setContainers(() => [...containers, newContainerId]);
            setItems(() => ({
              ...items,
              [activeContainer]: items[activeContainer].filter((id) => id !== activeId),
              [newContainerId]: [active.id],
            }));
            setActiveId(null);
          });
          return;
        }

        const overContainer = findContainer(overId);
        if (overContainer) {
          // 标签移动 active.id拖动的ID，经过ID：overId，放置的标签组：overContainer
          const activeIndex = items[activeContainer].indexOf(active.id);
          const overIndex = items[overContainer].indexOf(overId);
          const ids = arrayMove(items[overContainer], activeIndex, overIndex); // 放置后的标签组所有id
          sortRun({ dirId: overContainer, ids });
          if (activeIndex !== overIndex) {
            setItems(() => ({
              ...items,
              [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex),
            }));
          }
        }

        setActiveId(null);
      }}
      cancelDrop={cancelDrop}
      onDragCancel={onDragCancel}
      modifiers={modifiers}
    >
      <div
        style={{
          display: 'inline-grid',
          boxSizing: 'border-box',
          padding: 20,
          gridAutoFlow: vertical ? 'row' : 'column',
        }}
      >
        <SortableContext
          items={[...containers, PLACEHOLDER_ID]}
          strategy={vertical ? verticalListSortingStrategy : horizontalListSortingStrategy}
        >
          {containers?.map((containerId) => {
            const { id: dirId, name: dirName, description } = getTagMessage(containerId);
            if (dirId) {
              return (
                <DroppableContainer

                  key={containerId}
                  id={containerId}
                  label={
                    <div>
                      <Space>
                        <Dropdown
                          menu={{
                            items: [
                              {
                                key: "save",
                                label: "修改目录",
                                icon: <EditOutlined />,
                                onClick: () => {
                                  setState({
                                    current: getTagMessage(containerId),
                                    dirUpdateVisible: true,
                                  })
                                }

                              },
                              {
                                key: "delete",
                                label: "删除目录",
                                icon: <DeleteOutlined />,
                                onClick: () => onDeleteTagsDir(containerId)
                              }
                            ]
                          }}
                          disabled={containerId === '0'}
                        >
                          <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                            <Space>
                              {dirName}
                              <a style={{ fontSize: 14, fontWeight: 400 }}>
                                {items[containerId]?.length}
                              </a>
                              {containerId === '0' ? null : <DownOutlined />}
                            </Space>
                          </div>
                        </Dropdown>
                        {description ? (
                          <span style={{ fontSize: 10, fontWeight: 50 }}>备注：{description}</span>
                        ) : null}
                      </Space>
                    </div>
                  }
                  columns={columns}
                  items={items[containerId]}
                  scrollable={scrollable}
                  style={containerStyle}
                  unstyled={minimal}
                  onRemove={undefined}
                  handle
                >
                  <SortableContext items={items[containerId]} strategy={strategy}>
                    {items[containerId]?.map((value, index) => {
                      const { id, name, color, description: desc } = getTagMessage(value);
                      return (
                        <SortableItem
                          disabled={isSortingContainer}
                          key={value}
                          id={id}
                          value={
                            <Dropdown
                              menu={{
                                items: [
                                  {
                                    key: "save",
                                    icon: <EditOutlined />,
                                    label: "修改标签",
                                    onClick: () => setState({
                                      current: getTagMessage(id),
                                      updateVisible: true,
                                    })
                                  },
                                  {
                                    key: "delete",
                                    icon: <DeleteOutlined />,
                                    label: "删除标签",
                                    onClick: () => onDeleteTag(id, name, desc)
                                  }
                                ]
                              }}

                            >
                              <div
                                style={{
                                  width: '100%',
                                  textOverflow: 'ellipsis',
                                  overflow: 'hidden',
                                }}
                              >
                                {name}
                              </div>
                            </Dropdown>
                          }
                          index={index}
                          handle={handle}
                          style={getItemStyles}
                          wrapperStyle={wrapperStyle}
                          renderItem={renderItem}
                          containerId={containerId}
                          getIndex={getIndex}
                          color={color}
                        />
                      );
                    })}
                    <Button
                      type="dashed"
                      onClick={() => setState({ parentId: containerId, createVisible: true })}
                      size="small"
                    >
                      <PlusOutlined /> 新增标签
                    </Button>
                  </SortableContext>
                </DroppableContainer>
              );
            }
            return null;
          })}
        </SortableContext>
        <Button
          type="dashed"
          style={{ width: '100%', marginBottom: 8, height: 54, fontSize: 16 }}
          onClick={() => setState({ dirCreateVisible: true })}
        >
          <PlusOutlined />
          新增标签目录
        </Button>
      </div>
      {createPortal(
        <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
          {activeId
            ? containers.includes(activeId)
              ? renderContainerDragOverlay(activeId)
              : renderSortableItemDragOverlay(activeId)
            : null}
        </DragOverlay>,
        document.body,
      )}
      {trashable && activeId && !containers.includes(activeId) ? <Trash id={TRASH_ID} /> : null}
      <TagsCreate
        visible={state.createVisible}
        onCancel={() => setState({ createVisible: false })}
        actionReload={() => actionReload()}
        parentId={state.parentId}
      />
      <TagsUpdate
        visible={state.updateVisible}
        onCancel={() => setState({ updateVisible: false })}
        actionReload={() => actionReload()}
        initValues={state.current}
      />
      <TagsDirCreate
        visible={state.dirCreateVisible}
        onCancel={() => setState({ dirCreateVisible: false })}
        actionReload={() => actionReload()}
      />
      <TagsDirUpdate
        visible={state.dirUpdateVisible}
        onCancel={() => setState({ dirUpdateVisible: false })}
        actionReload={() => actionReload()}
        initValues={state.current}
      />
    </DndContext>
  );

  // function handleRemove(containerID: UniqueIdentifier) {
  //   setContainers(() => containers.filter((id) => id !== containerID));
  // }
}
