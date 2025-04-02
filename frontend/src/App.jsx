import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import TripList from "./components/TripList";
import TripDetail from "./components/TripDetail";
import CreateTrip from "./components/CreateTrip";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./routes/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <main className="bg-white px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <TripList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trips/new"
                  element={
                    <ProtectedRoute>
                      <CreateTrip />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trips/:id"
                  element={
                    <ProtectedRoute>
                      <TripDetail />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
