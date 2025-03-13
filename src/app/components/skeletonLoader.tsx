const SkeletonLoader = () => {
    return (
      <div className="border border-gray-300 rounded-lg overflow-auto mb-8" style={{ maxWidth: "100vw" }}>
        <table className="min-w-full bg-white resizable">
          <thead>
            <tr className="bg-gray-200 resizable header">
              <th className="py-2 px-4 text-left">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </th>
              <th className="py-2 px-4 text-left">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </th>
              <th className="py-2 px-4 text-left">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </th>
              <th className="py-2 px-4 text-left">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </th>
              <th className="py-2 px-4 text-left">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </th>
              <th className="py-2 px-4 text-left">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, index) => (
              <tr key={index} className="border-t">
                <td className="py-2 px-4">
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                </td>
                <td className="py-2 px-4">
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                </td>
                <td className="py-2 px-4">
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                </td>
                <td className="py-2 px-4">
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                </td>
                <td className="py-2 px-4">
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                </td>
                <td className="py-2 px-4">
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default SkeletonLoader;