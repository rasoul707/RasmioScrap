/* -------------------------------------------------------------------- */
/* Plugin Name           : Rasmino-Scrap                                */
/* Author Name           : rasoul707                                    */
/* File Name             : starter.js                                   */
/* -------------------------------------------------------------------- */

const { saveOutput } = require('./helper');
const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { exec } = require("child_process");
const agent = new SocksProxyAgent('socks5h://127.0.0.1:9050');
const axiosConfig = {
    httpsAgent: agent,
    httpAgent: agent
};
const axiosInstance = axios.create(axiosConfig);
const fs = require('fs');
const { exit } = require('process');
async function reloadProxy() {
    return new Promise((resolve, reject) => {
        exec("service tor reload", async (error, stdout, stderr) => {
            try {
                const myip = await axiosInstance.get(`https://ifconfig.io/ip`)
                fs.appendFileSync("iplist.log", myip?.data, { encoding: "utf-8" })
                console.log("New ip:", myip?.data)
                resolve(true)
            } catch (err) {
                console.log(err)
                fs.appendFileSync("iplist.log", "err\n", { encoding: "utf-8" })
                fs.appendFileSync("iplist.errors.log", err + "\n" + "****\n", { encoding: "utf-8" })
                resolve(await reloadProxy())
                exit(1)
            }
        });
    })
}


function checkCode(code) {
    code = code.toString()
    var L = code.length;
    if (L < 11 || parseInt(code, 10) == 0) return false;
    if (parseInt(code.substr(3, 6), 10) == 0) return false;
    var c = parseInt(code.substr(10, 1), 10);
    var d = parseInt(code.substr(9, 1), 10) + 2;
    var z = new Array(29, 27, 23, 19, 17);
    var s = 0;
    for (var i = 0; i < 10; i++) {
        s += (d + parseInt(code.substr(i, 1), 10)) * z[i % 5];
    }
    s = s % 11; if (s == 10) s = 0;
    return (c == s);
}


function sumOfArray(array) {
    var total = 0;
    for (var i = 0; i < array.length; i++) {
        total = total + array[i];
    }
    return total;
}


// async function yyy() {
//     try {
//         const GetSummary = await axiosInstance.get(`https://dalahou.rasm.io/api/v2/Companies/GetSummary?companyId=2`);
//         const summary = GetSummary?.data?.data?.companySummary
//     } catch (err) {
//         console.log("err", err.response.status, "yyy")
//     }
// }


async function extractData(code) {
    try {
        const GetSummary = await axiosInstance.get(`https://dalahou.rasm.io/api/v2/Companies/GetSummary?companyId=${code}`)
        const summary = GetSummary?.data?.data?.companySummary
        const GetFinancial = await axiosInstance.get(`https://dalahou.rasm.io/api/v2/Companies/GetFinancial?companyId=${code}`)
        const financial = GetFinancial?.data?.data?.financial
        const GetProducts = await axiosInstance.get(`https://dalahou.rasm.io/api/v2/Companies/GetProducts?companyId=${code}`)
        const products = GetProducts?.data?.data?.companyProductAndService
        const GetNews = await axiosInstance.get(`https://dalahou.rasm.io/api/v2/Companies/GetAllNews?companyId=${code}`)
        const news = GetNews?.data?.data?.news
        return {
            id: summary.id,
            title: summary.title,
            status: summary?.summary?.status,
            registrationTypeTitle: summary?.summary?.registrationTypeTitle,
            lastFinancial: financial?.capitalChanges[0]?.capitalTo || 0,
            totalCurrencies: sumOfArray(financial?.centralBankCurrencies?.map(({ inEuro }) => inEuro)) || 0,
            personnel: products.samtInfoList[0]?.personel || 0,
            website: summary?.communications?.webSite || "",
            lastNewsDate: news[0]?.newsPaperDate ? new Date(news[0]?.newsPaperDate).toLocaleDateString('fa-IR') : "",
        }
    } catch (error) {
        fs.appendFileSync("extractData.errors.log", error + "\n" + "****\n", { encoding: "utf-8" })
        if (error?.response?.status === 400) {
            console.log("ProxySwitch")
            await reloadProxy()
            return await extractData(code)
        }
        return null
    }
}


const validate = async (outputName, start, end) => {
    console.log(">", outputName, "started")
    let validCount = 0
    for (let code = start; code < end; code++) {
        const isValid = checkCode(code)
        const companyData = isValid ? await extractData(code) : null
        const haveData = isValid && companyData !== null
        if (!haveData) continue
        validCount++
        const d = companyData
        const data = [d.id, d.title, d.status, d.registrationTypeTitle, d.lastFinancial, d.totalCurrencies, d.personnel, d.website, d.lastNewsDate]
        saveOutput(outputName, data.join(",") + "\n")
    }
    console.log(">", outputName, "finished", `(${validCount})`)
}


(async () => {
    const actionTitle = "Extract all companies"
    console.log(actionTitle + ":", "starting")
    await reloadProxy()
    const perStep = 1000000
    for (let cat = Math.pow(10, 10) + 1; cat < Math.pow(10, 10) + Math.pow(10, 10); cat += perStep) {
        const outputName = `data-${cat}_${cat + perStep - 1}.txt`;
        validate(outputName, cat, cat + perStep)
    }
})()


