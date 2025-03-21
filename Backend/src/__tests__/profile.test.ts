import request from 'supertest';
import app from '../app';
import User from '../models/userModel';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';

describe('Profile Update Tests', () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    // Create a test user and get token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!',
        confirmPassword: 'Test123!'
      });

    token = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    // Clean up test user
    await User.findByIdAndDelete(userId);
  });

  describe('PUT /api/users/profile', () => {
    it('should update profile with text data', async () => {
      const profileData = {
        name: 'Test User',
        bio: 'Test bio',
        phoneNumber: '+94771234567',
        location: 'Colombo',
        specialization: 'Fashion Design',
        socialLinks: {
          instagram: 'https://instagram.com/test',
          linkedin: 'https://linkedin.com/test',
          website: 'https://test.com'
        }
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(profileData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.profile.name).toBe(profileData.name);
      expect(response.body.profile.bio).toBe(profileData.bio);
    });

    it('should update profile picture', async () => {
      const testImagePath = path.join(__dirname, 'test-image.jpg');
      
      // Create a test image if it doesn't exist
      await fs.writeFile(testImagePath, 'test image content');

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .attach('profilePicture', testImagePath);

      // Clean up test image
      await fs.unlink(testImagePath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.profile.profilePictureUrl).toMatch(/^https?:\/\/.+/);
    });

    it('should reject invalid image files', async () => {
      const testFilePath = path.join(__dirname, 'test.txt');
      
      // Create a test text file
      await fs.writeFile(testFilePath, 'not an image');

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .attach('profilePicture', testFilePath);

      // Clean up test file
      await fs.unlink(testFilePath);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate phone number format', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          phoneNumber: 'invalid-phone'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/phone number/i);
    });

    it('should validate bio length', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bio: 'a'.repeat(501)
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/bio.*500 characters/i);
    });

    it('should validate social links', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          socialLinks: {
            instagram: 'not-a-url',
            linkedin: 'not-a-url',
            website: 'not-a-url'
          }
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/url/i);
    });
  });
}); 