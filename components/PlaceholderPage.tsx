
import React from 'react';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="bg-rose-50 p-6 rounded-lg border border-rose-200 flex justify-center items-center h-full min-h-[400px]">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-700">Section {title}</h2>
        <p className="text-gray-500 mt-2">Cette section est en cours de développement.</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
