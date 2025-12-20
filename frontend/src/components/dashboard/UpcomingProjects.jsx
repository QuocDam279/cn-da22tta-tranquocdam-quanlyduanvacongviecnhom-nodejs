import { AlertTriangle } from "lucide-react";

export default function UpcomingProjects({ projects }) {
  if (!projects.length) {
    return (
      <div className="text-gray-400 text-sm text-center">
        Không có dự án sắp đến hạn
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div
          key={project._id}
          className="p-4 rounded-xl border hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="font-medium text-sm">{project.project_name}</p>
          </div>

          <p className="text-xs text-gray-500">
            Deadline: {new Date(project.end_date).toLocaleDateString()}
          </p>

          <div className="mt-2 text-xs text-gray-600">
            Tiến độ: {project.progress}%
          </div>
        </div>
      ))}
    </div>
  );
}
