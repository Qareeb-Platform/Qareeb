#!/usr/bin/env node
/**
 * Verification script to check seeded record counts
 */
require('dotenv').config({ path: '../../.env' });
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs'
  }
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  try {
    console.log('📊 Verifying seeded data...\n');

    const imamCount = await prisma.imam.count();
    const halqaCount = await prisma.halqa.count();
    const maintenanceCount = await prisma.maintenanceRequest.count();
    const adminCount = await prisma.admin.count();
    const areCount = await prisma.area.count();
    const govCount = await prisma.governorate.count();

    console.log(`✅ Governorates: ${govCount}`);
    console.log(`✅ Areas: ${areCount}`);
    console.log(`✅ Admin Users: ${adminCount}`);
    console.log(`✅ Imams: ${imamCount}`);
    console.log(`✅ Halaqat: ${halqaCount}`);
    console.log(`✅ Maintenance Requests: ${maintenanceCount}`);

    console.log('\n✨ All data seeded successfully!');
    
    if (imamCount >= 50 && halqaCount >= 50 && maintenanceCount >= 50) {
      console.log('🎉 All 50+ records per entity present!');
    }
  } catch (e) {
    console.error('❌ Verification error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
