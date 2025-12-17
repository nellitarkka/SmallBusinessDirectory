import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, beforeEach, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import CustomerProfilePage from "./CustomerProfilePage";

vi.mock("../components/Navbar", () => ({
  default: () => <div data-testid="navbar" />,
}));

const mockUpdateProfile = vi.fn();

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => ({
    user: { name: "Old Name", email: "old@email.com" },
    updateProfile: mockUpdateProfile,
  }),
}));

describe("CustomerProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pre-fills name and email from auth user", () => {
    render(<CustomerProfilePage />);

    expect(screen.getByDisplayValue("Old Name")).toBeInTheDocument();
    expect(screen.getByDisplayValue("old@email.com")).toBeInTheDocument();
  });

  it("updates profile name and shows success message on submit", async () => {
    const user = userEvent.setup();
    render(<CustomerProfilePage />);

    const nameInput = screen.getByPlaceholderText(/your name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "New Name");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(mockUpdateProfile).toHaveBeenCalledWith({ name: "New Name" });

    expect(
      screen.getByText(/profile updated successfully/i)
    ).toBeInTheDocument();
  });

  it("clears the password field after submit", async () => {
    const user = userEvent.setup();
    render(<CustomerProfilePage />);

    const passwordInput = screen.getByPlaceholderText(/enter new password/i);
    await user.type(passwordInput, "Secret123!");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(passwordInput).toHaveValue("");
  });
});
