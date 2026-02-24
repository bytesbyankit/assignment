import { detectCycles } from '../utils/graph';
import { Task } from '../utils/schema';

const testCycleDetection = () => {
    console.log('Running Cycle Detection Tests...');

    // Case 1: No Cycle
    const noCycleTasks: Task[] = [
        { id: "A", description: "Task A", priority: 1, dependencies: [] },
        { id: "B", description: "Task B", priority: 2, dependencies: ["A"] },
        { id: "C", description: "Task C", priority: 3, dependencies: ["A", "B"] }
    ];

    const res1 = detectCycles(noCycleTasks);
    if (!res1.hasCycle && res1.topologicalOrder?.join(',') === 'A,B,C') {
        console.log('✅ Correctly identified no cycle and topological order');
    } else {
        console.error('❌ Failed no-cycle test', res1);
    }

    // Case 2: Simple Cycle A -> B -> A
    const simpleCycleTasks: Task[] = [
        { id: "A", description: "Task A", priority: 1, dependencies: ["B"] },
        { id: "B", description: "Task B", priority: 2, dependencies: ["A"] }
    ];

    const res2 = detectCycles(simpleCycleTasks);
    if (res2.hasCycle && res2.cycles.length > 0) {
        console.log('✅ Correctly identified simple cycle');
        console.log('   Cycles found:', JSON.stringify(res2.cycles));
    } else {
        console.error('❌ Failed simple cycle test', res2);
    }

    // Case 3: Disconnected components with a cycle
    const complexTasks: Task[] = [
        { id: "1", description: "1", priority: 1, dependencies: [] },
        { id: "2", description: "2", priority: 1, dependencies: ["1"] },
        { id: "C1", description: "C1", priority: 1, dependencies: ["C2"] },
        { id: "C2", description: "C2", priority: 1, dependencies: ["C1"] }
    ];
    const res3 = detectCycles(complexTasks);
    if (res3.hasCycle && res3.cycles.some(c => c.includes("C1") && c.includes("C2"))) {
        console.log('✅ Correctly identified cycle in disconnected graph');
    } else {
        console.error('❌ Failed complex cycle test', res3);
    }
};

testCycleDetection();
