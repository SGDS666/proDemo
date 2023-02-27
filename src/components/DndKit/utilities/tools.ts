export function exTagsItems(tagsList: any) {
  const tagsObjs = {};
  const tagsItems = {};
  const dirList = tagsList.filter((tags: any) => tags.folder);
  for (const idx in dirList) {
    const { id } = dirList[idx];
    tagsItems[id] = [];
  }
  for (const idx in tagsList) {
    const { id, parent, folder } = tagsList[idx];
    tagsObjs[id] = tagsList[idx];
    if (!folder && tagsItems[parent]) {
      tagsItems[parent] = [...tagsItems[parent], id];
    }
  }
  return { tagsItems, tagsObjs };
}
