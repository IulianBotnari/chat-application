

export default function DleteMessageButton({ msgIndex, tableName }) {

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

    }


    return (

        <>
            <button msgIndex={msgIndex} tableName={tableName} onClick={deleteMessage}>Canc</button>
        </>
    )
}