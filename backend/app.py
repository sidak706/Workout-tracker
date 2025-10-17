from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Allow frontend (HTML) to make requests
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# --- Database model ---
class Workout(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    exercise = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    reps = db.Column(db.Integer, nullable=False)
    sets = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "exercise": self.exercise,
            "date": self.date,
            "reps": self.reps,
            "sets": self.sets,
            "weight": self.weight
        }

# --- Routes ---
@app.route("/add_workout", methods=["POST"])
def add_workout():
    data = request.get_json()
    new_entry = Workout(
        exercise=data.get("exercise"),
        date=data.get("date"),
        reps=data.get("reps"),
        sets=data.get("sets"),
        weight=data.get("weight")
    )
    db.session.add(new_entry)
    db.session.commit()
    return jsonify({"message": "Workout added successfully"}), 201

@app.route("/get_workouts", methods=["GET"])
def get_workouts():
    workouts = Workout.query.all()
    return jsonify([w.to_dict() for w in workouts])

@app.route("/delete_workout/<int:id>", methods=["DELETE"])
def delete_workout(id):
    workout = Workout.query.get(id)
    if workout:
        db.session.delete(workout)
        db.session.commit()
        return jsonify({"message": "Workout deleted"}), 200
    return jsonify({"error": "Workout not found"}), 404

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
