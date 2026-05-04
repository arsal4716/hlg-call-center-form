const Skeleton = ({ type = 'table', rows = 5 }) => {
  if (type === 'table') {
    return (
      <div className="animate-pulse">
        {/* Table header skeleton */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-9 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Table rows skeleton */}
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 border-b border-gray-100">
            <div className="grid grid-cols-9 gap-4">
              {[...Array(9)].map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-10 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="flex justify-end">
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return null;
};

export default Skeleton;