import style from './Login.module.css'

export default function LogInPage() {
    return (
        <div className={style.login_container}>


            <form className={style.card}>
                <input type="text" placeholder="Username" />
                <input type="password" placeholder="Password" />
                <button type="submit">Login</button>
                <p>Don't have an account? <a href="/register">Register</a></p>
            </form>

        </div>
    )
}