/**
 * MongoDB Seed Script — DriveVault Car Dealership System
 *
 * Populates the database with:
 *   - 1 admin user
 *   - 1 staff user
 *   - 10 vehicles (realistic make/model/price spread across all categories)
 *
 * Run with:
 *   npm run seed
 *
 * The script is idempotent — re-running it will not create duplicates.
 * Users are checked by email; vehicles are checked by VIN.
 */

import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { mongoDBClient } from '../src/infrastructure/database/mongodb.client';
import { UserModel, VehicleModel, Role, VehicleCategory, VehicleStatus, PowertrainType } from '../src/infrastructure/database/schemas';

// Load environment variables
dotenv.config();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VehicleSeedData {
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  powertrain: PowertrainType;
  price: number;
  quantity: number;
  vin: string;
  color: string;
  mileage: number;
  description: string;
  status: VehicleStatus;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Hash password using bcrypt with cost factor from environment. */
async function hashPassword(plain: string): Promise<string> {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
  return bcrypt.hash(plain, rounds);
}

// ---------------------------------------------------------------------------
// Seed data — default users (matching the .env credentials)
// ---------------------------------------------------------------------------

const DEFAULT_ADMIN = {
  email: 'admin@divi.com',
  name: 'Admin User',
  password: 'Admin@DIVI2024!',
  role: Role.ADMIN,
};

const DEFAULT_STAFF = {
  email: 'staff@divi.com',
  name: 'Staff User',
  password: 'Staff@DIVI2024!',
  role: Role.STAFF,
};

// ---------------------------------------------------------------------------
// Seed data — vehicles
// ---------------------------------------------------------------------------

const VEHICLES: VehicleSeedData[] = [
  // 1 — Sedan
  {
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    category: VehicleCategory.SEDAN,
    powertrain: PowertrainType.PETROL,
    price: 28500.00,
    quantity: 3,
    vin: '4T1BF1FK5CU123456',
    color: 'Midnight Black',
    mileage: 0,
    description:
      'The best-selling mid-size sedan in North America. ' +
      'Loaded with Toyota Safety Sense 2.5+, wireless Apple CarPlay, ' +
      'and a refined 2.5L 4-cylinder engine delivering 203 hp.',
    status: VehicleStatus.AVAILABLE,
  },

  // 2 — SUV
  {
    make: 'Ford',
    model: 'Explorer',
    year: 2023,
    category: VehicleCategory.SUV,
    powertrain: PowertrainType.PETROL,
    price: 42000.00,
    quantity: 2,
    vin: '1FM5K8D85NGA11111',
    color: 'Oxford White',
    mileage: 0,
    description:
      'Three-row SUV with available 4WD, a 2.3L EcoBoost engine, ' +
      'and Ford Co-Pilot360 driver-assist suite. ' +
      'Perfect for families who need space and capability.',
    status: VehicleStatus.AVAILABLE,
  },

  // 3 — Truck
  {
    make: 'Ford',
    model: 'F-150 XLT',
    year: 2024,
    category: VehicleCategory.TRUCK,
    powertrain: PowertrainType.PETROL,
    price: 48500.00,
    quantity: 5,
    vin: '1FTEW1EP0NFA22222',
    color: 'Agate Black',
    mileage: 0,
    description:
      "America's best-selling truck for 46 consecutive years. " +
      'Twin-turbocharged 2.7L EcoBoost V6, 325 hp, 5,000 kg tow rating, ' +
      'and an available Pro Power Onboard generator.',
    status: VehicleStatus.AVAILABLE,
  },

  // 4 — Hatchback
  {
    make: 'Honda',
    model: 'Civic Hatchback',
    year: 2023,
    category: VehicleCategory.HATCHBACK,
    powertrain: PowertrainType.PETROL,
    price: 24800.00,
    quantity: 4,
    vin: 'SHHFK7H44PU033333',
    color: 'Sonic Gray Pearl',
    mileage: 0,
    description:
      'Sporty 5-door hatch with a 1.5L turbocharged engine, ' +
      'Honda Sensing safety suite, and a roomy 25.7 cu-ft cargo area. ' +
      'Available with a 6-speed manual transmission.',
    status: VehicleStatus.AVAILABLE,
  },

  // 5 — Convertible
  {
    make: 'BMW',
    model: '430i xDrive Convertible',
    year: 2023,
    category: VehicleCategory.CONVERTIBLE,
    powertrain: PowertrainType.PETROL,
    price: 65900.00,
    quantity: 1,
    vin: 'WBA4Z1C58JEC44444',
    color: 'Brooklyn Grey Metallic',
    mileage: 1200,
    description:
      'Open-top luxury with a 2.0L TwinPower Turbo inline-4, 255 hp, ' +
      'and an 8-speed Steptronic Sport transmission. ' +
      'Heated seats, Harman Kardon surround sound, full M Sport package.',
    status: VehicleStatus.AVAILABLE,
  },

  // 6 — Coupe
  {
    make: 'BMW',
    model: 'M4 Competition',
    year: 2024,
    category: VehicleCategory.COUPE,
    powertrain: PowertrainType.PETROL,
    price: 85900.00,
    quantity: 1,
    vin: 'WBS3U9C59NF055555',
    color: 'Isle of Man Green',
    mileage: 0,
    description:
      'The pinnacle of BMW M performance. S58 3.0L inline-6 twin-turbo, ' +
      '503 hp, 0–100 km/h in 3.9 s with xDrive AWD. ' +
      'Carbon bucket seats and M Carbon ceramic brakes included.',
    status: VehicleStatus.AVAILABLE,
  },

  // 7 — Electric SUV
  {
    make: 'Tesla',
    model: 'Model Y Long Range',
    year: 2024,
    category: VehicleCategory.SUV,
    powertrain: PowertrainType.ELECTRIC,
    price: 52990.00,
    quantity: 3,
    vin: '5YJYGDEE1NF066666',
    color: 'Pearl White Multi-Coat',
    mileage: 0,
    description:
      'Dual-motor AWD electric SUV with 533 km EPA range, ' +
      '0–100 km/h in 4.8 s, and over-the-air software updates. ' +
      'Includes Tesla Autopilot and a 15.4" touchscreen.',
    status: VehicleStatus.AVAILABLE,
  },

  // 8 — Hybrid SUV
  {
    make: 'Toyota',
    model: 'RAV4 Hybrid',
    year: 2024,
    category: VehicleCategory.SUV,
    powertrain: PowertrainType.HYBRID,
    price: 38700.00,
    quantity: 4,
    vin: '2T3RWRFV8PW077777',
    color: 'Magnetic Gray Metallic',
    mileage: 0,
    description:
      'The top-selling hybrid SUV. 2.5L 4-cylinder + dual electric motors, ' +
      '219 combined hp, AWD standard, and 38 mpg city. ' +
      'Toyota Safety Sense 2.0 across all trims.',
    status: VehicleStatus.AVAILABLE,
  },

  // 9 — Van
  {
    make: 'Mercedes-Benz',
    model: 'Sprinter 2500',
    year: 2023,
    category: VehicleCategory.VAN,
    powertrain: PowertrainType.DIESEL,
    price: 58000.00,
    quantity: 2,
    vin: 'WD4PF1CD4KP088888',
    color: 'Arctic White',
    mileage: 0,
    description:
      'High-roof cargo van with a 2.0L turbocharged 4-cylinder, ' +
      '188 hp, and 270 cu-ft of cargo space. ' +
      'Ideal for fleet operators and conversion builds. ' +
      'MBUX infotainment and 360-degree camera standard.',
    status: VehicleStatus.AVAILABLE,
  },

  // 10 — Motorcycle
  {
    make: 'Harley-Davidson',
    model: 'Street Glide Special',
    year: 2024,
    category: VehicleCategory.MOTORCYCLE,
    powertrain: PowertrainType.PETROL,
    price: 27999.00,
    quantity: 2,
    vin: '1HD1KHK16PB099999',
    color: 'Vivid Black',
    mileage: 0,
    description:
      'Milwaukee-Eight 117 V-twin engine, 6-speed transmission, ' +
      'and a BOOM! Box GTS infotainment system with 6.5" touchscreen. ' +
      'Chrome highlights, reflex linked Brembo brakes, and a ' +
      'blacked-out powertrain for an aggressive stance.',
    status: VehicleStatus.AVAILABLE,
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('🌱  Starting MongoDB database seed...\n');

  try {
    // Connect to MongoDB
    await mongoDBClient.connect();

    // ── 1. Admin user ──────────────────────────────────────────────────────
    const adminExists = await UserModel.findOne({ email: DEFAULT_ADMIN.email });
    if (!adminExists) {
      const hashedAdminPassword = await hashPassword(DEFAULT_ADMIN.password);
      await UserModel.create({
        email: DEFAULT_ADMIN.email,
        name: DEFAULT_ADMIN.name,
        password: hashedAdminPassword,
        role: DEFAULT_ADMIN.role,
        isActive: true,
      });
      console.log(`✅  Admin user created: ${DEFAULT_ADMIN.email}`);
    } else {
      console.log(`⏭️   Admin user already exists: ${DEFAULT_ADMIN.email}`);
    }

    // ── 2. Staff user ──────────────────────────────────────────────────────
    const staffExists = await UserModel.findOne({ email: DEFAULT_STAFF.email });
    if (!staffExists) {
      const hashedStaffPassword = await hashPassword(DEFAULT_STAFF.password);
      await UserModel.create({
        email: DEFAULT_STAFF.email,
        name: DEFAULT_STAFF.name,
        password: hashedStaffPassword,
        role: DEFAULT_STAFF.role,
        isActive: true,
      });
      console.log(`✅  Staff user created: ${DEFAULT_STAFF.email}`);
    } else {
      console.log(`⏭️   Staff user already exists: ${DEFAULT_STAFF.email}`);
    }

    console.log(''); // Empty line for readability

    // ── 3. Vehicles ────────────────────────────────────────────────────────
    let seededCount = 0;
    let skippedCount = 0;

    for (const v of VEHICLES) {
      const vehicleExists = await VehicleModel.findOne({ vin: v.vin });
      
      if (!vehicleExists) {
        await VehicleModel.create({
          make: v.make,
          model: v.model,
          year: v.year,
          category: v.category,
          powertrain: v.powertrain,
          price: v.price,
          quantity: v.quantity,
          vin: v.vin,
          color: v.color,
          mileage: v.mileage,
          description: v.description,
          status: v.status,
          imageUrls: [],
        });
        
        seededCount++;
        console.log(
          `✅  Vehicle ${String(seededCount).padStart(2, '0')}: ` +
          `${v.year} ${v.make} ${v.model} — $${v.price.toFixed(2)}`
        );
      } else {
        skippedCount++;
        console.log(
          `⏭️   Vehicle already exists: ${v.year} ${v.make} ${v.model} (VIN: ${v.vin})`
        );
      }
    }

    console.log(
      `\n🎉  Seed complete: 2 users + ${seededCount} new vehicles ` +
      `(${skippedCount} vehicles already existed).`
    );

  } catch (error) {
    console.error('❌  Seed failed:', error);
    throw error;
  } finally {
    await mongoDBClient.disconnect();
  }
}

// Execute seed script
main()
  .then(() => {
    console.log('\n👋  Disconnected from MongoDB. Seed script completed successfully.');
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error('\n💥  Fatal error during seed:', error);
    process.exit(1);
  });
