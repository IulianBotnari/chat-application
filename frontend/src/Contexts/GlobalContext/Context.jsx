
import React, { useEffect, useState } from "react";
import { createContext, useContext } from "react";

const context = createContext()


export function GlobalContext({ children }) {
    const [logged, setLogged] = useState()

    useEffect(() => {
        if (localStorage.getItem('token')) {
            setLogged(true)
        } else {
            setLogged(false)
        }

    }, [])
    console.log(logged);


    // setToken(localStorage.getItem("token"))

    const values = {
        setLogged,
        logged
    }
    return (
        <context.Provider value={values}>
            {children}
        </context.Provider>
    )
}

export const useGlobalContext = () => useContext(context)