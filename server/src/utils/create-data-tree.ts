export const createDataTree = <T extends { task_id: any; parent_id: any }>(
  dataset: T[],
): T[] => {
  const hashTable = Object.create(null);
  dataset.forEach(
    (aData) => (hashTable[aData.task_id] = { ...aData, projectName: '' }),
  );
  const dataTree = [];
  dataset.forEach((aData) => {
    if (aData.parent_id)
      hashTable[aData.task_id].projectName = hashTable[aData.parent_id].name;

    dataTree.push(hashTable[aData.task_id]);
  });
  return dataTree;
};
