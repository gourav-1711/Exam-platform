"use client";

import React from 'react';
import { Calendar, Clock, Flag, User } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
}

const TaskCard = ({ task }: { task: Task }) => {
  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4">{task.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          {task.date}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          {task.time}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <User className="w-4 h-4 mr-1" />
          {task.assignedTo}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
          View Details
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        <div className="flex space-x-2">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;