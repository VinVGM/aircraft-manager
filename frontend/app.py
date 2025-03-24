from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import random
import string
from datetime import datetime
import uuid
import threading
import time
import os
import heapq
from collections import defaultdict

app = Flask(__name__)
CORS(app)

# Organized storage by aircraft status
aircraft_by_id = {}  # Quick lookup by ID
ground_aircraft = []  # Min heap for ground aircraft (by creation time)
airborne_aircraft = []  # Min heap for airborne aircraft (by distance)
emergency_ground = []  # Min heap for emergency ground aircraft
emergency_airborne = []  # Min heap for emergency airborne aircraft
runway = None  # Current aircraft using runway

class Aircraft:
    def __init__(self, flight_number, distance, is_ground=False, is_emergency=False):
        self.id = str(uuid.uuid4())
        self.flight_number = flight_number
        self.distance = distance
        self.status = 'ground' if is_ground else 'in_air'
        self.created_at = datetime.utcnow().timestamp()  # Use timestamp for heap comparison
        self.speed = round(random.uniform(0.1, 0.3), 2)
        self.takeoff_start_time = None
        self.landing_start_time = None
        self.is_emergency = is_emergency
        self.flight_number = f"EMG{flight_number}" if is_emergency else flight_number
        self.going_around = False
    
    def __lt__(self, other):
        # For ground aircraft, priority by creation time
        if self.status == 'ground' and other.status == 'ground':
            return self.created_at < other.created_at
        # For airborne aircraft, priority by distance
        return self.distance < other.distance

    def to_dict(self):
        return {
            'id': self.id,
            'flight_number': self.flight_number,
            'distance': round(self.distance, 2),
            'status': self.status,
            'created_at': datetime.fromtimestamp(self.created_at).isoformat(),
            'speed': self.speed,
            'is_emergency': self.is_emergency,
            'going_around': self.going_around,
            'landing_start_time': self.landing_start_time,
            'takeoff_start_time': self.takeoff_start_time
        }

def update_distances():
    global runway
    
    while True:
        # Update all airborne aircraft distances
        updated_airborne = []
        while airborne_aircraft:
            aircraft = heapq.heappop(airborne_aircraft)
            if aircraft.id in aircraft_by_id:  # Ensure aircraft still exists
                aircraft.distance = max(0, aircraft.distance - aircraft.speed)
                heapq.heappush(updated_airborne, aircraft)
        
        # Same for emergency airborne
        updated_emergency_airborne = []
        while emergency_airborne:
            aircraft = heapq.heappop(emergency_airborne)
            if aircraft.id in aircraft_by_id:
                aircraft.distance = max(0, aircraft.distance - aircraft.speed)
                heapq.heappush(updated_emergency_airborne, aircraft)
        
        # Replace the heaps with updated ones
        airborne_aircraft.extend(updated_airborne)
        emergency_airborne.extend(updated_emergency_airborne)
        
        # Process runway operations
        if runway:
            # Runway is in use, nothing to do
            pass
        else:
            # Handle emergency landing (highest priority)
            if emergency_airborne and emergency_airborne[0].distance <= 5:
                aircraft = emergency_airborne[0]
                
                # Force other aircraft to go around
                for heap in [airborne_aircraft]:
                    updated = []
                    while heap:
                        other = heapq.heappop(heap)
                        if other.distance <= 5 and other.id != aircraft.id:
                            other.distance += 5
                            other.going_around = True
                        heapq.heappush(updated, other)
                    heap.extend(updated)
                
                # Land the emergency aircraft
                aircraft = heapq.heappop(emergency_airborne)
                aircraft.status = 'landing'
                aircraft.landing_start_time = time.time()
                runway = aircraft
                threading.Timer(5.0, complete_landing, args=[aircraft.id]).start()
            
            # Handle normal landing
            elif (airborne_aircraft and airborne_aircraft[0].distance <= 2 and 
                  not emergency_airborne and not emergency_ground):
                aircraft = heapq.heappop(airborne_aircraft)
                aircraft.status = 'landing'
                aircraft.landing_start_time = time.time()
                runway = aircraft
                threading.Timer(5.0, complete_landing, args=[aircraft.id]).start()
            
            # Handle emergency takeoff
            elif emergency_ground:
                aircraft = heapq.heappop(emergency_ground)
                aircraft.status = 'takeoff'
                aircraft.takeoff_start_time = time.time()
                runway = aircraft
                threading.Timer(5.0, complete_takeoff, args=[aircraft.id]).start()
            
            # Handle normal takeoff (if no emergency ground aircraft and no aircraft near runway)
            elif (ground_aircraft and not emergency_ground and 
                  not any(a.distance <= 2 for heap in [airborne_aircraft, emergency_airborne] for a in heap)):
                aircraft = heapq.heappop(ground_aircraft)
                aircraft.status = 'takeoff'
                aircraft.takeoff_start_time = time.time()
                runway = aircraft
                threading.Timer(5.0, complete_takeoff, args=[aircraft.id]).start()
        
        time.sleep(1)

def complete_landing(aircraft_id):
    global runway
    if aircraft_id in aircraft_by_id:
        del aircraft_by_id[aircraft_id]
    runway = None

def complete_takeoff(aircraft_id):
    global runway
    if aircraft_id in aircraft_by_id:
        del aircraft_by_id[aircraft_id]
    runway = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/aircraft', methods=['GET'])
def get_aircraft():
    return jsonify([a.to_dict() for a in aircraft_by_id.values()])

@app.route('/api/aircraft', methods=['POST'])
def add_aircraft():
    flight_number = generate_flight_number()
    is_ground = request.json.get('is_ground', False)
    is_emergency = request.json.get('is_emergency', False)
    
    if is_ground:
        aircraft = Aircraft(flight_number=flight_number, distance=0, is_ground=True, is_emergency=is_emergency)
        if is_emergency:
            heapq.heappush(emergency_ground, aircraft)
        else:
            heapq.heappush(ground_aircraft, aircraft)
    else:
        distance = round(random.uniform(3, 10), 2)
        aircraft = Aircraft(flight_number=flight_number, distance=distance, is_emergency=is_emergency)
        if is_emergency:
            heapq.heappush(emergency_airborne, aircraft)
        else:
            heapq.heappush(airborne_aircraft, aircraft)
    
    aircraft_by_id[aircraft.id] = aircraft
    return jsonify(aircraft.to_dict())