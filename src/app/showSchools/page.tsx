'use client';

import { useEffect, useState } from 'react';

interface School {
  id: number;
  name: string;
  address: string;
  city: string;
  image: string | null;
}

export default function ShowSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        // ✅ call the correct API route
        const response = await fetch('/schools');
        if (!response.ok) {
          throw new Error('Failed to fetch schools');
        }
        const data = await response.json();
        setSchools(data);
      } catch (err) {
        console.error('Error fetching schools:', err);
        setError('Error loading schools. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading schools...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Schools Directory</h1>
          <p className="mt-2 text-lg text-gray-600">
            Browse through our list of registered schools
          </p>
        </div>

        {schools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No schools found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {schools.map((school) => (
              <div
                key={school.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                  {school.image ? (
                    <img
                      src={school.image}
                      alt={school.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No image</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {school.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {school.address.length > 100
                      ? `${school.address.substring(0, 100)}…`
                      : school.address}
                  </p>
                  <p className="text-gray-500 text-sm">{school.city}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
