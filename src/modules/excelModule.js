exports.objectToExcelRows = (ws, row, items, numberStyle=null)=>{
    for(let i in items) {
        key = Object.keys(items[i])[0];
        switch(key) {
            case 'string':
                ws.cell(row, i)
                    .string(''+items[i][key]);
                break;
            case 'number':
                if(!numberStyle) {
                    ws.cell(row, i)
                        .number(parseFloat(items[i][key]+0));
                } else {
                    ws.cell(row, i)
                        .number(parseFloat(items[i][key]+0))
                        .style(numberStyle);
                }
                break;
        }
    }
    return ws;
}

exports.getStyle = (wb, fontColor, fontSize, isBold=false)=>{
    let style = wb.createStyle({
        font: {
            color: fontColor,
            size: fontSize,
            bold: isBold
        }
    });
    return style;
}

exports.getNumberStyle = (wb, roundoff, isBold=false)=>{
    let formatString = '#';
    if(roundoff>0)
        formatString += '.';
    for(let i=roundoff ; i>0 ; i--) {
        formatString += '0';
    }
    formatString = `${formatString};-${formatString};-`;
    console.log(formatString);
    let style = wb.createStyle({
        font: {
            bold: isBold
        },
        numberFormat: formatString
    });
    return style;
}