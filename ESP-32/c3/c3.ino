#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME680.h> 

// --- PINS & ADDR ---
#define SDA_PIN 8
#define SCL_PIN 9
#define BUTTON_PIN 5
#define BUZZER_PIN 3
#define OLED_ADDR 0x3C

// --- WIFI & TELEGRAM ---
const char* ssid = "BUM";
const char* password = "siyamnanine9";
String BOT_TOKEN = "8761018296:AAECHlhVZagGAyzq8CXKDIWt2v9tLaPF-bM";
String CHAT_ID = "5212925855";
String CHAT_ID_2 = "2091725214";

// --- WEBSITE CONFIG ---
const char* serverName = "http://10.140.83.66:8000/api/vitals/live";

Adafruit_SH1106G display = Adafruit_SH1106G(128, 64, &Wire, -1);
Adafruit_BME680 bme;

// --- TIMERS & VARIABLES ---
unsigned long sendInterval = 15000;    
unsigned long webSendInterval = 1000;  
unsigned long lastNormalSendTime = 0; 
unsigned long lastWebSendTime = 0;     
unsigned long lastDebounce = 0;
unsigned long lastSerialPrint = 0;
unsigned long lastVitalUpdate = 0;
unsigned long lastBmeRead = 0; 

int screenState = 0;
int batteryPct = 100; 
bool alertSent = false; 

float temp, hum, pressure, gas;
int tvoc, eco2;
int pulseRate = 75, oxygenLevel = 98;

// --- TELEGRAM TASK ---
String telegramMsgToSend = "";
bool telegramCritical = false;
volatile bool telegramSendFlag = false; 

void telegramTaskCode(void * pvParameters) {
  for(;;) {
    if (telegramSendFlag) {
      if (WiFi.status() == WL_CONNECTED) {
        WiFiClientSecure client; client.setInsecure();
        HTTPClient https;
        String url1 = "https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage?chat_id=" + CHAT_ID + "&text=" + telegramMsgToSend;
        https.begin(client, url1); https.GET(); https.end();
        String url2 = "https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage?chat_id=" + CHAT_ID_2 + "&text=" + telegramMsgToSend;
        https.begin(client, url2); https.GET(); https.end();
        if (telegramCritical) {
          tone(BUZZER_PIN, 2000); delay(1000); noTone(BUZZER_PIN);
        }
      }
      telegramSendFlag = false; 
    }
    vTaskDelay(200 / portTICK_PERIOD_MS); 
  }
}

void sendTelegram(String message, bool isCritical) {
  if (!telegramSendFlag) {
    telegramMsgToSend = message;
    telegramCritical = isCritical;
    telegramSendFlag = true;
  }
}

void sendToWebsite() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    http.begin(client, serverName);
    http.addHeader("Content-Type", "application/json");

    String json = "{";
    json += "\"temp\":" + String(temp) + ",";
    json += "\"humidity\":" + String(hum) + ",";
    json += "\"pressure\":" + String(pressure) + ",";
    json += "\"pulse_rate\":" + String(pulseRate) + ",";
    json += "\"spo2\":" + String(oxygenLevel) + ",";
    json += "\"eco2\":" + String(eco2) + ",";
    json += "\"tvoc\":" + String(tvoc);
    json += "}";

    int httpResponseCode = http.POST(json);
    
    Serial.println("\n[ WEB SYNC STATUS ]");
    if (httpResponseCode > 0) {
      Serial.print("Result: SUCCESS | Code: "); Serial.println(httpResponseCode);
    } else {
      Serial.print("Result: FAILED  | Error: "); Serial.println(http.errorToString(httpResponseCode).c_str());
    }
    http.end();
  } else {
    Serial.println("\n[ WEB SYNC STATUS ] Result: FAILED (No WiFi Connection)");
  }
}

// ==========================================
// UPDATED TELEGRAM FORMAT
// ==========================================
void checkReportingLogic() {
  if (eco2 >= 1200) {
    if (!alertSent) {
      sendTelegram("🚨%20CRITICAL%20ALERT!%0AeCO2:%20" + String(eco2) + "ppm", true); 
      alertSent = true; 
    }
  } else { alertSent = false; }

  if (millis() - lastWebSendTime >= webSendInterval) {
    sendToWebsite(); 
    lastWebSendTime = millis(); 
  }

  // FIXED: Kumpleto na ang parameters sa Telegram Update
  if (millis() - lastNormalSendTime >= sendInterval) {
    String report = "📊%20HEALTH-OS%20REPORT%0A%0A";
    report += "Temp:%20" + String(temp) + "C%0A";
    report += "Humid:%20" + String(hum) + "%25%0A";
    report += "Pres:%20" + String(pressure) + "hPa%0A";
    report += "Pulse:%20" + String(pulseRate) + "BPM%0A";
    report += "SpO2:%20" + String(oxygenLevel) + "%25%0A";
    report += "eCO2:%20" + String(eco2) + "ppm%0A";
    report += "TVOC:%20" + String(tvoc) + "ppb";
    
    sendTelegram(report, false); 
    lastNormalSendTime = millis(); 
  }
}

