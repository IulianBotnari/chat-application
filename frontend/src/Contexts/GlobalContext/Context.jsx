import React, { useState } from "react";
import { createContext, useContext } from "react";

const context = createContext()


export function GlobalContext({ children }) {
    const [token, setToken] = useState()
    // console.log(token);

    setToken(localStorage.getItem("token"))

    const values = {
        setToken
    }
    return (
        <context.Provider value={values}>
            {children}
        </context.Provider>
    )
}

export const useGlobalContext = () => useContext(context)