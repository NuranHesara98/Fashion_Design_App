from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from datetime import datetime

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fashion_design.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this to a secure secret key

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# User Profile Model
class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    bio = db.Column(db.Text)
    profile_picture_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# User Profile Routes
@app.route('/users/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    try:
        # Get user_id from JWT token
        current_user_id = get_jwt_identity()
        
        # Query the user profile
        user_profile = UserProfile.query.get(current_user_id)
        
        if not user_profile:
            return jsonify({'error': 'User profile not found'}), 404
            
        # Format response
        profile_data = {
            'id': user_profile.id,
            'name': user_profile.name,
            'bio': user_profile.bio,
            'profile_picture_url': user_profile.profile_picture_url,
            'created_at': user_profile.created_at.isoformat(),
            'updated_at': user_profile.updated_at.isoformat()
        }
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
