"use client";

import React, { useMemo } from "react";
import ReactFlow, {
    Background,
    Controls,
    Edge,
    Node,
    MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import TaskNode from "./TaskNode";

const nodeTypes = {
    task: TaskNode,
};

interface GraphViewProps {
    tasks: any[];
    cycles: any[][];
}

const GraphView: React.FC<GraphViewProps> = ({ tasks, cycles }) => {
    const { nodes, edges } = useMemo(() => {
        const nodes: Node[] = tasks.map((task, index) => ({
            id: task.id.toString(),
            type: "task",
            data: {
                description: task.description,
                priority: task.priority,
                status: task.status
            },
            position: { x: index * 250, y: index * 100 }, // Simple auto-layout placeholder
        }));

        const edges: Edge[] = [];
        tasks.forEach((task) => {
            if (task.dependencies) {
                const deps = task.dependencies.split(",").filter((d: string) => d.length > 0);
                deps.forEach((depId: string) => {
                    // Dependency is from depId to current task
                    edges.push({
                        id: `e-${depId}-${task.id}`,
                        source: depId,
                        target: task.id.toString(),
                        className: "stroke-gray-400 stroke-2",
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: "#94a3b8",
                        },
                    });
                });
            }
        });

        return { nodes, edges };
    }, [tasks]);

    return (
        <div style={{ width: "100%", height: "600px" }} className="bg-gray-50 rounded-xl border-2 border-gray-200 shadow-inner overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default GraphView;
