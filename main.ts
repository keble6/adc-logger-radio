function readTime () {
    date = "" + DS3231.date() + "/" + DS3231.month() + "/" + DS3231.year()
    time = "" + DS3231.hour() + ":" + DS3231.minute()
    dateTime = "" + date + " " + time + ","
}
// Round to 3 dec places, and multiply by gain for attenuated inputs
function makeReading () {
    for (let index = 0; index <= Nloops; index++) {
        ADC0 = "" + gain * _2decPlaces(ADS1115.readADC(0), 3) + ","
    }
    for (let index2 = 0; index2 <= Nloops; index2++) {
        ADC1 = "" + gain * _2decPlaces(ADS1115.readADC(1), 3) + ","
    }
    for (let index3 = 0; index3 <= Nloops; index3++) {
        ADC2 = "" + gain * _2decPlaces(ADS1115.readADC(2), 3) + ","
    }
    for (let index4 = 0; index4 <= Nloops; index4++) {
        ADC3 = _2decPlaces(ADS1115.readADC(3), 3)
    }
}
function resetReadings () {
    count = 0
    dateTimeReadings = []
    Vreadings0 = []
    Vreadings1 = []
    Vreadings2 = []
    Vreadings3 = []
}
function _2decPlaces (num: number, places: number) {
    a = 10 ** places
    b = Math.round(num * a)
    return b / a
}
// Instant Reading
input.onButtonPressed(Button.A, function () {
    serial.writeLine(ADC0)
    serial.writeLine(ADC1)
    serial.writeLine(ADC2)
    serial.writeLine("" + (ADC3))
    radio.sendString(ADC0)
    basic.pause(100)
    radio.sendString(ADC1)
    basic.pause(100)
    radio.sendString(ADC2)
    basic.pause(100)
    radio.sendString("" + (ADC3))
})
function setDate (text: string) {
    params = text.substr(2, text.length - 2)
    DS3231.dateTime(
    parseFloat(params.substr(4, 4)),
    parseFloat(params.substr(2, 2)),
    parseFloat(params.substr(0, 2)),
    DS3231.day(),
    DS3231.hour(),
    DS3231.minute(),
    DS3231.second()
    )
}
function upload () {
    if (count > 0) {
        for (let index5 = 0; index5 <= count - 1; index5++) {
            radio.sendString("" + (dateTimeReadings[index5]))
            basic.pause(100)
            radio.sendString("" + (Vreadings0[index5]))
            basic.pause(100)
            radio.sendString("" + (Vreadings1[index5]))
            basic.pause(100)
            radio.sendString("" + (Vreadings2[index5]))
            basic.pause(100)
            radio.sendString("" + (Vreadings3[index5]))
            basic.pause(100)
        }
    }
}
function setTime (text: string) {
    params = text.substr(2, text.length - 2)
    DS3231.dateTime(
    DS3231.year(),
    DS3231.month(),
    DS3231.date(),
    DS3231.day(),
    parseFloat(params.substr(0, 2)),
    parseFloat(params.substr(2, 2)),
    0
    )
}
// My TEMPORARY upload - no dateTime yet!
input.onButtonPressed(Button.B, function () {
    upload()
})
let params = ""
let b = 0
let a = 0
let Vreadings3: number[] = []
let Vreadings2: string[] = []
let Vreadings1: string[] = []
let Vreadings0: string[] = []
let dateTimeReadings: string[] = []
let ADC3 = 0
let ADC2 = ""
let ADC1 = ""
let ADC0 = ""
let dateTime = ""
let time = ""
let date = ""
let gain = 0
let count = 0
let Nloops = 0
let stringIn = ""
let command = ""
let oneMinute = 60000
Nloops = 50
count = 0
gain = 3
ADS1115.setADDR(72)
ADS1115.setFSR(FSR.V4)
radio.setGroup(1)
resetReadings()
makeReading()
// TODO - add multi-minute loop
loops.everyInterval(oneMinute, function () {
    if (DS3231.minute() % 5 == 0) {
        readTime()
        dateTimeReadings.push(dateTime)
        makeReading()
        Vreadings0.push(ADC0)
        Vreadings1.push(ADC1)
        Vreadings2.push(ADC2)
        Vreadings3.push(ADC3)
        count += 1
    }
    led.plot(4, 0)
    basic.pause(50)
    led.unplot(4, 0)
})
