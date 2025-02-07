import React, { useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';

function TaskManagementDashboard() {
  const [projectDetails, setProjectDetails] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    setProjectDetails(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('https://llm-projectmanagement.onrender.com/manage-project', {
        project_details: projectDetails
      });
      setResponse(res.data);
    } catch (error) {
      setError('There was an error processing your request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20; // Initial vertical position
  
    // Add title
    doc.setFontSize(20);
    doc.text("Project Management Result", 14, y);
    y += 10;
  
    // Add the comprehensive progress report
    doc.setFontSize(12);
    doc.text("Comprehensive Progress Report", 14, y);
    y += 10;
    
    // Check for content overflow and add new pages if needed
    const splitText = doc.splitTextToSize(response.raw || "No data available.", 180);
    splitText.forEach(line => {
      if (y > 280) { // Prevent overflow
        doc.addPage();
        y = 20;
      }
      doc.text(line, 14, y);
      y += 7; // Move down for the next line
    });
  
    // Add task output
    doc.addPage(); // Add a new page
    y = 20;
    doc.text("Tasks Output", 14, y);
    y += 10;
  
    response.tasks_output.forEach((task, index) => {
      if (y > 280) { // Prevent overflow
        doc.addPage();
        y = 20;
      }
  
      doc.text(`Task ${index + 1}:`, 14, y);
      y += 7;
      doc.text(`Agent: ${task.agent}`, 14, y);
      y += 7;
      doc.text(`Description: ${task.description}`, 14, y);
      y += 7;
      doc.text(`Expected Output: ${task.expected_output}`, 14, y);
      y += 7;
  
      if (task.raw) {
        const taskText = doc.splitTextToSize(task.raw, 180);
        taskText.forEach(line => {
          if (y > 280) { // Prevent overflow
            doc.addPage();
            y = 20;
          }
          doc.text(line, 14, y);
          y += 7;
        });
      }
      
      y += 10; // Space before next task
    });
  
    // Add token usage
    doc.addPage();
    y = 20;
    doc.text("Token Usage", 14, y);
    y += 10;
    doc.text(`Prompt Tokens: ${response.token_usage.prompt_tokens}`, 14, y);
    y += 7;
    doc.text(`Completion Tokens: ${response.token_usage.completion_tokens}`, 14, y);
    y += 7;
    doc.text(`Total Tokens: ${response.token_usage.total_tokens}`, 14, y);
  
    // Save the PDF
    doc.save("project_management_result.pdf");
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4">
      <h1 className="text-3xl font-bold mb-6">Project Management</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-md">
        <label className="block mb-4">
          <span className="text-gray-300">Project Details:</span>
          <input
            type="text"
            value={projectDetails}
            onChange={handleChange}
            placeholder="Enter project details"
            className="w-full mt-2 p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <button
          type="submit"
          className="w-full p-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition duration-200"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Start Project'}
        </button>
      </form>

      {loading && <p className="mt-4 text-gray-400">Loading...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      {response && (
        <button
          onClick={generatePDF}
          className="mt-6 p-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition duration-200"
        >
          Download Project Report
        </button>
      )}
    </div>
  );
}

export default TaskManagementDashboard;
