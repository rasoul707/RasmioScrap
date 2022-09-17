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
    fs.writeFileSync(output, '\ufeff' + data, { encoding: "utf-8" })
    return output
}






module.exports = {
    listCommandItems,
    saveOutput,
}