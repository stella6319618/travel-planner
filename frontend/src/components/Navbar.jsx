import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800">
            旅遊規劃
          </Link>
          <div className="flex space-x-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
            >
              行程列表
            </Link>
            <Link
              to="/trips/new"
              className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md"
            >
              新增行程
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
