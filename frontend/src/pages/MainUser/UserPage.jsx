
// Import dei moduli necessari

import style from './UserPage.module.css'
import { useNavigate } from 'react-router'
import { useGlobalContext } from '../../Contexts/GlobalContext/Context'
import io from 'socket.io-client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router'
import data from '../../../node_modules/@emoji-mart/data'
import Picker from '../../../node_modules/@emoji-mart/react'
import DeleteMessageButton from '../../../Components/DeleteMessageButton'

// import '../../../node_modules/emoji-mart/css/emoji-mart.css'



// Componente principale della pagina
export default function MainPage() {
    const { setLogged, logged, deleteMessage } = useGlobalContext()
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
    const [isClicked, setIsClicked] = useState(false)
    const [search, setSearch] = useState("")
    const [showPicker, setShowPicker] = useState(false)
    const [file, setFile] = useState(null)
    const messagesEndRef = useRef(null);
    console.log(message);



    const handleEmpjiSelect = (emoji, e) => {


        console.log(emoji);

        // const selectedEmoji = document.getElementsByClassName(".picker").getAttribute('data')

        setMessage(prevMessage => prevMessage + emoji.native);
    }


    const togglePicker = (e) => {
        e.preventDefault()
        setShowPicker(!showPicker)
    }


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

    useEffect(() => {
        // Scrolla fino alla fine ogni volta che i messaggi vengono aggiornati
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [messages])

    // Recupera i messaggi della chat selezionata
    useEffect(() => {
        if (!tableName) return
        const verifyIfChatListContainTablename = chatList.find(element => element.table_name === tableName)

        if (!verifyIfChatListContainTablename) return

        async function getMessages() {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`http://localhost:3000/messages?tablename=${tableName}`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
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
    const sendMessage = async (e) => {
        e.preventDefault()

        if (file) {

            const formData = new FormData();
            formData.append('file', file)

            try {

                const response = await fetch("http://localhost:3000/post-file", {
                    method: "POST",
                    body: formData
                });


                if (!response.ok) {
                    throw new Error("Errore nel invio del file")
                }

                const data = await response.json()
                if (data.messages?.content) {
                    setMessage(data.messages.content);
                    console.log(data);

                    setTimeout(() => {
                        if (username?.trim() && socket) {
                            socket.emit("chat message", { username, message, tableName });

                            setMessage("");
                            setFile(null);
                        }
                    }, 1000);
                } else {
                    throw new Error("Risposta del server non valida");
                }


                console.log("File inviato con successo:", data.url);

                // Aspetta che lo stato si aggiorni prima di usare `message`

            } catch (error) {
                console.error("Errore:", error);
            }

        } else if (message && username?.trim() && socket) {
            socket.emit("chat message", { username, message, tableName })
            setMessage("")
        }

        if (showPicker === true) {

            setShowPicker(false)

        }

    }

    // Gestione del logout
    function handleLogOut() {
        localStorage.removeItem('token')
        setLogged(false)
        navigate('/login')
    }

    // Recupera la lista delle chat dell'utente
    useEffect(() => {
        async function getChatList() {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`http://localhost:3000/chatlist?username=${username.toLowerCase()}`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (response.ok) {
                    const data = await response.json()
                    setChatList(data)
                }
            } catch (err) {
                console.error("Errore nel recupero della chat list:", err)
            }
        }

        getChatList()
    }, [username, deleteMessage])


    // Seleziona una chat dalla lista

    function selectChat(index) {
        setTableName(chatList[index].table_name)



        setIsClicked(index)



    }
    useEffect(() => { selectChat }, [deleteMessage])

    // Recupera la lista degli utenti per avviare nuove chat
    async function getUsers() {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:3000/users?search=${search}`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json();
                setUsersList(data); // Aggiorna la lista degli utenti con i risultati
            }
        } catch (err) {
            console.error("Errore nel recupero degli utenti:", err);
        }
    }

    // useEffect per eseguire la richiesta ogni volta che cambia il parametro di ricerca
    useEffect(() => {

        getUsers();

    }, [])

    // Funzione per gestire il submit della ricerca
    function searchUser(e) {
        e.preventDefault()

        getUsers()

    }

    // Crea una nuova chat quando entrambi i nomi tabella sono presenti
    useEffect(() => {
        if (!nameTable1 || !nameTable2) return

        const arrayTableName = [nameTable1.toLowerCase(), nameTable2.toLowerCase()]

        console.log(arrayTableName);

        async function createNewChat() {
            try {
                const response = await fetch(`http://localhost:3000/createchat?tableName=${arrayTableName}`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (response.ok) {
                    console.log("Chat creata con successo")
                }
            } catch (err) {
                console.error("Errore nel creare la chat:", err)
            }
        }

        createNewChat()
    }, [nameTable2])

    // funzione per troncare il testo 
    const textMaxLength = (text, maxLength) => {
        if (text?.length > maxLength) {
            return text.slice(0, maxLength) + '...';
        }
        return text;
    };


    function checkTypeMessage(mes) {
        const typeFile = [".jpg", ".pdf", ".log"]
        return typeFile.some(ext => mes.endsWith(ext));

    }


    function getFile(params) {

        fetch(`http://localhost:3001/getfile?file=${params}`)
            .then((response) => response.json())
            .then((data) => {
                // setLogs(data.content); // Mostra solo il contenuto del log

                console.log(data.content);


                return data.content
            })
            .catch((error) => console.error("Errore nel recupero dei log:", error));
    }

    useEffect(() => {
        getFile
    }, []);



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
                        <div key={index}
                            className={style.select_chat}
                            onClick={() => selectChat(index)}
                            style={{ backgroundColor: isClicked === index ? 'rgba(5, 0, 0, 0.678)' : '' }}>
                            <div className='d-flex align-items-center'>
                                <img src="/vite.svg" alt="img profile" style={{ width: 30 }} />
                                <h5>{table.table_name.replace(new RegExp(username.toLowerCase(), 'g'), "",)}</h5>
                            </div>
                            <p>{textMaxLength(table.data[0]?.message, 20)}</p>
                        </div>
                    ))}
                    <div className={`${style.user_chatlist}`}>
                        <img style={{ width: 40 }} src='/vite.svg' alt='profilepicture' />
                        <h3>{username}</h3>
                        <button className={`${style.button_icon}`}>
                            <i className='bi bi-gear-fill'></i>
                        </button>
                    </div>
                </div>



                {/* Finestra della chat selezionata */}
                <div className={style.chat_window}>
                    <div className={style.header_chatwindow}>
                        <h3 className={``}>
                            <img src='/vite.svg' alt='profilepicture' />
                            {chatList[isClicked] ? chatList[isClicked].table_name.replace(new RegExp(username.toLowerCase(), 'g'), "",) : ""}
                        </h3>
                        <div className='d-flex align-items-center'>
                            <button className={`${style.button_icon}`}>
                                <i className="bi bi-camera-reels-fill"></i>

                            </button>
                            <button className={`${style.button_icon}`}>
                                <i className="bi bi-telephone-fill"></i>

                            </button>
                            <button className={`${style.button_icon}`}>
                                <i className="bi bi-three-dots-vertical"></i>

                            </button>

                        </div>



                    </div>
                    <div className={style.message_container}>

                        {messages.data ? messages.data.map((msg, index) => (
                            <div key={index} className={`d-flex flex-start ${username === msg.username ? "flex-row-reverse" : ""}`}>
                                <div className={`${msg.username === username ? "d-flex flex-column align-items-end mb-3" : "d-flex flex-column align-items-start mb-3"}`}>

                                    <div className={`mb-0`}>

                                        <h5 className={``}>{msg.username === username ? "io" : msg.username}</h5>

                                    </div>


                                    {checkTypeMessage(msg.message) ?
                                        <a className={msg.username === username ? `mb-0 p-2 ${style.message_chatwindow}` : `mb-0 p-2 ${style.message_chatwindow} d-flex flex-row-reverse`}>
                                            {`http://localhost:3000/getfile?file=${msg.message}`} <DeleteMessageButton msgIndex={msg.id} msgUrename={msg.username} username={username} tableName={tableName} />
                                        </a>
                                        :
                                        <p className={msg.username === username ? `mb-0 p-2 ${style.message_chatwindow}` : `mb-0 p-2 ${style.message_chatwindow} d-flex flex-row-reverse`}>{msg.message} <DeleteMessageButton msgIndex={msg.id} msgUrename={msg.username} username={username} tableName={tableName} /></p>}




                                </div>
                            </div>


                        )) : <p>Nessun messaggio</p>}
                        <div ref={messagesEndRef} /> {/* Questo è il punto dove si scorrerà */}
                    </div>



                    {/* Form per inviare nuovi messaggi */}
                    <div className={style.send_message_div}>
                        <form className='d-flex' onSubmit={sendMessage} encType="multipart/form-data">
                            <label htmlFor="file_input" className={`${style.input_icon}`}><i className="bi bi-file-plus-fill"></i></label>
                            <input className="d-none" id='file_input' type="file" onChange={(e) => setFile(e.target.files[0])} />




                            <input className='form-control' type="text" placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} />
                            <button className='btn btn-secondary' type="submit" >Send</button>

                            <button className={`${style.button_icon}`} onClick={togglePicker} >
                                <i className="bi bi-emoji-smile-fill"></i>

                            </button>

                            <button className={`${style.button_icon}`}>
                                <i className="bi bi-mic-fill"></i>

                            </button>


                        </form>
                        {showPicker && (
                            <div className="emoji_window">

                                <Picker data={data} onEmojiSelect={handleEmpjiSelect} />
                            </div>
                        )}
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
                        <form className='d-flex ' onSubmit={searchUser}>
                            <input className='form-control' type="text" placeholder="Search an user..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            <button className='btn btn-secondary' type="submit" >Search</button>
                        </form>
                    </div>


                    {/*test commit*/}

                    {/* Elenco utenti */}
                    {usersList.map((user, index) => (
                        <div className={style.contacts} key={index} onClick={() => setNameTable2(user.username)}>
                            <img src="/vite.svg" alt="img profile" style={{ width: 30 }} />
                            <h5>{user.username}</h5>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
