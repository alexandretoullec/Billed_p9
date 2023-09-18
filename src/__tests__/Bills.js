/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import userEvent from "@testing-library/user-event";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
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

      //Create an instance of th Bills class with necessary parameters
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
});
