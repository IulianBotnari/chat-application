

const getFile = (req, res) => {
    const data = req.body

    res.json({ data })
}


module.exports = {
    getFile
}