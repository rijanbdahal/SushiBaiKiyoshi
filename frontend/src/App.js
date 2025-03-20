import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthProvider";
import Login from "./pages/LoginPage";
import Register from "./pages/RegistrationPage";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/management/InventoryPage";
import ReceiveFish from "./pages/management/ReceiveFish";
import AddSupplierAddress from "./pages/management/AddSupplierAddress";
import PlaceOrder from "./pages/client/PlaceOrder";
import AddMenuItems from "./pages/management/AddMenuItems";
import ViewOrder from "./pages/management/ViewOrder";
import CardDetails from "./pages/client/CardDetails";
import EditUser from "./pages/management/EditUser";
import UserProfile from "./pages/client/UserProfile";
import Error from "./pages/Error";


function App() {
  return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/receivefish" element={<ReceiveFish />} />
              <Route path="/addsupplieraddress" element={<AddSupplierAddress />} />
              <Route path="/placeorder" element={<PlaceOrder />} />
              <Route path="/addmenuitems" element={<AddMenuItems />} />
              <Route path="/vieworder" element={<ViewOrder />} />
              <Route path="/carddetails" element={<CardDetails />} />
              <Route path="/edituser" element={<EditUser />} />
            <Route path="/viewprofile" element={<UserProfile />} />

            <Route path="/" element={<Dashboard />} />
            <Route path="/*" element={<Error />} />

          </Routes>
        </Router>
      </AuthProvider>
  );
}

export default App;
