function readTime () {
    date = "" + leadingZero(DS3231.date()) + "/" + leadingZero(DS3231.month()) + "/" + DS3231.year()
    time = "" + leadingZero(DS3231.hour()) + ":" + leadingZero(DS3231.minute())
    dateTime = "" + date + " " + time
}
// Round to 3 dec places, and multiply by gain for attenuated inputs
function makeReading () {
    ADC0 = convertToText(_2decPlaces(ADS1115.readADC(0) / scale0, 3))
    ADC1 = convertToText(_2decPlaces(ADS1115.readADC(1) / scale1, 3))
    ADC2 = convertToText(_2decPlaces(ADS1115.readADC(2) / scale2, 3))
    ADC3 = convertToText(_2decPlaces(ADS1115.readADC(3), 3))
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
    serial.writeLine(ADC0)
    serial.writeLine(ADC1)
    serial.writeLine(ADC2)
    serial.writeLine(ADC3)
    radio.sendString(ADC0)
    basic.pause(sendDelay)
    radio.sendString(ADC1)
    basic.pause(sendDelay)
    radio.sendString(ADC2)
    basic.pause(sendDelay)
    radio.sendString(ADC3)
    basic.pause(sendDelay)
})
function sendRadioWithAck (text: string) {
    while (!(ack)) {
        serial.writeLine("#waiting for ack")
    }
    radio.sendString(text)
    ack = false
}
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
            sendRadioWithAck("" + dateTimeReadings[index5] + ",")
            sendRadioWithAck("" + Vreadings0[index5] + ",")
            sendRadioWithAck("" + Vreadings1[index5] + ",")
            sendRadioWithAck("" + Vreadings2[index5] + ",")
            sendRadioWithAck(Vreadings3[index5])
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
        radio.sendString(dateTime)
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
let Vreadings3: string[] = []
let Vreadings2: string[] = []
let Vreadings1: string[] = []
let Vreadings0: string[] = []
let dateTimeReadings: string[] = []
let ADC3 = ""
let ADC2 = ""
let ADC1 = ""
let ADC0 = ""
let dateTime = ""
let time = ""
let date = ""
let scale2 = 0
let scale1 = 0
let scale0 = 0
let sendDelay = 0
let count = 0
let command = ""
let stringIn = ""
let ack = false
// only upload a string to radio if ack is true
ack = true
stringIn = ""
command = ""
let oneMinute = 60000
count = 0
let gain = 3
// Delay between sending Radio messages
sendDelay = 500
// Accurate scaling for attenuators
scale0 = 0.3339
// Accurate scaling for attenuators
scale1 = 0.3301
// Accurate scaling for attenuators
scale2 = 0.3297
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
