import { Handle, Position } from "reactflow";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const TaskNode = ({ data }: { data: any }) => {
    const isBlocked = data.status === "blocked";

    return (
        <div className={`px-4 py-3 shadow-md rounded-lg border-2 bg-white ${isBlocked ? "border-red-400" : "border-green-400"}`}>
            <div className="flex items-center gap-2 mb-1">
                {isBlocked ? (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Priority {data.priority}
                </span>
            </div>

            <div className="text-sm font-semibold text-gray-800 mb-1 leading-tight">
                {data.description}
            </div>

            <div className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-block ${isBlocked ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                {data.status.toUpperCase()}
            </div>

            <Handle type="target" position={Position.Top} className="w-2 h-2 bg-gray-400!" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-gray-400!" />
        </div>
    );
};

export default TaskNode;
