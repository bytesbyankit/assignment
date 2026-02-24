import { Task } from "./schema";

export interface CycleDetectionResult {
    hasCycle: boolean;
    cycles: string[][];
    topologicalOrder?: string[];
}

/**
 * Detects cycles in task dependencies using Kahn's algorithm.
 * If no cycles exist, returns the topological order.
 * If cycles exist, identifies the cycles.
 */
export const detectCycles = (tasks: Task[]): CycleDetectionResult => {
    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();
    const allIds = tasks.map(t => t.id);

    // Initialize
    allIds.forEach(id => {
        adj.set(id, []);
        inDegree.set(id, 0);
    });

    // Build graph: dependency -> task (edge from what you depend on to you)
    tasks.forEach(task => {
        task.dependencies.forEach(depId => {
            // Note: We assume dependencies are already sanitized or we ignore missing ones
            if (adj.has(depId)) {
                adj.get(depId)!.push(task.id);
                inDegree.set(task.id, (inDegree.get(task.id) || 0) + 1);
            }
        });
    });

    // Kahn's Algorithm
    const queue: string[] = [];
    inDegree.forEach((degree, id) => {
        if (degree === 0) queue.push(id);
    });

    const topologicalOrder: string[] = [];
    while (queue.length > 0) {
        const u = queue.shift()!;
        topologicalOrder.push(u);

        const neighbors = adj.get(u) || [];
        neighbors.forEach(v => {
            inDegree.set(v, inDegree.get(v)! - 1);
            if (inDegree.get(v) === 0) {
                queue.push(v);
            }
        });
    }

    const hasCycle = topologicalOrder.length !== tasks.length;

    if (!hasCycle) {
        return { hasCycle: false, cycles: [], topologicalOrder };
    }

    // Extraction of cycles (Simplified: nodes remaining in inDegree > 0 are part of cycles)
    const cyclicNodes = allIds.filter(id => !topologicalOrder.includes(id));
    const cycles: string[][] = [];
    const visited = new Set<string>();

    const findCycle = (startNode: string) => {
        const path: string[] = [];
        let curr = startNode;
        while (!path.includes(curr)) {
            path.push(curr);
            visited.add(curr);
            // Move to first neighbor that is also cyclic
            const neighbors = adj.get(curr) || [];
            const next = neighbors.find(n => cyclicNodes.includes(n)) || startNode;
            curr = next;
        }
        // Extract the loop part of the path
        const cycleStartIndex = path.indexOf(curr);
        return path.slice(cycleStartIndex);
    };

    cyclicNodes.forEach(node => {
        if (!visited.has(node)) {
            cycles.push(findCycle(node));
        }
    });

    return { hasCycle: true, cycles };
};
