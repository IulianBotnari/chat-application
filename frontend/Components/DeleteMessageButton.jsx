import Style from "../Components/DeleteMessageButton.module.css"
import { useGlobalContext } from "../src/Contexts/GlobalContext/Context";

export default function DeleteMessageButton({ msgIndex, tableName, msgUrename, username }) {

    const { setDleteMessage } = useGlobalContext()




    async function deleteMessage() {
        try {
            const response = await fetch((`http://localhost:3000/deletemessage`), {
                method: 'DELETE',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ msgIndex: msgIndex, tableChat: tableName })
            })

            if (!response.ok) {
                throw new Error("Errore nel eliminazione del messaggio")
            }
            const data = await response.json()
            console.log("Messaggio eliminato:", data.message)
        } catch (err) {
            console.error(err)
        }

        setDleteMessage(msgIndex)

    }


    return (

        <>
            <button className={msgUrename === username ? Style.trash_button : Style.trash_button_left} msgIndex={msgIndex} tableName={tableName} onClick={deleteMessage}><i className={`bi bi-trash-fill ${Style.trash_icon}`} ></i></button>
        </>
    )
}