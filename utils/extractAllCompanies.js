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




async function reloadProxy() {
    exec("service tor reload", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
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


async function extractData(code) {
    try {
        const GetSummary = await await axiosInstance.get(`https://dalahou.rasm.io/api/v2/Companies/GetSummary?companyId=${code}`)
        const summary = GetSummary?.data?.data?.companySummary

        const GetFinancial = await await axiosInstance.get(`https://dalahou.rasm.io/api/v2/Companies/GetFinancial?companyId=${code}`)
        const financial = GetFinancial?.data?.data?.financial

        const GetProducts = await await axiosInstance.get(`https://dalahou.rasm.io/api/v2/Companies/GetProducts?companyId=${code}`)
        const products = GetProducts?.data?.data?.companyProductAndService

        const GetNews = await await axiosInstance.get(`https://dalahou.rasm.io/api/v2/Companies/GetAllNews?companyId=${code}`)
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
        if (error.response.status === 400) {
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
    const perStep = 100000
    const startFrom = 860176635
    // for (let cat = Math.pow(10, 10) + 1; cat < Math.pow(10, 11); cat += perStep) {
    // const outputName = `data-${cat}_${cat + perStep - 1}.txt`;
    const outputName = `data-.txt`;
    cat = startFrom + Math.pow(10, 10) + 1
    validate(outputName, cat, cat + 30)
    // }
})()