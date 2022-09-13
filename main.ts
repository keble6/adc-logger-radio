function readTime () {
    date = "" + leadingZero(DS3231.date()) + "/" + leadingZero(DS3231.month()) + "/" + DS3231.year()
    time = "" + leadingZero(DS3231.hour()) + ":" + leadingZero(DS3231.minute())
    dateTimeString = "" + date + " " + time
}
// Round to 3 dec places, and multiply by gain for attenuated inputs
function makeReading () {
    V0 = _2decPlaces(ADS1115.readADC(0) / scale0, 3)
    V1 = _2decPlaces(ADS1115.readADC(1) / scale1, 3)
    V2 = _2decPlaces(ADS1115.readADC(2) / scale2, 3)
    V3 = _2decPlaces(ADS1115.readADC(3), 3)
}
function resetReadings () {
    count = 0
    dateTimeReadings = []
    Vreadings0 = []
    Vreadings1 = []
    Vreadings2 = []
    Vreadings3 = []
}
function leadingZero (num: number) {
    if (num < 10) {
        return "0" + num
    } else {
        return convertToText(num)
    }
}
function _2decPlaces (num: number, places: number) {
    a = 10 ** places
    b = Math.round(num * a)
    return b / a
}
// Instant Reading
input.onButtonPressed(Button.A, function () {
    makeReading()
    serial.writeValue("V0", V0)
    serial.writeValue("V1", V1)
    serial.writeValue("V2", V2)
    serial.writeValue("V3", V3)
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
    serial.writeValue("count", count)
    if (count > 0) {
        for (let index5 = 0; index5 <= count - 1; index5++) {
            radio.sendString("" + dateTimeReadings[index5] + ",")
            basic.pause(sendDelay)
            radio.sendValue("V0", Vreadings0[index5])
            basic.pause(sendDelay)
            radio.sendValue("V1", Vreadings1[index5])
            basic.pause(sendDelay)
            radio.sendValue("V2", Vreadings2[index5])
            basic.pause(sendDelay)
            radio.sendValue("V3", Vreadings3[index5])
            basic.pause(sendDelay)
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
radio.onReceivedString(function (receivedString) {
    stringIn = receivedString
    command = stringIn.substr(0, 2)
    if (command.compare("rt") == 0) {
        serial.writeLine("#readtime")
        readTime()
        radio.sendString("r" + dateTimeString)
    } else if (command.compare("st") == 0) {
        setTime(stringIn)
    } else if (command.compare("sd") == 0) {
        setDate(stringIn)
    } else if (command.compare("up") == 0) {
        serial.writeLine("#upload")
        upload()
    } else if (command.compare("xx") == 0) {
        resetReadings()
    } else if (command.compare("ak") == 0) {
        ack = true
    }
})
let params = ""
let b = 0
let a = 0
let Vreadings3: number[] = []
let Vreadings2: number[] = []
let Vreadings1: number[] = []
let Vreadings0: number[] = []
let dateTimeReadings: string[] = []
let V3 = 0
let V2 = 0
let V1 = 0
let V0 = 0
let dateTimeString = ""
let time = ""
let date = ""
let sendDelay = 0
let scale2 = 0
let scale1 = 0
let scale0 = 0
let count = 0
let command = ""
let stringIn = ""
let ack = false
// only upload a string to radio if ack is true
ack = false
stringIn = ""
command = ""
let oneMinute = 60000
count = 0
let gain = 3
// Accurate scaling for attenuators
scale0 = 0.3339
// Accurate scaling for attenuators
scale1 = 0.3301
// Accurate scaling for attenuators
scale2 = 0.3297
// Delay after sending Radio mesg, to allow handling by receiver and terminal
sendDelay = 100
ADS1115.setADDR(72)
ADS1115.setFSR(FSR.V4)
radio.setGroup(1)
resetReadings()
makeReading()
// TODO - add multi-minute loop
loops.everyInterval(oneMinute, function () {
    if (DS3231.minute() % 30 == 0) {
        readTime()
        dateTimeReadings.push(dateTimeString)
        makeReading()
        count += 1
        Vreadings0.push(V0)
        Vreadings1.push(V1)
        Vreadings2.push(V2)
        Vreadings3.push(V3)
    }
    led.plot(4, 0)
    basic.pause(50)
    led.unplot(4, 0)
})
