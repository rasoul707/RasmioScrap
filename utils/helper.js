/* -------------------------------------------------------------------- */
/* Plugin Name           : Rasmino-Scrap                                */
/* Author Name           : rasoul707                                    */
/* File Name             : helper.js                                    */
/* -------------------------------------------------------------------- */


const fs = require("fs")


const listCommandItems = (list) => {
    return Object.keys(list).map((i) => {
        return `${i}) ${list[i]}`
    }).join("\n")
}





const saveOutput = (file, data) => {
    const output = `outputs/${file}`
    if (!fs.existsSync(`outputs`)) fs.mkdirSync(`outputs`)
    if (!fs.existsSync(output)) fs.writeFileSync(output, '\ufeff', { encoding: "utf-8" })
    fs.appendFileSync(output, data, { encoding: "utf-8" })
    return output
}






module.exports = {
    listCommandItems,
    saveOutput,
}