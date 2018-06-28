load('api_config.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_timer.js');

let delay = Cfg.get('relay.delay');
let counter = 0;
let startCounting = false;

function init() {
    GPIO.set_mode(Cfg.get('relay.pin'), GPIO.MODE_OUTPUT);
    GPIO.write(Cfg.get('relay.pin'), Cfg.get('relay.stateOff'));
    MQTT.sub(Cfg.get('relay.topic'), function (connection, topic, message) {
        if (message === "0") {
            let startCounting = true;
            counter = 0;
        } else {
            GPIO.write(Cfg.get('relay.pin'), Cfg.get('relay.stateOn'));
            startCounting = false;
        }
    }, null);

}

function setTimer() {
    Timer.set(1000 * 1, Timer.REPEAT, function () {
        if (startCounting) {
            if (counter >= delay) {
                GPIO.write(Cfg.get('relay.pin'), Cfg.get('relay.stateOff'));
                startCounter = false;
                counter = 0;
            } else {
                counter++;
            }
        }
    }, null);
}

init();
setTimer();