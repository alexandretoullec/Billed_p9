import { ROUTES_PATH } from "../constants/routes.js";

// Define a variable to store the previous location
export let PREVIOUS_LOCATION = "";

// Create a class for handling the login process
// we use a class so as to test its methods in e2e tests
export default class Login {
  constructor({
    document,
    localStorage,
    onNavigate,
    PREVIOUS_LOCATION,
    store,
  }) {
    this.document = document;
    this.localStorage = localStorage;
    this.onNavigate = onNavigate;
    this.PREVIOUS_LOCATION = PREVIOUS_LOCATION;
    this.store = store;

    // Add event listeners to login forms
    const formEmployee = this.document.querySelector(
      `form[data-testid="form-employee"]`
    );
    formEmployee.addEventListener("submit", this.handleSubmitEmployee);
    const formAdmin = this.document.querySelector(
      `form[data-testid="form-admin"]`
    );
    formAdmin.addEventListener("submit", this.handleSubmitAdmin);
  }

  // Event handler for employee login form submission
  handleSubmitEmployee = (e) => {
    e.preventDefault();
    const user = {
      type: "Employee",
      email: e.target.querySelector(`input[data-testid="employee-email-input"]`)
        .value,
      password: e.target.querySelector(
        `input[data-testid="employee-password-input"]`
      ).value,
      status: "connected",
    };
    // Store user information in local storage
    this.localStorage.setItem("user", JSON.stringify(user));
    this.login(user)
      .catch((err) => this.createUser(user))
      .then(() => {
        this.onNavigate(ROUTES_PATH["Bills"]);
        this.PREVIOUS_LOCATION = ROUTES_PATH["Bills"];
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;
        this.document.body.style.backgroundColor = "#fff";
      });
  };

  // Event handler for admin login form submission
  handleSubmitAdmin = (e) => {
    e.preventDefault();
    const user = {
      type: "Admin",
      email: e.target.querySelector(`input[data-testid="admin-email-input"]`)
        .value,
      password: e.target.querySelector(
        `input[data-testid="admin-password-input"]`
      ).value,
      status: "connected",
    };

    // Store admin information in local storage
    this.localStorage.setItem("user", JSON.stringify(user));
    // Attempt to log in the admin, and create the admin if login fails
    this.login(user)
      .catch((err) => this.createUser(user))
      .then(() => {
        // Navigate to the 'Dashboard' route upon successful login
        this.onNavigate(ROUTES_PATH["Dashboard"]);
        this.PREVIOUS_LOCATION = ROUTES_PATH["Dashboard"];
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;
        document.body.style.backgroundColor = "#fff";
      });
  };

  // not need to cover this function by tests
  // Function to log in a user
  login = (user) => {
    if (this.store) {
      return this.store
        .login(
          JSON.stringify({
            email: user.email,
            password: user.password,
          })
        )
        .then(({ jwt }) => {
          // Store the JWT token in local storage upon successful login
          localStorage.setItem("jwt", jwt);
        });
    } else {
      return null;
    }
  };

  // not need to cover this function by tests
  // Function to create a user
  createUser = (user) => {
    if (this.store) {
      return this.store
        .users()
        .create({
          data: JSON.stringify({
            type: user.type,
            name: user.email.split("@")[0],
            email: user.email,
            password: user.password,
          }),
        })
        .then(() => {
          console.log(`User with ${user.email} is created`);
          return this.login(user);
        });
    } else {
      return null;
    }
  };
}
