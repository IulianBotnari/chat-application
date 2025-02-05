

import style from './UserPage.module.css'
import { useNavigate } from 'react-router'
import { useGlobalContext } from '../../Contexts/GlobalContext/Context'
import io from 'socket.io-client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'

export default function MainPage() {
    const { setLogged, logged } = useGlobalContext()
    const navigate = useNavigate()
    const { username } = useParams()
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([])
    const [socket, setSocket] = useState(null)
    const [chatList, setChatList] = useState([])
    const [tableName, setTableName] = useState([])
    const [usersList, setUsersList] = useState([])
    console.log(tableName);






    // all call and logic por chatWindow

    useEffect(() => {
        if (!username || !logged) return
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        async function getMessages() {
            try {

                let response = await fetch(`http://localhost:3000/messages?tablename=${tableName}`);


                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                    console.log("Messaggi ricevuti:", data);
                } else {
                    console.log("errore nel recupero dei messaggi");

                }
            } catch (err) {
                console.error("Errore nel caricamento dei messaggi:", err);
            }
        }

        getMessages()

        newSocket.on("chat message", (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            newSocket.disconnect();
        };

    }, [tableName])



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

    // all call and logic for chatList

    useEffect(() => {
        async function getChatList() {
            try {
                const response = await fetch(`http://localhost:3000/chatlist?username=${username}`)
                const data = await response.json()
                setChatList(data)

            } catch (err) {
                console.log(err);

            }
        }

        getChatList()
    }, [])


    function selectChat(inex) {
        const index = inex
        setTableName(chatList[index].table_name)
    }


    useEffect(() => {
        async function getUsers() {
            try {
                const response = await fetch(`http://localhost:3000/users`)
                const data = await response.json()
                setUsersList(data)
            } catch (err) {
                console.log(err);

            }
        }

        getUsers()
    }, [])


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
                    {chatList?.map((table, index) => (

                        <div key={index} className={style.select_chat} onClick={() => selectChat(index)}>
                            <div className='d-flex align-items-center'>
                                <img src="/vite.svg" alt="img profile" style={{ width: 30 }} />
                                <h5>{table.table_name}</h5>
                            </div>
                            <p>{table.data[0].message}</p>
                        </div>
                    ))}

                </div>

                <div className={style.chat_window}>
                    <h3>Chat Window</h3>
                    <div className={style.message_container}>
                        {messages?.map((msg, index) => (
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
                        <h5>{username}</h5>
                    </div>

                    <div className={style.search_user_form}>
                        <form className='d-flex '>
                            <input className='form-control' type="text" placeholder="Search an user..." />
                            <button className='btn btn-secondary' type="submit">Search</button>
                        </form>
                    </div>
                    {usersList?.map((user, index) => (
                        <div key={index}>
                            <img src="/vite.svg" alt="img profile" style={{ width: 30 }} />
                            <h5>{user.username}</h5>

                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
