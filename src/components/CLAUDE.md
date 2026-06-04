"use client";

import { useState, useEffect } from 'react';

const CLAUDEProjectDetails = () => {
  const [projectData, setProjectData] = useState({
    name: '',
    version: '',
    description: '',
    author: '',
    license: '',
    dependencies: {},
    devDependencies: {}
  });

  useEffect(() => {
    // Project details as per the CLAUDE.md file
    const projectDetails = {
      name: "nextjs-ai-app",
      version: "0.1.0",
      description: "A Next.js AI application with Clerk authentication and Tailwind CSS styling",
      author: "Claude",
      license: "MIT",
      dependencies: {
        "next": "^15.0.0",
        "react": "^19.0.0",
        "react-dom": "^19.0.0",
        "tailwindcss": "^4.0.0",
        "clerk": "^5.0.0"
      },
      devDependencies: {
        "@types/node": "^20.0.0",
        "@types/react": "^19.0.0",
        "@types/react-dom": "^19.0.0",
        "typescript": "^5.0.0"
      }
    };

    setProjectData(projectDetails);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Project Details</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-700">Name</h2>
          <p className="text-gray-600">{projectData.name}</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-700">Version</h2>
          <p className="text-gray-600">{projectData.version}</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-700">Description</h2>
          <p className="text-gray-600">{projectData.description}</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-700">Author</h2>
          <p className="text-gray-600">{projectData.author}</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-700">License</h2>
          <p className="text-gray-600">{projectData.license}</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-700">Dependencies</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            {Object.entries(projectData.dependencies).map(([dep, version]) => (
              <li key={dep} className="font-mono">{dep}: {version}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-700">Dev Dependencies</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            {Object.entries(projectData.devDependencies).map(([dep, version]) => (
              <li key={dep} className="font-mono">{dep}: {version}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Tech Stack</h3>
        <p className="text-gray-700">
          This project uses Next.js 15 with React 19, TypeScript, Tailwind CSS v4 for styling, 
          and Clerk for authentication. It follows modern web development practices with 
          responsive design and type-safe code.
        </p>
      </div>
    </div>
  );
};

export default CLAUDEProjectDetails;