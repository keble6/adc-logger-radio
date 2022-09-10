function readTime () {
    date = "" + leadingZero(DS3231.date()) + "/" + leadingZero(DS3231.month()) + "/" + DS3231.year()
    time = "" + leadingZero(DS3231.hour()) + ":" + leadingZero(DS3231.minute())
    dateTimeString = "" + date + " " + time
}
// Round to 3 dec places, and multiply by gain for attenuated inputs
function makeReading () {
    ADCstring = "" + Math.round(ADS1115.readADC(0) / ADC2V / scale0 * 1000) + "," + Math.round(ADS1115.readADC(1) / ADC2V / scale1 * 1000) + "," + Math.round(ADS1115.readADC(2) / ADC2V / scale2 * 1000) + "," + Math.round(ADS1115.readADC(3) / ADC2V * 1000)
}
function resetReadings () {
    count = 0
    dateTimeReadings = []
    Vreadings = []
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
    serial.writeNumber(ADS1115.readADC(1))
    serial.writeLine("")
    serial.writeNumber(ADS1115.readADC(2))
    serial.writeLine("")
})
function sendRadioWithAck (text: string) {
    for (let index = 0; index < Nresends; index++) {
        // Send then wait for ack 
        radio.sendString(text)
        // Allow 500 ms for ACK
        for (let index = 0; index < 50; index++) {
            basic.pause(10)
            if (ack) {
                ack = false
                return true
            }
        }
    }
    serial.writeLine("No ACK detected!")
    return false
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
            radio.sendString("" + dateTimeReadings[index5] + ",")
            basic.pause(100)
            radio.sendString("" + (Vreadings[index5]))
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
radio.onReceivedString(function (receivedString) {
    stringIn = receivedString
    command = stringIn.substr(0, 2)
    if (command.compare("rt") == 0) {
        serial.writeLine("#readtime")
        readTime()
        radio.sendString(dateTimeString)
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
let Vreadings: string[] = []
let dateTimeReadings: string[] = []
let ADCstring = ""
let dateTimeString = ""
let time = ""
let date = ""
let scale2 = 0
let scale1 = 0
let scale0 = 0
let ADC2V = 0
let count = 0
let command = ""
let stringIn = ""
let Nresends = 0
let ack = false
// only upload a string to radio if ack is true
ack = false
// number of radio message resends to try
Nresends = 10
stringIn = ""
command = ""
let oneMinute = 60000
count = 0
let gain = 3
// Delay between sending Radio messages
let sendDelay = 500
// convert ADC reading to Volts by dividing by this
ADC2V = 8000
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
    if (DS3231.minute() % 1 == 0) {
        readTime()
        dateTimeReadings.push(dateTimeString)
        makeReading()
        Vreadings.push(ADCstring)
        count += 1
    }
    led.plot(4, 0)
    basic.pause(50)
    led.unplot(4, 0)
})
