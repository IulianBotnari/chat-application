import React from "react";
import { createContext, useContext } from "react";

const context = createContext()


export function GlobalContext({ children }) {

    const values = {}
    return (
        <context.Provider value={values}>
            {children}
        </context.Provider>
    )
}

export const useGlobalContext = () => useContext(context)