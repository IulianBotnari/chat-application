


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
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([])
    const [socket, setSocket] = useState(null)
    const [chatList, setChatList] = useState([])
    const [tableName, setTableName] = useState(null)
    const [usersList, setUsersList] = useState([])
    const [nameTable1, setNameTable1] = useState(null)
    const [nameTable2, setNameTable2] = useState(null)
    // const [tableChat, setTableChat] = useState(null)
    console.log(socket);
    console.log(logged);
    console.log(nameTable2);



    // settiamo il nome della prima parte della tabella chat con lo username
    // tutto in minuscolo, la variabile settata servira per la creazione di una 
    // nuova tabella chat con un altro utente selezionato facendo si che la nuova
    // tabella chat sia composta da dal nome del utente loggato un underscore,
    // succesivamente verra settato setNameTabel2 che conterra il nome del utente
    // con il quale vogliamo creare la chat. La tabella sara composta da: 
    // nameTable1_nameTable2
    // tutto questo NON FUNZIONA!! ed in generale come soluzione farebbe schifo anche
    // se funzionasse, DA RISOLVERE 
    useEffect(() => {
        if (username) {
            setNameTable1(username.toLowerCase())
        }
    }, [username])





    // settiamo il socket con endpoint //localhost:3000 --> poi con newsocket.on
    // recuperiamo i messaggi, destrutturiamo i messaggi precedenti ed aggiungiamo 
    // il nuovo messaggio alla lista --- dipendente dal log del utente se e true 
    // esegue la funzione se no non viene eseguita --- IN FUTURO DA AUTENTICARE
    // CON JWT AUTHENTICATE (la middleware esiste già)
    useEffect(() => {
        if (!username || !logged) return

        const newSocket = io('http://localhost:3000')
        setSocket(newSocket)

        newSocket.on("chat message", (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg])
        })

        return () => {
            newSocket.disconnect()
        }
    }, [logged])



    // recuperiamo i messaggi dal server in base al nome della tabella ma in realtà 
    // lo recuperiamo in base al nome del utente, per maggiore chiarezza in futuro 
    // cambiare i nomi delle variabili
    useEffect(() => {
        if (!tableName) return

        async function getMessages() {
            try {
                const response = await fetch(`http://localhost:3000/messages?tablename=${tableName}`)
                if (response.ok) {
                    const data = await response.json()
                    setMessages(data)
                } else {
                    console.error("Errore nel recupero dei messaggi")
                }
            } catch (err) {
                console.error("Errore nel caricamento dei messaggi:", err)
            }
        }

        getMessages()
    }, [tableName])


    // funzione per mandare il messaggio scritto nel form al endpoint sul server
    // che a sua volta aggiungerà il messaggio alla tabella sql dei messaggi 
    // NOTA BENE: la funzione get messages viene eseguita solo una volta al login, l'implementazione 
    // viene eseguita tramite socket.io destrutturanto i messaggi caricati al login del
    // utente, ciò significa che i messaggi diventano permanenti solo al successivo accesso 
    // dell'utente. Questo potrebbe causare problemi di visualizzazione dei messaggi durante
    // la sessione corrente degli utenti --- DA CORREGGERE QUESTA PARTE IN FUTURO
    const sendMessage = (e) => {
        e.preventDefault()
        if (message.trim() && username?.trim() && socket) {
            socket.emit("chat message", { username, message, tableName })
            setMessage("")
        }
    }




    // funzione per il logout, rimuove il token da localstorage setta la variabile
    // logged su false e riporta alla home page --- FUNZIONE CHE FA CAGARE SARA DA 
    // MIGLIORARE ASSOLUTAMENTE IN FUTURO PERCHE NON E CHIARO IL SUO RAPPORTO CON
    // LA LIBRERIA DI PASSPORT
    function handleLogOut() {
        localStorage.removeItem('token')
        setLogged(false)
        navigate('/home')
    }



    // Recupera la chatlist per ogni utente, la variabile username e solo una parte del 
    // nome delle tabele, passiamo l'username, il server cerca lo username nel nome delle
    // tabelle esistenti nel database, recupera le tabelle con le chat degli altri utenti con 
    // solo l'ultimo messaggio contenente. Pare funzionare (ma non ne sono sicuro), comunque
    // in caso di un enorme mole di dati sarebbe poco efficente, per ora potrenne andare bene però.
    // Viene richiamata quando viene settato lo username, che pero viene recuperato con use params quindi
    // ci sono possibili problemi di sicurezza legati al modo con il quale recuperiamo i dati dello username
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


    // funzione per far vedere in chat window la chat selezionata, pare fatta bene.
    function selectChat(index) {
        setTableName(chatList[index].table_name)

    }


    // funzione per recuperare la lista degli utenti, funziona non ha problemi per ora
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



    // funzione per creare una nuova chat, funziona PARZIALMENTE, la chat viene creata
    // perccato che il nome della tabella chat non e composto dalle variabili nameTable1 e
    // nameTable2 ma da un bel undefind, boh
    // comunque viene attivata nel momento in cui viene settato nameTable2 che a sua volta 
    // e settato nel momento in cui clicchi su un utente nella lista utenti. 
    // DA SISTEMARE
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

    // function setNameTableChat(params) {
    //     setNameTableChat(params)
    // }

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
                    {chatList.map((table, index) => (
                        <div key={index} className={style.select_chat} onClick={() => selectChat(index)}>
                            <div className='d-flex align-items-center'>
                                <img src="/vite.svg" alt="img profile" style={{ width: 30 }} />
                                <h5>{table.table_name}</h5>
                            </div>
                            <p>{table.data[0]?.message}</p>
                        </div>
                    ))}
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
                        <h5>{username}</h5>
                    </div>

                    <div className={style.search_user_form}>
                        <form className='d-flex '>
                            <input className='form-control' type="text" placeholder="Search an user..." />
                            <button className='btn btn-secondary' type="submit">Search</button>
                        </form>
                    </div>
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
