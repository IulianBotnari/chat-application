import style from '../SignIn/SignIn.module.css'

export default function SignInPage() {
    return (

        <div className={style.signin_container}>

            <div className={style.card}>
                <h1>Sign In</h1>
                <form className='d-flex flex-column'>
                    <label>Nome</label>
                    <input type="text" placeholder="Nome" />
                    <label>Cognome</label>
                    <input type="text" placeholder="Cognome" />
                    <label>Username</label>
                    <input type="text" placeholder="Username" />
                    <label>Password</label>
                    <input type="password" placeholder="Password" />
                    <label>Email</label>
                    <input type="email" placeholder="Email" />
                    <hr />
                    <button type="submit">Sign In</button>
                </form>

            </div>
        </div>



    )
}