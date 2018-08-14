'use strict'

const Gpio = require('onoff').Gpio;
const {exec} = require('child_process');

var fanControl = {
	init: function(interval, tempStart, tempStop, pinNumber) {
		let self = this;
		self.interval = interval;
		self.tempStart = tempStart;
		self.tempStop = tempStop;
		self.running = false;
		self.pin = new Gpio(2, 'out');
		self.periodicCheck();
		setInterval(self.periodicCheck.bind(self), interval);
	},
	periodicCheck: function() {
		let self = this;
		self.getTemperature((err, temperature) => {
			if(err) {
			console.log(err);
		}
		if(self.running) {
			if(temperature < self.tempStop) {
				self.stop();
			}
		} else {
			if(temperature > 60) {
				self.start();
			}
		}
		});
	},
	start: function() {
		this.pin.writeSync(1);
		this.running = true;
	},
	stop: function() {
		this.pin.writeSync(0);
		this.running = false;
	},
	getTemperature: function(callback) {
		exec('vcgencmd measure_temp', (err, stdout, stderr) => {
		  if(err) {
		  	return callback(err);
		  }
		  var temperatureString = stdout.slice(5,-2);
		  var temperatureNumber = parseFloat(temperatureString);
		  return callback(err, temperatureNumber);
		});
	}

}

fanControl.init(15000, 60, 55, 600, 2);
