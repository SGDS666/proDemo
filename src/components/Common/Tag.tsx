import { Tag } from 'antd';

export const renderTagsTree = (data: any) => {
  const tree = [];
  const childrens: any = {};
  for (const idx in data) {
    const { parent, id, name, color, folder } = data[idx];
    if (folder) {
      childrens[id] = [];
    } else {
      childrens[parent]?.push({
        id,
        value: id,
        title: <Tag color={color}>{name}</Tag>,
        name,
      });
    }
  }
  for (const idx in data) {
    const { parent, id, name, color, folder } = data[idx];
    if (parent === '0' && folder) {
      const children = childrens[id];
      tree.push({ id, value: id, title: name, children });
    } else if (parent === '0' && !folder) {
      tree.push({
        id,
        value: id,
        title: <Tag color={color}>{name}</Tag>,
        name,
      });
    }
  }
  return tree;
};
