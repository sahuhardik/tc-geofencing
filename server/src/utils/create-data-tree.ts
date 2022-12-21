export const createDataTree = <T extends { task_id: any; parent_id: any }>(
  dataset: T[],
): T[] => {
  const hashTable = Object.create(null);
  dataset.forEach(
    (aData) => (hashTable[aData.task_id] = { ...aData, childNodes: [] }),
  );
  const dataTree = [];
  dataset.forEach((aData) => {
    if (aData.parent_id)
      hashTable[aData.parent_id].childNodes.push(hashTable[aData.task_id]);
    else dataTree.push(hashTable[aData.task_id]);
  });
  return dataTree;
};
