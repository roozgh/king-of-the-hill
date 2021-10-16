import { render, screen } from "@testing-library/react";
import BoardPage from "./board-page";

test("Board Page General Test", () => {
  // Mock window width
  global.innerWidth = 500;
  global.innerHeight = 500;
  render(<BoardPage />);
  const linkElement = screen.getByText(/^TURN: 1 \/ 70$/i);
  expect(linkElement).toBeInTheDocument();
});
