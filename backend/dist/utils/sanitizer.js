"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeDependencies = void 0;
/**
 * Ensures all dependencies reference existing task IDs.
 * Removes broken references and reports them as warnings.
 */
const sanitizeDependencies = (tasks) => {
    const validIds = new Set(tasks.map((t) => t.id));
    const warnings = [];
    const sanitizedTasks = tasks.map((task) => {
        const validDeps = task.dependencies.filter((depId) => {
            if (validIds.has(depId)) {
                return true;
            }
            else {
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
exports.sanitizeDependencies = sanitizeDependencies;
//# sourceMappingURL=sanitizer.js.map