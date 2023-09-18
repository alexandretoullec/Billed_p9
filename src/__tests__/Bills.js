/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

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
    test("It should render the new bill creation form", () => {
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

  describe("when I click on th icon eye", () => {
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
describe("Given when I am a user connected as Admin", () => {
  describe("When I navigate to Bills", () => {
    test("Then fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Admin", email: "a@a" })
      );
      new Bills({
        document,
        onNavigate,
        mockStore,
        localStorage: window.localStorage,
      });
      document.body.innerHTML = BillsUI({ data: bills });
      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    });
  });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Admin",
          email: "a@a",
        })
      );
    });
    test("should fetch and fail with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("should fetch and fail with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
