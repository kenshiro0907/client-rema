
import React from 'react';

const ExportSection: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-rose-50 p-4 rounded-lg border border-rose-200 flex justify-between items-center">
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    <button className="bg-red-300 text-gray-900 font-semibold px-6 py-2 text-sm rounded-md hover:bg-red-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
      Exporter
    </button>
  </div>
);

const StatisticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <ExportSection title="Demandes" />
      <ExportSection title="Ménages" />
      <ExportSection title="Objets des maraudes (produits/services)" />
      <ExportSection title="Données cartographiques" />
    </div>
  );
};

export default StatisticsPage;
