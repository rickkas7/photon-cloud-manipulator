#include "Particle.h"

SYSTEM_THREAD(ENABLED);

unsigned long lastLoopReport = 0;
size_t loopCount = 0;
bool wasCloudConnected = false;
bool wasWifiConnected = false;

void setup() {
	Serial.begin(9600);
}

void loop() {
	if (millis() - lastLoopReport >= 1000) {
		lastLoopReport = millis();
		Serial.printlnf("%d calls to loop", loopCount);
		loopCount = 0;
	}
	loopCount++;

	if (WiFi.ready()) {
		if (!wasWifiConnected) {
			wasWifiConnected = true;
			Serial.println("wifi connected");
		}
	}
	else {
		if (wasWifiConnected) {
			wasWifiConnected = false;
			Serial.println("wifi disconnected");
		}
	}

	if (Particle.connected()) {
		if (!wasCloudConnected) {
			wasCloudConnected = true;
			Serial.println("cloud connected");
		}
	}
	else {
		if (wasCloudConnected) {
			wasCloudConnected = false;
			Serial.println("cloud disconnected");
		}
	}
}
