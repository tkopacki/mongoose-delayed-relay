load('api_config.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_timer.js');

let delay = Cfg.get('relay.delay');
let counter = 0;
let startCounting = false;

function init() {
    GPIO.set_mode(Cfg.get('relay.pin'), GPIO.MODE_OUTPUT);
    GPIO.set_mode(1, GPIO.MODE_OUTPUT);
    GPIO.write(Cfg.get('relay.pin'), Cfg.get('relay.stateOff'));
    MQTT.sub(Cfg.get('relay.topic'), function (connection, topic, message) {
        if (message === "0") {
            GPIO.write(1, 0);
            print('OFF signal recieved, starting counter...');
            MQTT.pub('home/bathroom/callback', 'OFF signal recieved, starting counter...');
            startCounting = true;
            counter = 0;
        } else {
            GPIO.write(1, 1);
            GPIO.write(Cfg.get('relay.pin'), Cfg.get('relay.stateOn'));
            print('Relay set to ON');
            MQTT.pub('home/bathroom/callback', 'Relay set to ON');
            startCounting = false;
        }
    }, null);

}

function setTimer() {
    Timer.set(1000 * 1, Timer.REPEAT, function () {
        if (startCounting) {
            if (counter >= delay) {
                print('OFF signal confirmed');
                MQTT.pub('home/bathroom/callback', 'OFF signal confirmed');
                GPIO.write(Cfg.get('relay.pin'), Cfg.get('relay.stateOff'));
                startCounting = false;
                counter = 0;
            } else {
                counter++;
                print('Still below treshold...');
                MQTT.pub('home/bathroom/callback', 'Still below treshold...');
            }
        }
    }, null);
}

init();
setTimer();