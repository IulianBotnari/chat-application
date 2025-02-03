import style from './Login.module.css'
import { useState, useEffect } from "react"
import { useGlobalContext } from '../../Contexts/GlobalContext/Context'

export default function LogInPage() {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const { setLogged } = useGlobalContext()

    async function handleLogin(e) {
        e.preventDefault()
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: "post",
                headers: { "Content-type": "Application/json" },
                body: JSON.stringify({ username, password })
            })

            if (!response.ok) {
                throw new Error(`Login failed! Status: ${response.status}`);
            } else {

                const data = await response.json();
                console.log("Login successful:", data);
                localStorage.setItem("token", data.token)
                setLogged(true)

            }

        } catch (error) {
            console.log("Autentication failed", error)
        }
    }



    return (
        <div className={style.login_container}>


            <form className={style.card} onSubmit={handleLogin}>
                <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Login</button>
                <p>Don't have an account? <a href="/register">Register</a></p>
            </form>

        </div>
    )
}