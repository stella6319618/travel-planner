import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./components/Navbar";
import TripList from "./components/TripList";
import TripDetail from "./components/TripDetail";
import CreateTrip from "./components/CreateTrip";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <main className="bg-white px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<TripList />} />
              <Route path="/trips/new" element={<CreateTrip />} />
              <Route path="/trips/:id" element={<TripDetail />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
