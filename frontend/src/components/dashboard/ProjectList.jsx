import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProjectList() {
  const navigate = useNavigate();

  const sampleProjects = [
    { id: 1, title: 'Website Redesign', description: 'Redesign the company website.' },
    { id: 2, title: 'Mobile App Development', description: 'Develop mobile app for iOS/Android.' },
    { id: 3, title: 'Marketing Campaign', description: 'Launch campaign for new product.' },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Projects</h2>
      <div className="space-y-4">
        {sampleProjects.map(project => (
          <div
            key={project.id}
            onClick={() => navigate(`/project/${project.id}`)}
            className="cursor-pointer border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium text-blue-600">{project.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}