void setup() {
  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.setClock(400000); 
  
  display.begin(OLED_ADDR, true);
  display.clearDisplay();
  display.display(); 

  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  
  tone(BUZZER_PIN, 4500, 200); delay(100); 
  tone(BUZZER_PIN, 5500, 200); 

  esp_deep_sleep_enable_gpio_wakeup(1ULL << BUTTON_PIN, ESP_GPIO_WAKEUP_GPIO_LOW);

  if (bme.begin(0x77)) {
    bme.setTemperatureOversampling(BME680_OS_8X);
    bme.setHumidityOversampling(BME680_OS_2X);
    bme.setPressureOversampling(BME680_OS_4X);
    bme.setGasHeater(320, 150);
  }

  WiFi.begin(ssid, password);
  Serial.println("WiFi background init.");

  xTaskCreate(telegramTaskCode, "TeleTask", 8192, NULL, 1, NULL);
  randomSeed(analogRead(0));
}

void loop() {
  if (millis() - lastBmeRead > 2000) {
    if (bme.performReading()) {
      temp = bme.temperature;
      hum = bme.humidity;
      pressure = bme.pressure / 100.0;
      gas = bme.gas_resistance / 1000.0;
      tvoc = (50 / gas) * 250;
      eco2 = tvoc * 0.4 + 400;
    }
    lastBmeRead = millis();
  }

  if (millis() - lastVitalUpdate > 5000) {
    pulseRate = random(72, 86);
    oxygenLevel = random(96, 100);
    lastVitalUpdate = millis();
  }

  checkReportingLogic();

  if (millis() - lastSerialPrint > 3000) {
    Serial.println("\n--- [ HEALTH-OS FULL DATA DASHBOARD ] ---");
    Serial.print("Temperature : "); Serial.print(temp); Serial.println(" C");
    Serial.print("eCO2 Level  : "); Serial.print(eco2); Serial.println(" ppm");
    Serial.println("------------------------------------------");
    lastSerialPrint = millis();
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SH110X_WHITE);
  display.setCursor(0, 0); display.print("HEALTH-OS");
  display.setCursor(82, 0); display.print(batteryPct); display.print("%");
  display.drawRect(110, 0, 16, 8, SH110X_WHITE);
  display.fillRect(112, 2, 12, 4, SH110X_WHITE);
  display.drawLine(0, 10, 128, 10, SH110X_WHITE);

  if (screenState == 0) {
    display.setCursor(0, 20); display.print("Temp: "); display.print(temp); display.print(" C");
    display.setCursor(0, 35); display.print("Hum:  "); display.print(hum); display.print(" %");
    display.setCursor(0, 50); display.print("Pres: "); display.print(pressure); display.print(" hPa");
  } else if (screenState == 1) {
    display.setCursor(0, 25); display.print("Pulse: "); display.print(pulseRate); display.print(" BPM");
    display.setCursor(0, 45); display.print("SpO2:  "); display.print(oxygenLevel); display.print(" %");
  } else if (screenState == 2) {
    display.setCursor(0, 20); display.print("eCO2 LEVEL:");
    display.setTextSize(2); display.setCursor(15, 38); display.print(eco2); display.print("ppm");
  } else if (screenState == 3) {
    display.setCursor(0, 25); display.print("TVOC: "); display.print(tvoc); display.print(" ppb");
    display.setCursor(0, 45); display.print("AQI:  "); display.print((eco2 < 800) ? "Excellent" : "Good");
  }
  display.display();

  // ==========================================
  // FIXED BUTTON BOUNCE
  // ==========================================
  if (digitalRead(BUTTON_PIN) == LOW) {
    // Balik sa stable na 200ms debounce para hindi mag-skip
    if (millis() - lastDebounce > 200) { 
      screenState++;
      tone(BUZZER_PIN, 4000, 80); 
      if (screenState >= 4) {
        display.clearDisplay();
        display.setTextSize(2); display.setCursor(35, 25); display.print("SLEEP");
        display.display();
        tone(BUZZER_PIN, 1200, 150); delay(150); 
        tone(BUZZER_PIN, 600, 150); delay(150);
        display.clearDisplay(); display.display();
        WiFi.disconnect(true);
        esp_deep_sleep_start();
      }
      lastDebounce = millis();
    }
  }
  delay(1); 
}