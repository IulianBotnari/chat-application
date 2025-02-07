
// Import dei moduli necessari

import style from './UserPage.module.css'
import { useNavigate } from 'react-router'
import { useGlobalContext } from '../../Contexts/GlobalContext/Context'
import io from 'socket.io-client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'


// Componente principale della pagina
export default function MainPage() {
    const { setLogged, logged } = useGlobalContext()
    const navigate = useNavigate()
    const { username } = useParams()
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState({ data: [] });
    const [socket, setSocket] = useState(null)
    const [chatList, setChatList] = useState([])
    const [tableName, setTableName] = useState(null)
    const [usersList, setUsersList] = useState([])
    const [nameTable1, setNameTable1] = useState(null)
    const [nameTable2, setNameTable2] = useState(null)






    // Inizializza nameTable1 con lo username
    useEffect(() => {
        if (username) {
            setNameTable1(username.toLowerCase())
        }
    }, [username])





    // Connessione al socket quando l'utente è loggato e ha selezionato una chat
    useEffect(() => {
        if (!username || !logged) return;

        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        if (tableName) {
            newSocket.emit('join', tableName)
        }

        newSocket.on("chat message", (msg) => {
            if (msg.tableName !== tableName) return;
            setMessages(prevMessages => ({
                ...prevMessages,
                data: [...prevMessages.data, msg]
            }));
        });

        return () => {
            newSocket.emit('leave', tableName)
            newSocket.disconnect();
        };
    }, [logged, tableName]);




    // Recupera i messaggi della chat selezionata
    useEffect(() => {
        if (!tableName) return
        const verifyIfChatListContainTablename = chatList.find(element => element.table_name === tableName)

        if (!verifyIfChatListContainTablename) return

        async function getMessages() {
            try {
                const response = await fetch(`http://localhost:3000/messages?tablename=${tableName}`)
                if (response.ok) {
                    const data = await response.json()
                    setMessages({
                        tableName: tableName,
                        data: data
                    })


                } else {
                    console.error("Errore nel recupero dei messaggi")
                }
            } catch (err) {
                console.error("Errore nel caricamento dei messaggi:", err)
            }
        }

        getMessages()
    }, [tableName, chatList])


    // Invio di un nuovo messaggio
    const sendMessage = (e) => {
        e.preventDefault()
        if (message.trim() && username?.trim() && socket) {
            socket.emit("chat message", { username, message, tableName })
            setMessage("")
        }
    }




    // Gestione del logout
    function handleLogOut() {
        localStorage.removeItem('token')
        setLogged(false)
        navigate('/home')
    }


    // Recupera la lista delle chat dell'utente
    useEffect(() => {
        async function getChatList() {
            try {
                const response = await fetch(`http://localhost:3000/chatlist?username=${username.toLowerCase()}`)
                if (response.ok) {
                    const data = await response.json()
                    setChatList(data)
                }
            } catch (err) {
                console.error("Errore nel recupero della chat list:", err)
            }
        }

        getChatList()
    }, [username])


    // Seleziona una chat dalla lista
    function selectChat(index) {
        setTableName(chatList[index].table_name)

    }


    // Recupera la lista degli utenti per avviare nuove chat
    useEffect(() => {
        async function getUsers() {
            try {
                const response = await fetch(`http://localhost:3000/users`)
                if (response.ok) {
                    const data = await response.json()
                    setUsersList(data)
                }
            } catch (err) {
                console.error("Errore nel recupero degli utenti:", err)
            }
        }

        getUsers()
    }, [])



    // Crea una nuova chat quando entrambi i nomi tabella sono presenti
    useEffect(() => {
        if (!nameTable1 || !nameTable2) return

        async function createNewChat() {
            try {
                const response = await fetch(`http://localhost:3000/createchat?tableName=${nameTable1}_${nameTable2.toLowerCase()}`)
                if (response.ok) {
                    console.log("Chat creata con successo")
                }
            } catch (err) {
                console.error("Errore nel creare la chat:", err)
            }
        }

        createNewChat()
    }, [nameTable2])



    return (
        <>
            {/* Sezione pulsanti di navigazione */}
            <div className={style.button_container}>
                <button className='btn btn-secondary' onClick={handleLogOut}>LogOut</button>
                <button className='btn btn-secondary' onClick={() => navigate('/signin')}>SignIn</button>
                <button className='btn btn-secondary' onClick={() => navigate('/login')}>LogIn</button>
            </div>

            <div className={style.container}>
                <div className={style.chat_container}>
                    <h3>ChatList</h3>
                    {chatList.map((table, index) => (
                        <div key={index} className={style.select_chat} onClick={() => selectChat(index)}>
                            <div className='d-flex align-items-center'>
                                <img src="/vite.svg" alt="img profile" style={{ width: 30 }} />
                                <h5>{table.table_name}</h5>
                            </div>
                            <p>{table.data[0]?.message}</p>
                        </div>
                    ))}
                    <div className={`${style.user_chatlist}`}>
                        <img src='/vite.svg' alt='profilepicture' />
                        <h3>{username}</h3>
                    </div>
                </div>



                {/* Finestra della chat selezionata */}
                <div className={style.chat_window}>
                    <h3 className={``}>
                        <img src='/vite.svg' alt='profilepicture' />
                        Marcolino
                    </h3>
                    <div className={style.message_container}>
                        {messages.data?.map((msg, index) => (
                            <div key={index} className={`d-flex flex-start ${username === msg.username ? "flex-row-reverse" : ""}`}>
                                <div className='d-flex flex-column align-items-start'>

                                    <div className={``}>

                                        <h5>{msg.username === username ? "io" : msg.username}</h5>

                                    </div>
                                    <p className={`m-0 ${style.message_chatwindow}`}>{msg.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>



                    {/* Form per inviare nuovi messaggi */}
                    <div className={style.send_message_div}>
                        <form className='d-flex' onSubmit={sendMessage}>
                            <input className='form-control' type="text" placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} />
                            <button className='btn btn-secondary' type="submit">Send</button>
                        </form>
                    </div>
                </div>



                {/* Sezione lista utenti per avviare nuove chat */}
                <div className={style.user_container}>
                    <div className='d-flex align-items-center'>
                        <img src="/vite.svg" alt="img profile" style={{ width: 30 }} />
                        <h5>{username}</h5>
                    </div>



                    {/* Form di ricerca utenti */}
                    <div className={style.search_user_form}>
                        <form className='d-flex '>
                            <input className='form-control' type="text" placeholder="Search an user..." />
                            <button className='btn btn-secondary' type="submit">Search</button>
                        </form>
                    </div>




                    {/* Elenco utenti */}
                    {usersList.map((user, index) => (
                        <div key={index} onClick={() => setNameTable2(user.username)}>
                            <img src="/vite.svg" alt="img profile" style={{ width: 30 }} />
                            <h5>{user.username}</h5>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
