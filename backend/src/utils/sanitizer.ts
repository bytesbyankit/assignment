import { Task } from "./schema";

export interface SanitizationResult {
    sanitizedTasks: Task[];
    warnings: string[];
}

/**
 * Ensures all dependencies reference existing task IDs.
 * Removes broken references and reports them as warnings.
 */
export const sanitizeDependencies = (tasks: Task[]): SanitizationResult => {
    const validIds = new Set(tasks.map((t) => t.id));
    const warnings: string[] = [];

    const sanitizedTasks = tasks.map((task) => {
        const validDeps = task.dependencies.filter((depId) => {
            if (validIds.has(depId)) {
                return true;
            } else {
                warnings.push(`Task "${task.id}" references non-existent dependency "${depId}". Removed.`);
                return false;
            }
        });

        return {
            ...task,
            dependencies: validDeps,
        };
    });

    return { sanitizedTasks, warnings };
};
