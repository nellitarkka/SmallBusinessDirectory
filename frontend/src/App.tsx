import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CustomerLoginPage from "./pages/CustomerLoginPage";
import VendorLoginPage from "./pages/VendorLoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import CustomerRegisterPage from "./pages/CustomerRegisterPage";
import VendorRegisterPage from "./pages/VendorRegisterPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CustomerDashboardPage from "./pages/CustomerDashboardPage";
import VendorDashboardPage from "./pages/VendorDashboardPage";
import CustomerMyVendorsPage from "./pages/CustomerMyVendorsPage";
import VendorDetailPage from "./pages/VendorDetailPage";
import CustomerMessagesPage from "./pages/CustomerMessagesPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import VendorInboxPage from "./pages/VendorInboxPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* login routes */}
      <Route path="/login/customer" element={<CustomerLoginPage />} />
      <Route path="/login/vendor" element={<VendorLoginPage />} />
      <Route path="/login/admin" element={<AdminLoginPage />} />

      {/* signup routes */}
      <Route path="/signup/customer" element={<CustomerRegisterPage />} />
      <Route path="/signup/vendor" element={<VendorRegisterPage />} />

      {/* dashboards */}
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
      <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
      
      {/* others */}
      <Route path="/customer/my-vendors" element={<CustomerMyVendorsPage />} />
      <Route path="/vendors/:id" element={<VendorDetailPage />} />
      <Route path="/customer/messages" element={<CustomerMessagesPage />} />
      <Route path="/customer/profile" element={<CustomerProfilePage />} />
      <Route path="/vendor/inbox" element={<VendorInboxPage />} />
    </Routes>
  );
}

export default App;
