let nodes: any[] = [];

export const addNode = (node:any) => {
  const exists = nodes.find(n => n.id === node.id);
  if (!exists) nodes.push(node);
};

export const getNodes = () => nodes;