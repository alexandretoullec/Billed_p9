import LoginUI from "../views/LoginUI.js";
import BillsUI from "../views/BillsUI.js";
import NewBillUI from "../views/NewBillUI.js";
import DashboardUI from "../views/DashboardUI.js";

// Define route paths as constants

export const ROUTES_PATH = {
  Login: "/",
  Bills: "#employee/bills",
  NewBill: "#employee/bill/new",
  Dashboard: "#admin/dashboard",
};
// Function to map route paths to UI components based on pathname and other data
export const ROUTES = ({ pathname, data, error, loading }) => {
  switch (pathname) {
    case ROUTES_PATH["Login"]:
      return LoginUI({ data, error, loading }); // Render Login UI
    case ROUTES_PATH["Bills"]:
      return BillsUI({ data, error, loading }); // Render Bills UI
    case ROUTES_PATH["NewBill"]:
      return NewBillUI(); // Render New Bill UI
    case ROUTES_PATH["Dashboard"]:
      return DashboardUI({ data, error, loading }); // Render Dashboard UI
    default:
      return LoginUI({ data, error, loading }); // Default to Login UI if the route is not recognized
  }
};
