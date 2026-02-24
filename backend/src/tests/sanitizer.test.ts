import { sanitizeDependencies } from '../utils/sanitizer';
import { Task } from '../utils/schema';

const testSanitization = () => {
    console.log('Running Dependency Sanitizer Tests...');

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

    // Assertions
    const task3 = result.sanitizedTasks.find(t => t.id === "task_3");

    if (task3 && task3.dependencies.length === 1 && task3.dependencies[0] === "task_1") {
        console.log('✅ Correctly removed non-existent dependency from task_3');
    } else {
        console.error('❌ Failed to remove non-existent dependency from task_3');
    }

    if (result.warnings.length === 1 && result.warnings[0].includes("ghost_id")) {
        console.log('✅ Correctly recorded warning for ghost dependency');
    } else {
        console.error('❌ Failed to record warning for ghost dependency');
    }

    if (result.sanitizedTasks.length === 3) {
        console.log('✅ Task list length preserved');
    }

    console.log('\nFinal Warnings:');
    result.warnings.forEach(w => console.log(` - ${w}`));
};

testSanitization();
