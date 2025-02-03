import style from './MainPage.module.css'
import { useNavigate } from 'react-router'
import { useGlobalContext } from '../../Contexts/GlobalContext/Context'


export default function MainPage() {
    const { setLogged } = useGlobalContext()
    const navigate = useNavigate()

    function handleSignIn() {
        navigate('/signin')
    }
    function handleLogin() {
        navigate('/login')
    }

    function handleLogOut() {
        localStorage.removeItem('token')
        setLogged(false)
    }

    return (
        <>
            <div className={style.button_container}>
                <button className='btn btn-secondary' type="button" onClick={handleLogOut}>LogOut</button>
                <button className='btn btn-secondary' type="button" onClick={handleSignIn}>SignIn</button>
                <button className='btn btn-secondary' type="button" onClick={handleLogin}>LogIn</button>
            </div>
            <div className={style.container}>

                {/*chat list div*/}
                <div className={style.chat_container}>
                    <h3>ChatList</h3>
                    <div className={style.select_chat}>
                        <div className='d-flex align-items-center'>
                            <img src="/vite.svg" alt="img prfile" style={{ width: 30 }} />
                            <h5>Username</h5>
                        </div>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. </p>
                    </div>
                </div>


                {/*chat window*/}
                <div className={style.chat_window}>
                    <div>
                        <h3>Chat Window</h3>
                    </div>
                    <div className={`${style.message_container}`}>
                        <div className={`d-flex`}>
                            <div>
                                <img src="/vite.svg" alt="img prfile" style={{ width: 30 }} />
                                <h5>Username</h5>
                            </div>
                            <p className='m-0'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. </p>
                        </div>

                    </div>
                    <div className={style.send_message_div}>
                        <form className='d-flex'>
                            <input className='form-control' type="text" placeholder="Type a message..." />
                            <button className='btn btn-secondary' type="submit">Send</button>
                        </form>
                    </div>
                </div>


                {/*user container*/}
                <div className={style.user_container}>

                    <div>
                        <div className='d-flex align-items-center'>
                            <img src="/vite.svg" alt="img prfile" style={{ width: 30 }} />
                            <h5>Username</h5>
                        </div>

                    </div>


                    <div className={style.search_user_form}>
                        <form className='d-flex '>
                            <input className='form-control' type="text" placeholder="Search an user..." />
                            <button className='btn btn-secondary' type="submit">Search</button>
                        </form>
                    </div>
                </div>
            </div>

        </>
    )

}