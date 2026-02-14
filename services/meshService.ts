import { MeshNode } from "../core/types";

export async function fetchMeshNodes(): Promise<MeshNode[]> {
  // later connect ML backend
  return [
    { id: "node-1", distance: 20, status: "safe" },
    { id: "node-2", distance: 55, status: "distress" },
  ];
}