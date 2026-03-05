#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

#define i2c_Address 0x3c 
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

// --- PINS ---
#define BUTTON_PIN 4
#define MOTOR_PIN 2
#define BUZZER_PIN 17

// --- WIFI & TELEGRAM CREDENTIALS ---
const char* ssid = "BUM";           
const char* password = "siyamnanine9";   
String BOT_TOKEN = "8761018296:AAECHlhVZagGAyzq8CXKDIWt2v9tLaPF-bM"; 
String CHAT_ID = "5212925855";   // GIO
String CHAT_ID_2 = "2091725214"; //JESH             

Adafruit_SH1106G display = Adafruit_SH1106G(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// --- VARIABLES ---
int screenState = 0; 
unsigned long lastDebounceTime = 0;
unsigned long debounceDelay = 300; 
unsigned long lastNormalSendTime = 0; 

int batteryPct = 100; 
int bpm = 75;
int spo2 = 98;
float co2Level = 0.08; 
float temp = 29.5;
float hum = 60.0;
float pressure = 1012.5;

bool alertSent = false; 

// ==============================================================
// FUNCTION PROTOTYPES (PANG-FIX NG "NOT DECLARED" ERROR)
// ==============================================================
void simulateSensorData();
void updateScreen();
void hapticClick();
void checkVitalsAndAlert();
void goToDeepSleep();
void sendTelegramAlert(String message, bool isCritical);
void drawTopBar();

// ==============================================================
// DUAL CORE VARIABLES (Para walang delay ang button)
// ==============================================================
String telegramMsgToSend = "";
bool telegramCritical = false;
volatile bool telegramSendFlag = false; 
TaskHandle_t TelegramTaskHandle;

// Ito ang tatakbo sa Core 0 (Background)
void telegramTaskCode(void * pvParameters) {
  for(;;) {
    if (telegramSendFlag) {
      if (WiFi.status() == WL_CONNECTED) {
        WiFiClientSecure client;
        client.setInsecure(); 
        HTTPClient https;
        
        // --- 1. SEND KAY GIO (CHAT_ID) ---
        String url1 = "https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage?chat_id=" + CHAT_ID + "&text=" + telegramMsgToSend;
        https.begin(client, url1);
        int httpCode1 = https.GET();
        Serial.print("Sent to GIO! Code: "); Serial.println(httpCode1);
        https.end();

        // --- 2. SEND KAY JESH (CHAT_ID_2) ---
        String url2 = "https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage?chat_id=" + CHAT_ID_2 + "&text=" + telegramMsgToSend;
        https.begin(client, url2);
        int httpCode2 = https.GET();
        Serial.print("Sent to JESH! Code: "); Serial.println(httpCode2);
        https.end();
        
        // Tumunog at mag-vibrate lang kapag Critical Alert
        if (telegramCritical) {
          digitalWrite(MOTOR_PIN, HIGH);
          tone(BUZZER_PIN, 2000);
          delay(500);
          digitalWrite(MOTOR_PIN, LOW);
          noTone(BUZZER_PIN);
        }
      }
      telegramSendFlag = false; // Sabihin sa system na tapos na mag-send
    }
    vTaskDelay(10 / portTICK_PERIOD_MS); // Bigyan ng oras huminga ang Core 0
  }
}

void setup() {
  Serial.begin(115200);
  
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(MOTOR_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(MOTOR_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  esp_sleep_enable_ext0_wakeup(GPIO_NUM_4, 0); 

  display.begin(i2c_Address, true);
  
  // --- INSTANT DISPLAY ---
  simulateSensorData(); 
  updateScreen();       
  hapticClick(); 

  // --- I-SET UP ANG PANGALAWANG UTAK (Core 0) ---
  xTaskCreatePinnedToCore(
    telegramTaskCode,   
    "TelegramTask",     
    10000,              
    NULL,               
    1,                  
    &TelegramTaskHandle,
    0);                 

  // CONNECT SA WIFI SA BACKGROUND LANG
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while(digitalRead(BUTTON_PIN) == LOW) { delay(10); }
}

void loop() {
  // Laging i-check ang vitals
  checkVitalsAndAlert(); 

  // ==============================================================
  // MANUAL SERIAL INPUT
  // ==============================================================
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n'); 
    input.trim(); 
    
    if (input.length() > 1) {
      char type = input.charAt(0); 
      float val = input.substring(1).toFloat(); 

      simulateSensorData(); 
      
      if (type == 'c' || type == 'C') { 
        co2Level = val; 
        Serial.print("⚠️ TESTING: CO2 -> "); Serial.println(co2Level, 3);
      } 
      else if (type == 's' || type == 'S') { 
        spo2 = (int)val; 
        Serial.print("⚠️ TESTING: Oxygen -> "); Serial.println(spo2);
      } 
      else if (type == 'b' || type == 'B') { 
        bpm = (int)val; 
        Serial.print("⚠️ TESTING: Pulse Rate -> "); Serial.println(bpm);
      }
      
      alertSent = false;     
      checkVitalsAndAlert(); 
      updateScreen();        
    }
  }

  // ==============================================================
  // INSTANT BUTTON NAVIGATION (Walang delay dahil nasa Core 1 tayo)
  // ==============================================================
  if (digitalRead(BUTTON_PIN) == LOW) {
    if ((millis() - lastDebounceTime) > debounceDelay) {
      screenState++; 
      
      if (screenState >= 3) {
        goToDeepSleep(); 
      } else {
        simulateSensorData(); 
        checkVitalsAndAlert(); 
        updateScreen(); 
        hapticClick();  
      }
      lastDebounceTime = millis();
    }
  }
}

// ==========================================
// TELEGRAM SENDER (Ipapasang gawain sa Core 0)
// ==========================================
void sendTelegramAlert(String message, bool isCritical) {
  if (!telegramSendFlag) { 
    telegramMsgToSend = message;
    telegramCritical = isCritical;
    telegramSendFlag = true; 
  }
}

// --- SPECIFIC ALERTS & 5-SEC NORMAL UPDATE ---
void checkVitalsAndAlert() {
  String alertMsg = "";
  bool isEmergency = false;

  // 1. Check CO2 Level
  if (co2Level >= 0.10) {
    isEmergency = true;
    alertMsg += "☁️ ALERT: HIGH CO2 LEVEL\n";
    alertMsg += "CO2 Reading: " + String(co2Level, 3) + "%\n";
    alertMsg += "Interpretation: Poor air quality detected.\n";
    alertMsg += "Action: Open windows for ventilation.\n\n";
  }
  // 2. Check Oxygen
  else if (spo2 < 95) {
    isEmergency = true;
    alertMsg += "⚠️ ALERT: LOW OXYGEN\n";
    alertMsg += "SpO2 Reading: " + String(spo2) + "%\n";
    alertMsg += "Interpretation: Possible Hypoxia.\n";
    alertMsg += "Action: Wear an oxygen mask.\n\n";
  }
  // 3. Check HIGH Pulse Rate
  else if (bpm > 100) {
    isEmergency = true;
    alertMsg += "💓 ALERT: HIGH PULSE RATE\n";
    alertMsg += "Heart Rate: " + String(bpm) + " BPM\n";
    alertMsg += "Interpretation: Tachycardia.\nAction: Rest immediately.\n\n";
  }
  // 4. Check LOW Pulse Rate
  else if (bpm < 60) {
    isEmergency = true;
    alertMsg += "📉 ALERT: LOW PULSE RATE\n";
    alertMsg += "Heart Rate: " + String(bpm) + " BPM\n";
    alertMsg += "Interpretation: Bradycardia.\nAction: Seek medical attention.\n\n";
  }

  // --- KUNG MAY EMERGENCY ---
  if (isEmergency) {
    if (!alertSent) { 
      Serial.println("Triggering Emergency Alert!");
      alertMsg.replace("\n", "%0A"); 
      alertMsg.replace(" ", "%20");
      sendTelegramAlert("🚨%20CRITICAL%20WARNING!%20🚨%0A%0A" + alertMsg, true); 
      alertSent = true; 
    }
  } 
  // --- KUNG NORMAL ANG LAHAT ---
  else {
    alertSent = false; 
    
    // Mag-sesend ng update every 5 seconds
    if (millis() - lastNormalSendTime >= 10000) {
      String normalMsg = "✅ NORMAL STATUS UPDATE\n";
      normalMsg += "Heart Rate: " + String(bpm) + " BPM\n";
      normalMsg += "Oxygen: " + String(spo2) + "%\n";
      normalMsg += "CO2: " + String(co2Level, 3) + "%\n";
      normalMsg += "All vitals are stable.";

      normalMsg.replace("\n", "%0A"); 
      normalMsg.replace(" ", "%20");

      sendTelegramAlert(normalMsg, false); 
      lastNormalSendTime = millis(); 
    }
  }
}

// ==========================================
// DATA SIMULATOR & UI FUNCTIONS
// ==========================================
void simulateSensorData() {
  bpm = random(60, 90);           
  spo2 = random(96, 100);  
  co2Level = random(40, 90) / 1000.0; 
  temp = random(280, 320) / 10.0; 
  hum = random(55, 75);           
}

void drawTopBar() {
  display.setTextSize(1);
  display.setTextColor(SH110X_WHITE);
  display.setCursor(0, 0);
  display.print("HEALTH-OS");
  
  if(batteryPct == 100) { display.setCursor(75, 1); } 
  else { display.setCursor(81, 1); }
  display.print(batteryPct); display.print("%");
  
  int x = 103, y = 0;
  display.drawRect(x, y, 20, 10, SH110X_WHITE); 
  display.fillRect(x + 20, y + 3, 2, 4, SH110X_WHITE); 
  int width = map(batteryPct, 0, 100, 0, 16);
  display.fillRect(x + 2, y + 2, width, 6, SH110X_WHITE); 
  
  display.drawLine(0, 12, 128, 12, SH110X_WHITE); 
}

void updateScreen() {
  display.clearDisplay();
  drawTopBar();
  
  if (screenState == 0) {
    display.setTextSize(1);
    display.setCursor(0, 20); display.print("HEART RATE: ");
    display.setTextSize(2);
    display.setCursor(10, 32); display.print(bpm); display.print(" BPM");
    
    display.setTextSize(1);
    display.setCursor(0, 52); display.print("OXYGEN: "); 
    display.print(spo2); display.print("% SpO2");
  } 
  else if (screenState == 1) {
    display.setTextSize(1);
    display.setCursor(0, 20); display.print("CO2 LEVEL: ");
    display.setTextSize(2);
    display.setCursor(20, 32); display.print(co2Level); display.print("%");
    
    display.setTextSize(1);
    display.setCursor(25, 52);
    if (co2Level < 0.10) { display.print("[ NORMAL ]"); } 
    else { display.print("[ WARNING ]"); }
  } 
  else if (screenState == 2) {
    display.setTextSize(1);
    display.setCursor(0, 18); display.print("TEMP:  "); display.print(temp); display.print(" C");
    display.setCursor(0, 33); display.print("HUMID: "); display.print(hum); display.print(" %");
    display.setCursor(0, 48); display.print("PRESS: "); display.print(pressure); display.print(" hPa");
  }

  display.display();
}

void hapticClick() {
  digitalWrite(MOTOR_PIN, HIGH);
  tone(BUZZER_PIN, 2500);
  delay(50);
  digitalWrite(MOTOR_PIN, LOW);
  noTone(BUZZER_PIN);
}

void goToDeepSleep() {
  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(30, 25);
  display.println("SLEEP");
  display.display();
  
  digitalWrite(MOTOR_PIN, HIGH);
  tone(BUZZER_PIN, 1000); delay(150);
  tone(BUZZER_PIN, 500); delay(150);
  digitalWrite(MOTOR_PIN, LOW);
  noTone(BUZZER_PIN);
  
  display.clearDisplay();
  display.display(); 
  
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  
  esp_deep_sleep_start();
}