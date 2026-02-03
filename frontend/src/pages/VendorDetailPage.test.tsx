import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, beforeEach, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import VendorDetailPage from "./VendorDetailPage";

vi.mock("../components/Navbar", () => ({
  default: () => <div data-testid="navbar" />,
}));

const mockUseParams = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useParams: () => mockUseParams(),
    useNavigate: () => mockNavigate,
  };
});

// Mock stores
const mockToggleFavorite = vi.fn();
const mockIsFavorite = vi.fn(() => false);

const mockUseVendors = vi.fn();

vi.mock("../data/VendorStore", () => ({
  useVendors: () => mockUseVendors(),
}));

vi.mock("../data/FavoritesStore", () => ({
  useFavorites: () => ({
    toggleFavorite: mockToggleFavorite,
    isFavorite: mockIsFavorite,
  }),
}));

describe("VendorDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows vendor details + contact buttons when vendor exists and is approved", () => {
    mockUseParams.mockReturnValue({ id: "1" });

    mockUseVendors.mockReturnValue({
      vendors: [
        {
          id: 1,
          name: "Test Vendor 1",
          status: "approved",
          category: "Food",
          location: "Nijmegen",
          openingHours: "Mon-Fri 09:00-17:00",
          description: "A nice local vendor.",
          email: "test@vendor.com",
          phone: "+31123456789",
        },
      ],
    });

    render(<VendorDetailPage />);

    expect(
      screen.getByRole("heading", { name: "Test Vendor 1" })
    ).toBeInTheDocument();
        expect(screen.getByText(/food/i)).toBeInTheDocument();
    expect(screen.getByText(/nijmegen/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /^email$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^call$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^share$/i })).toBeInTheDocument();
  });

  it("shows error + Go back if vendor not found", async () => {
    const user = userEvent.setup();

    mockUseParams.mockReturnValue({ id: "999" });
    mockUseVendors.mockReturnValue({
      vendors: [
        { id: 1, name: "Approved Vendor", status: "approved" },
      ],
    });

    render(<VendorDetailPage />);

    expect(
      screen.getByText(/could not be found or is not available/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /go back/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("shows error + Go back if vendor is not approved", async () => {
    const user = userEvent.setup();

    mockUseParams.mockReturnValue({ id: "2" });
    mockUseVendors.mockReturnValue({
      vendors: [
        { id: 2, name: "Pending Vendor", status: "submitted" },
      ],
    });

    render(<VendorDetailPage />);

    expect(
      screen.getByText(/could not be found or is not available/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /go back/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("toggles favorite when Save is clicked", async () => {
    const user = userEvent.setup();

    mockUseParams.mockReturnValue({ id: "1" });
    mockUseVendors.mockReturnValue({
      vendors: [
        { id: 1, name: "Test Vendor 1", status: "approved" },
      ],
    });

    render(<VendorDetailPage />);

    await user.click(screen.getByRole("button", { name: /save/i }));
    expect(mockToggleFavorite).toHaveBeenCalledWith(1);
  });
});
