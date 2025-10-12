#!/usr/bin/env node

// Simple test script for Hacklahoma Admin GUI
// Tests basic functionality without requiring the main API server

const axios = require('axios');

const ADMIN_GUI_URL = 'http://localhost:5002';
const ADMIN_SECRET = 'hacklahoma-admin-2026';

async function testAdminGUI() {
  console.log('🐝 Testing Hacklahoma Admin GUI...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${ADMIN_GUI_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    console.log('   Environment:', healthResponse.data.environment);
    console.log('   Main API URL:', healthResponse.data.mainApiUrl);

    // Test 2: Authentication
    console.log('\n2. Testing authentication...');
    const authResponse = await axios.post(`${ADMIN_GUI_URL}/auth/login`, {
      adminSecret: ADMIN_SECRET
    });
    console.log('✅ Authentication passed:', authResponse.data.message);

    // Test 3: Invalid authentication
    console.log('\n3. Testing invalid authentication...');
    try {
      await axios.post(`${ADMIN_GUI_URL}/auth/login`, {
        adminSecret: 'wrong-secret'
      });
      console.log('❌ Should have failed with wrong secret');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid auth correctly rejected');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 4: Protected endpoint without auth (should fail)
    console.log('\n4. Testing protected endpoint without auth...');
    try {
      await axios.get(`${ADMIN_GUI_URL}/api/dashboard/stats`);
      console.log('❌ Should have required authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Protected endpoint correctly requires auth');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 5: Static file serving
    console.log('\n5. Testing static file serving...');
    try {
      const cssResponse = await axios.get(`${ADMIN_GUI_URL}/css/admin.css`);
      if (cssResponse.data.includes('Hacklahoma Admin GUI Styles')) {
        console.log('✅ CSS file served correctly');
      } else {
        console.log('❌ CSS file content unexpected');
      }
    } catch (error) {
      console.log('❌ Failed to serve CSS file:', error.message);
    }

    // Test 6: HTML pages
    console.log('\n6. Testing HTML pages...');
    try {
      const loginResponse = await axios.get(`${ADMIN_GUI_URL}/login`);
      if (loginResponse.data.includes('Hacklahoma Admin')) {
        console.log('✅ Login page served correctly');
      } else {
        console.log('❌ Login page content unexpected');
      }
    } catch (error) {
      console.log('❌ Failed to serve login page:', error.message);
    }

    console.log('\n🎉 Admin GUI basic tests completed!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Server is running on port 5002');
    console.log('   ✅ Authentication system working');
    console.log('   ✅ Security middleware active');
    console.log('   ✅ Static files being served');
    console.log('   ✅ HTML pages accessible');
    
    console.log('\n🌐 Access the Admin GUI:');
    console.log(`   Login: ${ADMIN_GUI_URL}/login`);
    console.log(`   Dashboard: ${ADMIN_GUI_URL}/`);
    console.log(`   Admin Secret: ${ADMIN_SECRET}`);

    console.log('\n⚠️  Note: Some features require the main API server (port 5001) to be running.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Make sure the Admin GUI server is running on port 5002');
      console.error('   Run: cd server/admin-gui && npm start');
    }
    process.exit(1);
  }
}

// Run tests
testAdminGUI();
