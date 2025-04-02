import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800">
            旅遊規劃
          </Link>
          <div className="flex space-x-4 items-center">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  行程列表
                </Link>
                <div className="flex items-center ml-4">
                  <span className="text-gray-700 mr-2">{user?.username}</span>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-800 px-3 py-2 rounded-md"
                  >
                    登出
                  </button>
                </div>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md"
                >
                  登入
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md"
                >
                  註冊
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
