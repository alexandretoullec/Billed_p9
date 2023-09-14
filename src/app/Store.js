// Function to handle API response and parse JSON, or throw an error if the response is not ok
const jsonOrThrowIfError = async (response) => {
  if (!response.ok) throw new Error((await response.json()).message);
  return response.json();
};

// Class representing an API client with common HTTP methods
class Api {
  constructor({ baseUrl }) {
    this.baseUrl = baseUrl;
  }

  // Method for making a GET request
  async get({ url, headers }) {
    return jsonOrThrowIfError(
      await fetch(`${this.baseUrl}${url}`, { headers, method: "GET" })
    );
  }

  // Method for making a POST request
  async post({ url, data, headers }) {
    return jsonOrThrowIfError(
      await fetch(`${this.baseUrl}${url}`, {
        headers,
        method: "POST",
        body: data,
      })
    );
  }

  // Method for making a DELETE request
  async delete({ url, headers }) {
    return jsonOrThrowIfError(
      await fetch(`${this.baseUrl}${url}`, { headers, method: "DELETE" })
    );
  }

  // Method for making a PATCH request
  async patch({ url, data, headers }) {
    return jsonOrThrowIfError(
      await fetch(`${this.baseUrl}${url}`, {
        headers,
        method: "PATCH",
        body: data,
      })
    );
  }
}

// Function to set headers for API requests, including Content-Type and Authorization if a JWT token exists
const getHeaders = (headers) => {
  const h = {};
  if (!headers.noContentType) h["Content-Type"] = "application/json";
  const jwt = localStorage.getItem("jwt");
  if (jwt && !headers.noAuthorization) h["Authorization"] = `Bearer ${jwt}`;
  return { ...h, ...headers };
};

// Class representing an entity in the API with common actions like select, list, update, create, and delete
class ApiEntity {
  constructor({ key, api }) {
    this.key = key;
    this.api = api;
  }

  // Method to select a specific entity using a selector
  async select({ selector, headers = {} }) {
    return await this.api.get({
      url: `/${this.key}/${selector}`,
      headers: getHeaders(headers),
    });
  }

  // Method to list all entities of this type
  async list({ headers = {} } = {}) {
    return await this.api.get({
      url: `/${this.key}`,
      headers: getHeaders(headers),
    });
  }

  // Method to update an entity
  async update({ data, selector, headers = {} }) {
    return await this.api.patch({
      url: `/${this.key}/${selector}`,
      headers: getHeaders(headers),
      data,
    });
  }

  // Method to create a new entity
  async create({ data, headers = {} }) {
    return await this.api.post({
      url: `/${this.key}`,
      headers: getHeaders(headers),
      data,
    });
  }

  // Method to delete an entity
  async delete({ selector, headers = {} }) {
    return await this.api.delete({
      url: `/${this.key}/${selector}`,
      headers: getHeaders(headers),
    });
  }
}

// Class representing a high-level interface to interact with the API
class Store {
  constructor() {
    this.api = new Api({ baseUrl: "http://localhost:5678" }); // Initialize the API client with a base URL
  }

  // Method to select a specific user
  user = (uid) =>
    new ApiEntity({ key: "users", api: this.api }).select({ selector: uid });

  // Method to list all users
  users = () => new ApiEntity({ key: "users", api: this.api });

  // Method to send a login request
  login = (data) =>
    this.api.post({
      url: "/auth/login",
      data,
      headers: getHeaders({ noAuthorization: true }),
    });

  // Method to reference a document (not defined in the provided code)
  ref = (path) => this.store.doc(path);

  // Method to select a specific bill
  bill = (bid) =>
    new ApiEntity({ key: "bills", api: this.api }).select({ selector: bid });

  // Method to list all bills
  bills = () => new ApiEntity({ key: "bills", api: this.api });
}

// Export an instance of the Store class to be used in other parts of the application
export default new Store();
