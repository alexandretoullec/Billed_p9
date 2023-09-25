/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills.js";
import router from "../app/Router.js";

import { formatDate, formatStatus } from "../app/format"; // Import formatDate and formatStatus functions

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      // expect than windowsIcon have the style background blue
      expect(windowIcon.className).toBe("active-icon");
    });
  });

  describe("When Bills appears on screen", () => {
    let billsInstance;

    // Mock the store with a simple implementation
    const mockStore = {
      bills: () => ({
        list: () => Promise.resolve(bills), // Mocking list() to return sample bills data
      }),
    };

    beforeEach(() => {
      billsInstance = new Bills({
        document: document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });
    });

    test("Then it should format bills and return them", async () => {
      // Call the getBills method
      const formattedBills = await billsInstance.getBills();

      // Check if the bills are formatted correctly
      expect(formattedBills).toEqual(
        bills.map((bill) => ({
          ...bill,
          date: formatDate(bill.date),
          status: formatStatus(bill.status),
        }))
      );
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  describe('When I click on "Nouvelle note de frais', () => {
    test("Then it should render the new bill creation form", () => {
      //define a function to simulate navigation by changing the page content
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      //Create an instance of the Bills class with necessary parameters
      const bills = new Bills({
        document,
        onNavigate,
        mockStore,
        localStorage,
      });

      // Define a function to handle the click event for the "New expense note" button
      const handleClickNewBill = jest.fn((e) => bills.handleClickNewBill(e));

      //select the "new Expense note" button using its test id
      const addNewBill = screen.getByTestId("btn-new-bill");

      //add a click event listener to the button, which calls handleclickNewBill when clicked
      addNewBill.addEventListener("click", handleClickNewBill);

      //simulate a click on the "New expense note" button
      userEvent.click(addNewBill);

      //check if handleClickNewBill was called
      expect(handleClickNewBill).toHaveBeenCalled();

      //check if the text "Send an expense note" is present in the DOM
      expect(screen.queryByText("Envoyer une note de frais")).toBeTruthy();
    });
  });

  describe("when I click on the icon eye", () => {
    test("it should render a modal", () => {
      //define a function to simulate navigation by changing the page content
      const onNavigate = (pathName) => {
        document.body.innerHTML = ROUTES({ pathName });
      };

      //simulate BillsUI
      document.body.innerHTML = BillsUI({ data: bills });

      //Create an instance of the Bills Class with necessary parameters
      const billsBis = new Bills({
        document,
        onNavigate,
        localStorage: window.localStorage,
      });

      // Define a function to handle the click event for the "icon eye" button
      const handleClickIconEye = jest.fn((icon) =>
        billsBis.handleClickIconEye(icon)
      );

      // Select the modal element by its ID
      const modaleFile = document.getElementById("modaleFile");

      // Select all "icon eye" elements using their test id
      const iconEye = screen.getAllByTestId("icon-eye");

      // Mock the behavior of the $.fn.modal function to add the "show" class to the modal element
      $.fn.modal = jest.fn(() => modaleFile.classList.add("show"));

      // Add a click event listener to each "icon eye" element, calling handleClickIconEye when clicked
      iconEye.forEach((icon) => {
        icon.addEventListener("click", handleClickIconEye(icon));
        userEvent.click(icon);
        expect(handleClickIconEye).toHaveBeenCalled();
      });

      // Check if the modal element has the "show" class, indicating it is displayed
      expect(modaleFile).toHaveClass("show");
    });
  });
});

// Test d'intégration GET

describe("Given I am a user connected as Admin", () => {
  describe("When I navigate to Bills", () => {
    // Test case 1: Fetches bills from mock API GET
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      //the 4 bills are there ?
      const content1 = screen.getByText("encore");
      expect(content1).toBeDefined();
      const content2 = screen.getByText("test1");
      expect(content2).toBeDefined();
      const content3 = screen.getByText("test3");
      expect(content3).toBeTruthy();
      const content4 = screen.getByText("test2");
      expect(content4).toBeDefined();
      //number check
      expect(screen.getAllByTestId("icon-eye").length).toEqual(4);
      //modal for the attachment file to th bill
      expect(screen.getByText("Justificatif")).toBeVisible();
      //new Bill button
      expect(screen.getByTestId("btn-new-bill")).toHaveTextContent(
        "Nouvelle note de frais"
      );
      //body with bills and defined
      expect(screen.getByTestId("tbody")).toBeDefined();
      //body with the four bills
      expect(screen.getByTestId("tbody")).toHaveTextContent("encore");
      expect(screen.getByTestId("tbody")).toHaveTextContent("test1");
      expect(screen.getByTestId("tbody")).toHaveTextContent("test3");
      expect(screen.getByTestId("tbody")).toHaveTextContent("test2");
    });
  });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      // Spy on the mockStore's "bills" method
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      // Set up localStorage with an employee user
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
    });

    // Test case 1: Error with status code 404
    test("should fetch and fail with 404 message error", async () => {
      // Mock the store's "list" method to return a rejected Promise with an error message
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      // Create an HTML representation of the Bills UI with the 404 error message
      const html = BillsUI({ error: "Erreur 404" });
      // Set the document body's HTML to the generated HTML
      document.body.innerHTML = html;
      // Find the error message in the rendered HTML
      const message = await screen.getByText(/Erreur 404/);
      // Expect that the error message is found in the DOM
      expect(message).toBeTruthy();
    });
  });

  // Test case 2: Error with status code 500
  test("should fetch and fail with 500 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      // Mock the store's "list" method to return a rejected Promise with the 500 error message
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });
    // Create an HTML representation of the Bills UI with the 500 error message
    const html = BillsUI({ error: "Erreur 500" });
    // Set the document body's HTML to the generated HTML
    document.body.innerHTML = html;
    // Find the error message in the rendered HTML
    const message = await screen.getByText(/Erreur 500/);
    // Expect that the error message is found in the DOM
    expect(message).toBeTruthy();
  });
});
