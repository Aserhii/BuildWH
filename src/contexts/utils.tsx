import { createContext, useContext } from "react";

// https://github.com/typescript-cheatsheets/react#extended-example
export const createCtx = <A extends {} | null>() => {
  const ctx = createContext<A | undefined>(undefined);
  function useCtx() {
    const c = useContext(ctx);
    if (c === undefined)
      throw new Error("useCtx must be inside a Provider with a value");
    return c;
  }
  return [useCtx, ctx.Provider, ctx] as const;
};
