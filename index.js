/* -------------------------------------------------------------------- */
/* Plugin Name           : Rasmino-Scrap                                */
/* Author Name           : rasoul707                                    */
/* File Name             : index.js                                     */
/* -------------------------------------------------------------------- */


const { exit } = require('process');
const { listCommandItems } = require('./utils/helper')



const lunch = async () => {
    return new Promise((resolve, reject) => {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout,
        })
        console.log("Welcome to ©Rasmino Scrap App")
        const actionsList = {
            1: 'Extract all companies',
        }
        readline.question(`${listCommandItems(actionsList)}\n\nChoose item: `, (data) => {
            data = parseInt(data)
            if (!actionsList[data]) {
                reject("Command not found")
            }
            resolve(data)
            readline.close()
        })
    })
}




(async () => {
    try {
        const data = await lunch()
        if (data === 1) require('./utils/extractAllCompanies')
    } catch (err) {
        console.error("Err:", err)
        exit(1)
    }
})()
