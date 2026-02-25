import { detectCycles } from '../utils/graph';
import { Task } from '../utils/schema';

describe('Cycle Detection Tests', () => {
    it('should correctly identify when there is no cycle', () => {
        const noCycleTasks: Task[] = [
            { id: "A", description: "Task A", priority: 1, dependencies: [] },
            { id: "B", description: "Task B", priority: 2, dependencies: ["A"] },
            { id: "C", description: "Task C", priority: 3, dependencies: ["A", "B"] }
        ];

        const res1 = detectCycles(noCycleTasks);
        expect(res1.hasCycle).toBe(false);
        expect(res1.topologicalOrder?.join(',')).toBe('A,B,C');
    });

    it('should correctly identify a simple cycle A -> B -> A', () => {
        const simpleCycleTasks: Task[] = [
            { id: "A", description: "Task A", priority: 1, dependencies: ["B"] },
            { id: "B", description: "Task B", priority: 2, dependencies: ["A"] }
        ];

        const res2 = detectCycles(simpleCycleTasks);
        expect(res2.hasCycle).toBe(true);
        expect(res2.cycles.length).toBeGreaterThan(0);
    });

    it('should correctly identify a cycle in disconnected components', () => {
        const complexTasks: Task[] = [
            { id: "1", description: "1", priority: 1, dependencies: [] },
            { id: "2", description: "2", priority: 1, dependencies: ["1"] },
            { id: "C1", description: "C1", priority: 1, dependencies: ["C2"] },
            { id: "C2", description: "C2", priority: 1, dependencies: ["C1"] }
        ];
        const res3 = detectCycles(complexTasks);

        expect(res3.hasCycle).toBe(true);
        const hasSpecificCycle = res3.cycles.some(c => c.includes("C1") && c.includes("C2"));
        expect(hasSpecificCycle).toBe(true);
    });
});
