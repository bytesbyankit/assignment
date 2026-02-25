import { sanitizeDependencies } from '../utils/sanitizer';
import { Task } from '../utils/schema';

describe('Dependency Sanitizer Tests', () => {
    it('should correctly remove non-existent ghost dependencies', () => {
        const tasks: Task[] = [
            {
                id: "task_1",
                description: "First task",
                priority: 1,
                dependencies: []
            },
            {
                id: "task_2",
                description: "Second task with valid dependency",
                priority: 2,
                dependencies: ["task_1"]
            },
            {
                id: "task_3",
                description: "Third task with ghost dependency",
                priority: 3,
                dependencies: ["ghost_id", "task_1"]
            }
        ];

        const result = sanitizeDependencies(tasks);

        const task3 = result.sanitizedTasks.find(t => t.id === "task_3");
        expect(task3).toBeDefined();
        expect(task3?.dependencies).toHaveLength(1);
        expect(task3?.dependencies).toContain("task_1");
        expect(task3?.dependencies).not.toContain("ghost_id");

        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]).toContain("ghost_id");
        expect(result.sanitizedTasks).toHaveLength(3);
    });

    it('should return warnings mapped correctly for each removed dependency', () => {
        const tasks: Task[] = [
            {
                id: "task_A",
                description: "Task A",
                priority: 1,
                dependencies: ["missing_X", "missing_Y"]
            }
        ];

        const result = sanitizeDependencies(tasks);

        expect(result.sanitizedTasks[0].dependencies).toEqual([]);
        expect(result.warnings.length).toBe(2);
        expect(result.warnings[0]).toContain("missing_X");
        expect(result.warnings[1]).toContain("missing_Y");
    });
});
