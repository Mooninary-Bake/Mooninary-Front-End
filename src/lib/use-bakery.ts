import { useContext } from "react";
import { BakeryContext } from "./bakery-context";

export const useBakery = () => {
  const ctx = useContext(BakeryContext);
  if (!ctx) throw new Error("useBakery must be used inside <BakeryProvider>");
  return ctx;
};
