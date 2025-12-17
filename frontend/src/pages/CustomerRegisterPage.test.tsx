import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CustomerRegisterPage from "./CustomerRegisterPage";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

vi.mock("../components/Navbar", () => ({
  default: () => <div data-testid="navbar" />,
}));

describe("CustomerRegisterPage", () => {
  it("shows an error if passwords do not match", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CustomerRegisterPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/^name$/i), "Berin");
    await user.type(screen.getByLabelText(/^email$/i), "berin@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Password123!");
    await user.type(screen.getByLabelText(/confirm password/i), "Different123!");

    await user.click(
      screen.getByRole("button", { name: /create customer account/i })
    );

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });
});
