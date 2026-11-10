import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button (shadcn/ui)", () => {
  it("renderiza com papel e nome acessíveis", () => {
    render(<Button>Abrir painel</Button>);

    const button = screen.getByRole("button", { name: "Abrir painel" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-slot", "button");
  });

  it("aplica a variante solicitada", () => {
    render(<Button variant="outline">Filtrar</Button>);

    expect(screen.getByRole("button", { name: "Filtrar" })).toHaveAttribute(
      "data-variant",
      "outline",
    );
  });
});
