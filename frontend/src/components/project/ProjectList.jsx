// src/components/project/ProjectList.jsx
import ProjectCard from "./ProjectCard";
import { useNavigate } from "react-router-dom";

export default function ProjectList({ projects, loading, error }) {
  const navigate = useNavigate();

  if (loading) return <p>Đang tải dự án...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (projects.length === 0) return <p>Chưa có dự án nào</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          onClick={() => navigate(`/duan/${project._id}`)}
        />
      ))}
    </div>
  );
}
