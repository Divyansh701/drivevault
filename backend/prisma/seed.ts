/**
 * Prisma Seed Script — Car Dealership Inventory System
 *
 * Populates the database with:
 *   - 1 admin user  (credentials read from environment — never hardcoded)
 *   - 10 vehicles   (realistic make/model/price spread across all categories)
 *
 * Run with:
 *   npx prisma db seed
 *
 * Required environment variables (set in .env before running):
 *   SEED_ADMIN_EMAIL    — admin login address
 *   SEED_ADMIN_NAME     — display name
 *   SEED_ADMIN_PASSWORD — raw password (will be hashed before insert)
 *
 * The script is idempotent — re-running it will not create duplicates.
 * Users are upserted on email; vehicles are upserted on VIN.
 * All vehicle inserts are wrapped in a single transaction for atomicity.
 */

import { Role, VehicleCategory, VehicleStatus, PowertrainType } from '@prisma/client';
import bcrypt from 'bcrypt';
// Fix ISSUE-02: import the shared singleton instead of instantiating a
// second PrismaClient (which would open a second connection pool).
import prisma from '../src/infrastructure/database/prisma.client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// Fix ISSUE-10: explicit interface instead of `as const` — the narrowed
// literal types produced by `as const` conflict with Prisma's input types.
interface VehicleSeedData {
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  powertrain: PowertrainType;  // Fix G: field added to match updated schema
  price: string;               // Prisma accepts string for Decimal fields
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

/** Wraps bcrypt so the cost factor is consistent and changeable in one place. */
async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

// ---------------------------------------------------------------------------
// Seed data — admin user read from environment (Fix ISSUE-01)
// ---------------------------------------------------------------------------

function getAdminCredentials(): { email: string; name: string; password: string } {
  const email    = process.env.SEED_ADMIN_EMAIL;
  const name     = process.env.SEED_ADMIN_NAME;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !name || !password) {
    throw new Error(
      'Missing seed credentials. Set SEED_ADMIN_EMAIL, SEED_ADMIN_NAME, ' +
      'and SEED_ADMIN_PASSWORD in your .env file before running the seed.',
    );
  }

  return { email, name, password };
}

// ---------------------------------------------------------------------------
// Seed data — vehicles
// ---------------------------------------------------------------------------

// Fix ISSUE-04: ELECTRIC and HYBRID are removed from VehicleCategory.
// They are powertrains, not body styles. Those vehicles are now correctly
// categorised by body style (SUV/HATCHBACK/etc.) and will carry a
// powertrain field once the schema migration adds PowertrainType.
const VEHICLES: VehicleSeedData[] = [
  // 1 — Sedan
  {
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    category: VehicleCategory.SEDAN,
    powertrain: PowertrainType.PETROL,
    price: '28500.00',
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
    price: '42000.00',
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
    price: '48500.00',
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
    price: '24800.00',
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
    price: '65900.00',
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
    price: '85900.00',
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

  // 7 — Electric SUV (Fix ISSUE-04: was ELECTRIC, correctly SUV body style)
  {
    make: 'Tesla',
    model: 'Model Y Long Range',
    year: 2024,
    category: VehicleCategory.SUV,
    powertrain: PowertrainType.ELECTRIC,
    price: '52990.00',
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

  // 8 — Hybrid SUV (Fix ISSUE-04: was HYBRID, correctly SUV body style)
  {
    make: 'Toyota',
    model: 'RAV4 Hybrid',
    year: 2024,
    category: VehicleCategory.SUV,
    powertrain: PowertrainType.HYBRID,
    price: '38700.00',
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
    price: '58000.00',
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
    price: '27999.00',
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
  console.log('🌱  Starting database seed...\n');

  // ── 1. Admin user ──────────────────────────────────────────────────────────
  // Fix ISSUE-01: credentials come from env, raw password is never logged.
  const admin = getAdminCredentials();
  const hashed = await hashPassword(admin.password);

  await prisma.user.upsert({
    where:  { email: admin.email },
    update: {},                    // Never overwrite an existing admin record
    create: {
      email:    admin.email,
      name:     admin.name,
      password: hashed,
      role:     Role.ADMIN,
    },
  });

  // Only the email is logged — never the password (Fix ISSUE-01)
  console.log(`✅  Admin user seeded: ${admin.email}\n`);

  // ── 2. Vehicles — wrapped in a transaction (Fix ISSUE-05) ─────────────────
  // All-or-nothing: if any upsert fails the entire batch is rolled back,
  // leaving the database in a clean state for the next seed attempt.
  let seededCount = 0;

  await prisma.$transaction(async (tx) => {
    for (const v of VEHICLES) {
      await tx.vehicle.upsert({
        where:  { vin: v.vin },
        update: {},                // Idempotent — skip if already exists
        create: {
          make:        v.make,
          model:       v.model,
          year:        v.year,
          category:    v.category,
          price:       v.price,
          quantity:    v.quantity,
          vin:         v.vin,
          color:       v.color,
          mileage:     v.mileage,
          description: v.description,
          status:      v.status,
        },
      });

      seededCount++;
      console.log(
        `✅  Vehicle ${String(seededCount).padStart(2, '0')}: ` +
        `${v.year} ${v.make} ${v.model} — $${v.price}`,
      );
    }
  });

  console.log(`\n🎉  Seed complete: 1 admin user + ${seededCount} vehicles.`);
}

main()
  .catch((error: unknown) => {
    console.error('❌  Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
