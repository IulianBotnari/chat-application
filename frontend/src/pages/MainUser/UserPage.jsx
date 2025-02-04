

import style from './UserPage.module.css'
import { useNavigate } from 'react-router'
import { useGlobalContext } from '../../Contexts/GlobalContext/Context'
import io from 'socket.io-client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'

export default function MainPage() {
    const { setLogged, logged } = useGlobalContext()
    const navigate = useNavigate()
    const { username } = useParams(); // Destruttura username
    console.log(logged);

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    console.log(messages);

    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Crea la connessione socket solo una volta
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        fetch("http://localhost:3000/messages")
            .then(response => response.json())
            .then(data => {
                console.log("Messaggi caricati dal database:", data);
                setMessages(data);
            })
            .catch(error => console.error("Errore nel caricamento dei messaggi:", error));

        // Riceve i messaggi in tempo reale
        newSocket.on("chat message", (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        // Disconnette il socket quando il componente si smonta
        return () => newSocket.disconnect();
    }, []);

    useEffect(() => {
        // Carica i messaggi dal database con Fetch

        async function getMessages() {
            if (username && logged === true) {


                try {
                    const response = await fetch("http://localhost:3000/messages")
                    const data = response.json()

                    console.log(data);

                } catch (err) {
                    console.log(err);

                }
            }

        }

    }, []);

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && username?.trim()) {
            socket.emit("chat message", { username, message });
            setMessage("");
        }
    };

    function handleLogOut() {
        localStorage.removeItem('token');
        setLogged(false);
        navigate('/home');
    }

    return (
        <>
            <div className={style.button_container}>
                <button className='btn btn-secondary' onClick={handleLogOut}>LogOut</button>
                <button className='btn btn-secondary' onClick={() => navigate('/signin')}>SignIn</button>
                <button className='btn btn-secondary' onClick={() => navigate('/login')}>LogIn</button>
            </div>

            <div className={style.container}>
                <div className={style.chat_container}>
                    <h3>ChatList</h3>
                    {/* {messages?.map((msg, index) => (
                        <div key={index} className={style.select_chat}>
                            <div className='d-flex align-items-center'>
                                <img src="/vite.svg" alt="img profile" style={{ width: 30 }} />
                                <h5>{msg.username}</h5>
                            </div>
                            <p>{msg.message}</p>
                        </div>
                    ))} */}
                </div>

                <div className={style.chat_window}>
                    <h3>Chat Window</h3>
                    <div className={style.message_container}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`d-flex ${username === msg.username ? "flex-row-reverse" : ""}`}>
                                <img src="/vite.svg" alt="img profile" style={{ width: 30 }} />
                                <h5>{msg.username}</h5>
                                <p className='m-0'>{msg.message}</p>
                            </div>
                        ))}
                    </div>

                    <div className={style.send_message_div}>
                        <form className='d-flex' onSubmit={sendMessage}>
                            <input className='form-control' type="text" placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} />
                            <button className='btn btn-secondary' type="submit">Send</button>
                        </form>
                    </div>
                </div>

                <div className={style.user_container}>
                    <div className='d-flex align-items-center'>
                        <img src="/vite.svg" alt="img profile" style={{ width: 30 }} />
                        <h5>Username</h5>
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
