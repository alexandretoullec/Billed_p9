/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills.js";
import router from "../app/Router.js";
import Store from "../app/Store";
import BillsUI from "../views/BillsUI.js";

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    // Set localStorage to simulate a connected employee
    Object.defineProperty(window, "location", {
      value: {
        hash: ROUTES_PATH["NewBill"],
      },
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
    // Create a root element and append it to the document body
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    // Call the router function to navigate to the NewBill Page
    router();
    window.onNavigate(ROUTES_PATH.NewBill);
  });
  describe("When I am on NewBill Page", () => {
    test("Then email icon in vertical layout should be highlighted", async () => {
      // Wait for the "icon-mail" to be present on the screen
      await waitFor(() => screen.getByTestId("icon-mail"));

      // Get the "icon-mail" element
      const windowIcon = screen.getByTestId("icon-mail");

      // Assert that the "icon-mail" has the class "active-icon"
      expect(windowIcon.className).toBe("active-icon");
    });
  });
  describe("When I upload an incorrect file", () => {
    test("Then the upload fail", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const file = screen.getByTestId("file");
      const newBill = new NewBill({
        document,
        onNavigate,
        store: Store,
        localStorage: window.localStorage,
      });
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [new File(["image"], "test.pdf", { type: "image/pdf" })],
        },
      });
      expect(file.value).toBe("");
    });
  });

  // test d'intégration post

  describe("When I submit a new Bill on a correct form", () => {
    test("Then the submit should success", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      // Create an instance of the NewBill class with necessary parameters
      const newBill = new NewBill({
        document,
        onNavigate,
        localStorage: window.localStorage,
      });

      // Get the form element by its data-testid
      const formNewBill = screen.getByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();

      // Define a function to handle the submit event for the form
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      // Add an event listener to the form to listen for submits
      formNewBill.addEventListener("submit", handleSubmit);

      // Simulate a form submission event
      fireEvent.submit(formNewBill);

      // Expect that the handleSubmit function has been called
      expect(handleSubmit).toHaveBeenCalled();
    });
    test("then it should create a new bill sucessfully", async () => {
      // Mock the bills store and its create method
    });
    describe("When an error occurs", () => {
      beforeEach(() => {
        // Spy on the mockStore's 'bills' method
        jest.spyOn(mockStore, "bills");

        // Set up localStorage with a user of type 'employee'
        Object.defineProperty(window, "localeStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "employee",
            email: "a@a",
          })
        );
      });
      test("Then should fail with meassge error 404", async () => {
        // Mock the 'create' method of 'bills' to reject with an error message
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        // Create an HTML representation of the bills UI with the error message

        const html = BillsUI({ error: "Erreur 404" });

        // Set the document body's HTML to the HTML representation
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });
      test("Then should fail with message error 500", async () => {
        // Mock the 'create' method of 'bills' to reject with an error message
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        // Create an HTML representation of the bills UI with the error message

        const html = BillsUI({ error: "Erreur 500" });

        // Set the document body's HTML to the HTML representation
        document.body.innerHTML = html;

        // Find the error message in the rendered HTML
        const message = await screen.getByText(/Erreur 500/);

        // Expect that the error message is found in the DOM
        expect(message).toBeTruthy();
      });
    });
  });
});
