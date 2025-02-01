import style from '../SignIn/SignIn.module.css'
import { useState } from 'react'

export default function SignInPage() {
    const [name, setName] = useState("")
    const [surname, setSurname] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")
    const [profile_pic, setProfile_pic] = useState("")

    async function handleSubmitUser(e) {
        e.preventDefault()
        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'post',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ name, surname, username, password, email, profile_pic })

            })
        } catch (err) {
            console.log(err.message)
        }


    }




    return (

        <div className={style.signin_container}>

            <div className={style.card}>
                <h1>Sign In</h1>
                <form className='d-flex flex-column' onSubmit={handleSubmitUser}>
                    <label>Nome</label>
                    <input type="text" placeholder="Nome" onChange={(e) => setName(e.target.value)} />
                    <label>Cognome</label>
                    <input type="text" placeholder="Cognome" onChange={(e) => setSurname(e.target.value)} />
                    <label>Username</label>
                    <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                    <label>Password</label>
                    <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                    <label>Email</label>
                    <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                    <label>Picture</label>
                    <input type="text" placeholder="Url for your picture" onChange={(e) => setProfile_pic(e.target.value)} />
                    <hr />
                    <button type="submit">Sign In</button>
                </form>

            </div>
        </div>



    )
}