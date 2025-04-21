from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import random
import string
from datetime import datetime
from typing import List, Dict
import uuid
import threading
import time

app = Flask(__name__)
CORS(app)  


aircraft_list: List[Dict] = []

class Aircraft:
    def __init__(self, flight_number: str, distance: float, is_ground: bool = False, is_emergency: bool = False):
        self.id = str(uuid.uuid4())
        self.flight_number = flight_number
        self.distance = distance
        self.status = 'ground' if is_ground else 'in_air'
        self.created_at = datetime.utcnow()
        self.speed = round(random.uniform(0.1, 0.3), 2)  
        self.takeoff_start_time = None  
        self.landing_start_time = None  
        self.is_emergency = is_emergency
        self.flight_number = f"EMG{flight_number}" if is_emergency else flight_number
        self.going_around = False  

    def to_dict(self):
        return {
            'id': self.id,
            'flight_number': self.flight_number,
            'distance': round(self.distance, 2),
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'speed': self.speed,
            'is_emergency': self.is_emergency,
            'going_around': self.going_around,
            'landing_start_time': self.landing_start_time,
            'takeoff_start_time': self.takeoff_start_time
        }

def generate_flight_number():
    airline_codes = ['AA', 'BA', 'DL', 'UA', 'LH']
    airline = random.choice(airline_codes)
    number = ''.join(random.choices(string.digits, k=4))
    return f"{airline}{number}"

def update_distances():
    while True:
        
        runway_in_use = any(a.status == 'landing' or a.status == 'takeoff' for a in aircraft_list)
        aircraft_near_runway = any(a.status == 'in_air' and a.distance <= 2 for a in aircraft_list)
        
       
        emergency_aircraft_near = any(a.status == 'in_air' and a.is_emergency and a.distance <= 5 for a in aircraft_list)
        
       
        emergency_ground_aircraft = any(a.status == 'ground' and a.is_emergency for a in aircraft_list)
        
        for aircraft in aircraft_list:
            if aircraft.status == 'in_air':
               
                aircraft.distance = max(0, aircraft.distance - aircraft.speed)
                
                
                if aircraft.is_emergency and aircraft.distance <= 5:
                   
                    for other in aircraft_list:
                        if (other.status == 'in_air' and 
                            not other.is_emergency and 
                            other.distance <= 5 and 
                            other.id != aircraft.id):
                            other.distance += 5  
                            other.going_around = True
                    
                    
                    aircraft.status = 'landing'
                    aircraft.landing_start_time = time.time()
                    threading.Timer(5.0, complete_landing, args=[aircraft.id]).start()
                    break
                
                elif aircraft.distance <= 2 and not runway_in_use and not emergency_aircraft_near and not emergency_ground_aircraft:
                    aircraft.status = 'landing'
                    aircraft.landing_start_time = time.time()
                    threading.Timer(5.0, complete_landing, args=[aircraft.id]).start()
                    break
               
                elif aircraft.distance <= 2 and emergency_ground_aircraft and not aircraft.is_emergency:
                    aircraft.distance += 5
                    aircraft.going_around = True
            
       
            elif aircraft.status == 'ground' and not runway_in_use and not aircraft_near_runway:
               
                if aircraft.is_emergency:
                    aircraft.status = 'takeoff'
                    aircraft.takeoff_start_time = time.time()
                    threading.Timer(5.0, complete_takeoff, args=[aircraft.id]).start()
                    break
                elif not any(a.status == 'ground' and a.is_emergency for a in aircraft_list):
                    aircraft.status = 'takeoff'
                    aircraft.takeoff_start_time = time.time()
                    threading.Timer(5.0, complete_takeoff, args=[aircraft.id]).start()
                    break
        
        time.sleep(1)  

def complete_landing(aircraft_id: str):
    global aircraft_list
    aircraft_list = [a for a in aircraft_list if a.id != aircraft_id]

def complete_takeoff(aircraft_id: str):
    global aircraft_list
    aircraft_list = [a for a in aircraft_list if a.id != aircraft_id]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/aircraft', methods=['GET'])
def get_aircraft():
    return jsonify([a.to_dict() for a in aircraft_list])

@app.route('/api/aircraft', methods=['POST'])
def add_aircraft():
    flight_number = generate_flight_number()
    is_ground = request.json.get('is_ground', False)
    is_emergency = request.json.get('is_emergency', False)
    
    if is_ground:
        aircraft = Aircraft(flight_number=flight_number, distance=0, is_ground=True, is_emergency=is_emergency)
    else:
        distance = round(random.uniform(3, 10), 2)  
        aircraft = Aircraft(flight_number=flight_number, distance=distance, is_emergency=is_emergency)
    
    aircraft_list.append(aircraft)
    return jsonify(aircraft.to_dict())

if __name__ == '__main__':
   
    distance_thread = threading.Thread(target=update_distances, daemon=True)
    distance_thread.start()
    
    app.run(debug=True) 