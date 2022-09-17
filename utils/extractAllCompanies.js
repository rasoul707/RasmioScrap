/* -------------------------------------------------------------------- */
/* Plugin Name           : Rasmino-Scrap                                */
/* Author Name           : rasoul707                                    */
/* File Name             : starter.js                                   */
/* -------------------------------------------------------------------- */

const { saveOutput } = require('./helper');
const axios = require('axios');




function checkCode(code) {
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
        const GetSummary = await await axios.get(`https://dalahou.rasm.io/api/v2/Companies/GetSummary?companyId=${code}`)
        const summary = GetSummary?.data?.data?.companySummary

        const GetFinancial = await await axios.get(`https://dalahou.rasm.io/api/v2/Companies/GetFinancial?companyId=${code}`)
        const financial = GetFinancial?.data?.data?.financial

        const GetProducts = await await axios.get(`https://dalahou.rasm.io/api/v2/Companies/GetProducts?companyId=${code}`)
        const products = GetProducts?.data?.data?.companyProductAndService

        const GetNews = await await axios.get(`https://dalahou.rasm.io/api/v2/Companies/GetAllNews?companyId=${code}`)
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
        return null
    }
}


(async () => {
    const actionTitle = "Extract all companies"
    console.log(actionTitle + ":", "starting")
    const outputName = `data.csv`
    let data = [["شناسه", "اسم", "وضعیت", "نوع شرکت", "آخرین سرمایه ثبتی", "محموع ارز دریافتی", "تعداد پرسنل", "وبسایت", "تاریخ آخرین آگهی"]]
    const outputPath = saveOutput(outputName, data.join("\n"))

    for (let code = Math.pow(10, 10); code < Math.pow(10, 11); code++) {
        // let code = 10100253038
        const isValid = checkCode(code.toString())
        const companyData = isValid ? await extractData(code) : null
        const haveData = isValid && companyData !== null
        console.log(">", code, haveData ? "valid" : "not valid")
        if (!haveData) continue
        const d = companyData
        data.push([d.id, d.title, d.status, d.registrationTypeTitle, d.lastFinancial, d.totalCurrencies, d.personnel, d.website, d.lastNewsDate])
        saveOutput(outputName, data.map(e => e.join(",")).join("\n"))
    }
    console.log(actionTitle + ":", "completed", `(${data.length})`)
    console.log(`output = ${outputPath}`)
})()